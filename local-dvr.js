const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve actual clips from the local-agent clips directory
const CLIPS_DIR = path.join(__dirname, 'clips');
app.use('/clips', express.static(CLIPS_DIR));

// Helper: map camera name to ID by calling backend (or just checking clips directory)
// For simplicity, we just look at the directories inside CLIPS_DIR to find a match.
// In local-agent.js, the clip directory is named after cam.id (which is usually an integer).
async function getCameraId(camParam) {
  try {
    const res = await fetch('http://localhost:8787/api/admin/cameras');
    const data = await res.json();
    if (data.success) {
      const cam = data.cameras.find(c => c.name === camParam || String(c.id) === camParam);
      return cam ? String(cam.id) : camParam;
    }
  } catch (e) {}
  return camParam; // Fallback
}

app.get('/api/dvr/continuous', async (req, res) => {
  const camParam = req.query.cameraId || req.query.camera;
  const dateStr = req.query.date; // e.g. "today"
  
  if (!camParam) {
    return res.json({ success: false, error: 'Camera parameter required' });
  }

  const camId = await getCameraId(camParam);
  const camDir = path.join(CLIPS_DIR, camId);

  let segments = [];
  let files = [];

  if (fs.existsSync(camDir)) {
    const allFiles = fs.readdirSync(camDir).filter(f => f.endsWith('.mp4')).sort((a, b) => b.localeCompare(a)); // Descending

    for (const file of allFiles) {
      // Filename format: YYYYMMDD_HHMMSS.mp4
      const match = file.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
      if (match) {
        const [_, y, m, d, H, M, S] = match;
        const ts = new Date(`${y}-${m}-${d}T${H}:${M}:${S}.000Z`).getTime(); // assuming UTC for strftime
        
        files.push({
          timestamp: ts,
          url: `http://localhost:4000/clips/${camId}/${file}`
        });

        // Add to segments for timeline UI blocks
        segments.push({
          start: `${H}:${M}`,
          end: `${String(Number(H) + (Number(M) + 3 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((Number(M) + 3) % 60).padStart(2, '0')}`,
          status: 'recorded'
        });
      }
    }
  }

  // Deduplicate overlapping segments roughly
  const dedupSegs = [];
  const seen = new Set();
  for (const s of segments) {
    const key = s.start + '-' + s.end;
    if (!seen.has(key)) {
      seen.add(key);
      dedupSegs.push(s);
    }
  }

  res.json({ success: true, cameraId: camParam, date: dateStr, segments: dedupSegs, files });
});

app.post('/api/dvr/extract', async (req, res) => {
  const { cameraId, start, end, userLabel } = req.body;
  console.log(`[DVR] Extracting video for ${cameraId} from ${start} to ${end} requested by ${userLabel}`);
  
  const camId = await getCameraId(cameraId);
  const camDir = path.join(CLIPS_DIR, camId);

  let downloadUrl = null;

  if (fs.existsSync(camDir)) {
    const allFiles = fs.readdirSync(camDir).filter(f => f.endsWith('.mp4')).sort(); // Ascending
    // Find the file that falls within the start/end window
    const startTime = new Date(start).getTime();
    
    for (const file of allFiles) {
      const match = file.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
      if (match) {
        const [_, y, m, d, H, M, S] = match;
        const fileTs = new Date(`${y}-${m}-${d}T${H}:${M}:${S}.000Z`).getTime();
        
        // Very basic matching logic for extract
        if (Math.abs(fileTs - startTime) < 180000) { 
          downloadUrl = `http://localhost:4000/clips/${camId}/${file}`;
          break;
        }
      }
    }
  }

  if (downloadUrl) {
    res.json({ success: true, message: 'Video extracted successfully', downloadUrl });
  } else {
    res.json({ success: false, message: 'No recording found for this time' });
  }
});

// A dummy endpoint to serve a static video file or placeholder image if clicked
app.get('/api/dvr/extract', async (req, res) => {
  const { camera, start, end } = req.query;
  const camId = await getCameraId(camera);
  const camDir = path.join(CLIPS_DIR, camId);

  if (fs.existsSync(camDir)) {
    const allFiles = fs.readdirSync(camDir).filter(f => f.endsWith('.mp4')).sort();
    const startTime = new Date(start).getTime();
    for (const file of allFiles) {
      const match = file.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
      if (match) {
        const [_, y, m, d, H, M, S] = match;
        const fileTs = new Date(`${y}-${m}-${d}T${H}:${M}:${S}.000Z`).getTime();
        if (Math.abs(fileTs - startTime) < 300000) { 
          // If a file is close, redirect to stream it directly
          return res.redirect(`/clips/${camId}/${file}`);
        }
      }
    }
  }

  // Not found fallback (simulate empty or error)
  res.status(404).send('No recording found for this time range');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`[DVR Service] Real NVR running on port ${PORT}`);
});
