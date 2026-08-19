const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simulated continuous DVR data
// We generate some mock "recorded" segments across the 24 hour timeline.
app.get('/api/dvr/continuous', (req, res) => {
  const { cameraId, date } = req.query;
  
  // Return an array of blocks where recording is available.
  // Format: { start: 'HH:MM', end: 'HH:MM', status: 'recorded' }
  const segments = [
    { start: '00:00', end: '03:15', status: 'recorded' },
    { start: '04:00', end: '09:30', status: 'recorded' },
    { start: '10:00', end: '14:45', status: 'recorded' },
    { start: '15:15', end: '20:00', status: 'recorded' },
    { start: '20:30', end: '23:59', status: 'recorded' }
  ];

  res.json({ success: true, cameraId, date, segments });
});

app.post('/api/dvr/extract', (req, res) => {
  const { cameraId, start, end, userLabel } = req.body;
  console.log(`[DVR] Extracting video for ${cameraId} from ${start} to ${end} requested by ${userLabel}`);
  
  // Simulate extraction delay
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Video extracted successfully',
      downloadUrl: `http://localhost:4000/api/dvr/download?token=mock_video_${Date.now()}`
    });
  }, 1500);
});

// A dummy endpoint to serve a static video file or placeholder image if clicked
app.get('/api/dvr/download', (req, res) => {
  res.send('Simulated Video Download... (In a real system, this would stream the MP4 segment)');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`[DVR Service] Mock NVR running on port ${PORT}`);
});
