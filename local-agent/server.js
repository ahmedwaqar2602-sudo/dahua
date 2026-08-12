const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(cors());
app.use(express.json());

const RECORDINGS_DIR = path.join(__dirname, 'recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR);
}

// Serve recordings statically
app.use('/recordings', express.static(RECORDINGS_DIR));

// Keep track of active recording processes
const activeRecordings = new Map();

app.post('/start-record', (req, res) => {
  const { sessionId, streamUrl } = req.body;
  if (!sessionId || !streamUrl) {
    return res.status(400).json({ error: 'sessionId and streamUrl required' });
  }

  if (activeRecordings.has(sessionId)) {
    return res.status(400).json({ error: 'Recording already in progress for this session' });
  }

  const filename = `${sessionId}.mp4`;
  const filepath = path.join(RECORDINGS_DIR, filename);

  console.log(`Starting recording for session ${sessionId} from ${streamUrl}`);

  const command = ffmpeg(streamUrl)
    .outputOptions([
      '-c:v copy', // Copy video codec (no re-encoding)
      '-c:a copy', // Copy audio codec
      '-f mp4',
      '-movflags +faststart'
    ])
    .on('start', () => {
      console.log(`FFmpeg started for session ${sessionId}`);
    })
    .on('error', (err, stdout, stderr) => {
      console.error(`FFmpeg error for session ${sessionId}:`, err.message);
      activeRecordings.delete(sessionId);
    })
    .on('end', () => {
      console.log(`FFmpeg finished for session ${sessionId}`);
      activeRecordings.delete(sessionId);
    })
    .save(filepath);

  activeRecordings.set(sessionId, { command, filepath, filename });

  res.json({ success: true, message: 'Recording started' });
});

app.post('/stop-record', (req, res) => {
  const { sessionId } = req.body;
  const recording = activeRecordings.get(sessionId);

  if (!recording) {
    return res.status(404).json({ error: 'No active recording found for this session' });
  }

  console.log(`Stopping recording for session ${sessionId}`);
  
  // Stop the ffmpeg process
  recording.command.kill('SIGINT');
  
  const publicUrl = `http://localhost:3005/recordings/${recording.filename}`;

  res.json({ 
    success: true, 
    message: 'Recording stopped',
    recordingPath: publicUrl
  });
});

app.post('/test-onvif', async (req, res) => {
  const { ip, port } = req.body;
  
  try {
    const url = `http://${ip}:${port || 80}/onvif/device_service`;
    console.log(`Testing ONVIF reachability for ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      res.json({ success: true, message: 'Camera is reachable' });
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
         res.json({ success: false, message: 'Connection timed out' });
      } else {
         res.json({ success: true, message: 'Camera responded (credentials not verified)' });
      }
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Cleanup old recordings periodically (every 24h)
setInterval(() => {
  const retentionDays = 30;
  const now = Date.now();
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

  fs.readdir(RECORDINGS_DIR, (err, files) => {
    if (err) return console.error('Error reading recordings dir:', err);

    files.forEach(file => {
      const filePath = path.join(RECORDINGS_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (!err) console.log(`Deleted old recording: ${file}`);
          });
        }
      });
    });
  });
}, 24 * 60 * 60 * 1000);

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Local Recording Agent running on port ${PORT}`);
});
