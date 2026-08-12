import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use('*', cors());

app.get('/', (c) => {
  return c.text('Dahua Secure Backend Worker is running.');
});

// Helper function to check if current time in Asia/Karachi is between 08:00 and 18:00
function getKarachiTimeStatus(): { isAllowed: boolean; currentTimeStr: string; hour: number; minute: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === 'hour') {
      hour = parseInt(part.value, 10) % 24;
    }
    if (part.type === 'minute') {
      minute = parseInt(part.value, 10);
    }
  }

  // 08:00 (8 AM) to 18:00 (6 PM)
  const isAllowed = hour >= 8 && (hour < 18 || (hour === 18 && minute === 0));

  const timeString = formatter.format(now);

  return { isAllowed, currentTimeStr: timeString, hour, minute };
}

// GET /api/access
app.get('/api/access', async (c) => {
  const { isAllowed, currentTimeStr } = getKarachiTimeStatus();
  const status = isAllowed ? 'Granted' : 'Denied';

  // Log to D1 Database if available
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(
        'INSERT INTO access_logs (status) VALUES (?)'
      ).bind(status).run();
    } catch (err) {
      console.error('Failed to log access attempt to D1 database:', err);
    }
  }

  if (isAllowed) {
    return c.json({
      success: true,
      streamUrl: 'http://localhost:1984/stream.html?src=dahua_cam',
      timestamp: currentTimeStr,
      timezone: 'Asia/Karachi'
    });
  } else {
    return c.json({
      success: false,
      message: 'Camera access is strictly restricted to 8:00 AM - 6:00 PM.',
      timestamp: currentTimeStr,
      timezone: 'Asia/Karachi'
    });
  }
});

// GET /api/logs
app.get('/api/logs', async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM access_logs ORDER BY timestamp DESC'
      ).all();

      return c.json({
        success: true,
        logs: results || []
      });
    } catch (err) {
      console.error('Failed to fetch logs from D1 database:', err);
      return c.json({
        success: false,
        message: 'Could not fetch access logs from database',
        logs: [],
        error: String(err)
      }, 500);
    }
  }

  // Fallback response if D1 DB is not linked yet
  return c.json({
    success: true,
    logs: []
  });
});

export default app;
