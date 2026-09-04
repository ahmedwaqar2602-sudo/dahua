const fs = require('fs');
const path = require('path');

async function syncClipsToDb() {
  const clipsDir = path.join(__dirname, 'clips');
  if (!fs.existsSync(clipsDir)) return;
  const cams = fs.readdirSync(clipsDir);
  for (const camId of cams) {
    const camDir = path.join(clipsDir, camId);
    if (!fs.lstatSync(camDir).isDirectory()) continue;
    const files = fs.readdirSync(camDir).filter(f => f.endsWith('.mp4'));
    for (const file of files) {
      const match = file.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
      if (match) {
        const [_, y, m, d, H, M, S] = match;
        const parsedStart = new Date(y, parseInt(m) - 1, d, H, M, S);
        const durationSeconds = 180;
        const actualSegmentEnd = new Date(parsedStart.getTime() + durationSeconds * 1000);
        
        try {
          const r = await fetch('http://127.0.0.1:8787/api/internal/recordings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              camera_id: Number(camId),
              file_path: path.join(camDir, file).replace(/\\/g, '/'),
              segment_start: parsedStart.toISOString(),
              segment_end: actualSegmentEnd.toISOString(),
              duration_seconds: durationSeconds
            })
          });
          const text = await r.text();
          console.log(file, text);
        } catch(e) {
          console.error(file, e);
        }
      }
    }
  }
}

syncClipsToDb();
