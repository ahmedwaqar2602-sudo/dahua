const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const app = express();
app.use(cors());

const PORT = 4000;
const RECORDINGS_DIR = path.join(__dirname, 'archives');

// Ensure recordings directory exists
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

const activeRecordings = {};

function startRecording(cameraName) {
  if (activeRecordings[cameraName]) return;
  console.log(`[DVR] Starting continuous recording for ${cameraName}`);
  
  const cameraDir = path.join(RECORDINGS_DIR, cameraName);
  if (!fs.existsSync(cameraDir)) fs.mkdirSync(cameraDir, { recursive: true });

  const rtspUrl = `http://localhost:1984/api/stream.mp4?src=${cameraName}`;
  
  const args = [
    '-i', rtspUrl,
    '-c', 'copy',
    '-f', 'segment',
    '-segment_time', '3600',
    '-reset_timestamps', '1',
    '-strftime', '1',
    path.join(cameraDir, '%Y-%m-%dT%H-%M-%S.mp4')
  ];

  const ffmpegProcess = spawn('ffmpeg', args);

  ffmpegProcess.stderr.on('data', (data) => {
    // Optionally log stderr
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`[DVR] Recording process for ${cameraName} exited with code ${code}`);
    delete activeRecordings[cameraName];
    setTimeout(() => startRecording(cameraName), 10000);
  });

  activeRecordings[cameraName] = ffmpegProcess;
}

startRecording('dahua_cam');
startRecording('ezviz_cam');

// API: Get Continuous Archives
app.get('/api/dvr/continuous', (req, res) => {
  const camera = req.query.camera || 'dahua_cam';
  const cameraDir = path.join(RECORDINGS_DIR, camera);
  
  if (!fs.existsSync(cameraDir)) {
    return res.json({ success: true, files: [] });
  }

  const files = fs.readdirSync(cameraDir)
    .filter(f => f.endsWith('.mp4'))
    .sort()
    .reverse()
    .map(f => {
      const stat = fs.statSync(path.join(cameraDir, f));
      return {
        name: f,
        size: stat.size,
        timestamp: stat.mtime,
        url: `http://localhost:${PORT}/api/dvr/play/${camera}/${f}`
      };
    });

  res.json({ success: true, files });
});

// API: Play Raw File directly
app.get('/api/dvr/play/:camera/:filename', (req, res) => {
  const { camera, filename } = req.params;
  const filePath = path.join(RECORDINGS_DIR, camera, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// API: Extract User Session
app.get('/api/dvr/extract', (req, res) => {
  const startIso = req.query.start;
  const endIso = req.query.end;
  const camera = req.query.camera || 'dahua_cam';

  if (!startIso || !endIso) {
    return res.status(400).json({ error: 'Missing timestamps' });
  }

  const cameraDir = path.join(RECORDINGS_DIR, camera);
  if (!fs.existsSync(cameraDir)) {
    return res.status(404).json({ error: 'No recordings found' });
  }

  const files = fs.readdirSync(cameraDir).filter(f => f.endsWith('.mp4')).sort();
  if (files.length === 0) {
    return res.status(404).json({ error: 'No recordings available' });
  }

  const startTime = new Date(startIso).getTime();
  const endTime = new Date(endIso).getTime();
  const duration = Math.max(1, (endTime - startTime) / 1000);

  let targetFile = files[files.length - 1]; 
  let chunkStartTime = 0;
  for (let i = 0; i < files.length; i++) {
    const stat = fs.statSync(path.join(cameraDir, files[i]));
    const mtime = stat.mtimeMs; 
    if (mtime > startTime) {
      targetFile = files[i];
      chunkStartTime = mtime - 3600000;
      break;
    }
  }

  const offset = Math.max(0, (startTime - chunkStartTime) / 1000);
  const inputFilePath = path.join(cameraDir, targetFile);

  console.log(`[DVR API] Streaming extracted session for ${camera} from offset ${offset} for ${duration}s`);
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Connection': 'keep-alive',
    'Accept-Ranges': 'bytes'
  });

  const ffmpegCmd = [
    'ffmpeg',
    '-y',
    '-ss', offset.toString(),
    '-t', duration.toString(),
    '-i', inputFilePath,
    '-c', 'copy',
    '-movflags', 'frag_keyframe+empty_moov',
    '-f', 'mp4',
    'pipe:1'
  ];

  const ffmpeg = spawn(ffmpegCmd[0], ffmpegCmd.slice(1));
  
  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on('data', (data) => {
    // console.log(`ffmpeg err: ${data}`);
  });

  req.on('close', () => {
    ffmpeg.kill('SIGKILL');
  });
});

app.listen(PORT, () => {
  console.log(`[DVR] Express Server running at http://localhost:${PORT}`);
  
  // Cleanup files older than 7 days
  setInterval(() => {
    try {
      const now = Date.now();
      fs.readdirSync(RECORDINGS_DIR).forEach(camera => {
        const cameraDir = path.join(RECORDINGS_DIR, camera);
        if (fs.statSync(cameraDir).isDirectory()) {
          fs.readdirSync(cameraDir).forEach(file => {
            const filePath = path.join(cameraDir, file);
            if (now - fs.statSync(filePath).mtimeMs > 7 * 24 * 60 * 60 * 1000) {
              fs.unlinkSync(filePath);
              console.log(`[DVR] Deleted old archive file: ${filePath}`);
            }
          });
        }
      });
    } catch(err) {
      console.error('[DVR] Cleanup error:', err);
    }
  }, 3600000);
});
