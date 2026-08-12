import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes (need credentials for cookies)
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

app.get('/', (c) => {
  return c.text('Dahua Secure Backend Worker is running.');
});

// Helper for JWT Secret
const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'fallback-secret-key-for-local-dev-123';

// -----------------------------------------------------------------------------
// Admin Auth & Setup
// -----------------------------------------------------------------------------

// Setup endpoint to seed the admin user
app.post('/api/admin/setup', async (c) => {
  const username = 'flexnook';
  const password = 'Khan1234';
  
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    // Check if user exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) {
      return c.json({ success: false, message: 'Admin user already seeded.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await c.env.DB.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
      .bind(username, hash).run();

    return c.json({ success: true, message: 'Admin user seeded successfully.' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// Login endpoint
app.post('/api/admin/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (!username || !password) return c.json({ error: 'Missing credentials' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    if (!user) return c.json({ success: false, message: 'Invalid credentials' }, 401);

    const match = bcrypt.compareSync(password, user.password_hash as string);
    if (!match) return c.json({ success: false, message: 'Invalid credentials' }, 401);

    const token = await sign({
      sub: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    }, getJwtSecret(c));

    setCookie(c, 'admin_token', token, {
      path: '/',
      secure: false, // false for localhost dev
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: 'Lax',
    });

    return c.json({ success: true, message: 'Logged in successfully' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/logout', (c) => {
  deleteCookie(c, 'admin_token', { path: '/' });
  return c.json({ success: true });
});

// Middleware to protect /api/admin/* (except login/setup)
app.use('/api/admin/*', async (c, next) => {
  const path = c.req.path;
  if (path === '/api/admin/login' || path === '/api/admin/setup') {
    return next();
  }

  const token = getCookie(c, 'admin_token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const decoded = await verify(token, getJwtSecret(c));
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});

// GET Current Admin
app.get('/api/admin/me', (c) => {
  const user = c.get('user');
  return c.json({ success: true, user });
});

// -----------------------------------------------------------------------------
// Admin Camera Management
// -----------------------------------------------------------------------------

app.get('/api/admin/cameras', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM cameras ORDER BY created_at DESC').all();
    return c.json({ success: true, cameras: results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/cameras', async (c) => {
  const { name, ip_address, onvif_port, username, password, stream_url } = await c.req.json();
  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO cameras (name, ip_address, onvif_port, username, password, stream_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, ip_address, onvif_port || 80, username || '', password || '', stream_url || '').run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.delete('/api/admin/cameras/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare('DELETE FROM cameras WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// Share Links
// -----------------------------------------------------------------------------

// Helper for generating random tokens
const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

app.get('/api/admin/share-links', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, c.name as camera_name 
      FROM share_links s
      LEFT JOIN cameras c ON s.camera_id = c.id
      ORDER BY s.created_at DESC
    `).all();
    return c.json({ success: true, shareLinks: results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/share-links', async (c) => {
  const { camera_id, expires_at } = await c.req.json();
  const token = generateToken();
  try {
    await c.env.DB.prepare(
      'INSERT INTO share_links (token, camera_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, camera_id, expires_at || null).run();
    return c.json({ success: true, token });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/share-links/:token/revoke', async (c) => {
  const token = c.req.param('token');
  try {
    await c.env.DB.prepare('UPDATE share_links SET is_active = 0 WHERE token = ?').bind(token).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.delete('/api/admin/share-links/:token', async (c) => {
  const token = c.req.param('token');
  try {
    await c.env.DB.prepare('DELETE FROM share_links WHERE token = ?').bind(token).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// Admin Audit Logs (Sessions)
// -----------------------------------------------------------------------------

app.get('/api/admin/logs', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, c.name as camera_name 
      FROM sessions s
      LEFT JOIN cameras c ON s.camera_id = c.id
      ORDER BY s.opened_at DESC
    `).all();
    return c.json({ success: true, logs: results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// Public Access (Shared Viewer) & Session Lifecycle
// -----------------------------------------------------------------------------

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
  let hour = 0, minute = 0;
  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }

  const isAllowed = hour >= 8 && (hour < 18 || (hour === 18 && minute === 0));
  return { isAllowed, currentTimeStr: formatter.format(now), hour, minute };
}

// Start Session (called by Viewer page)
app.post('/api/session/start', async (c) => {
  const { token } = await c.req.json();
  const { isAllowed, currentTimeStr } = getKarachiTimeStatus();

  // Validate Token
  let link = null;
  let camera = null;
  if (token && c.env.DB) {
    link = await c.env.DB.prepare('SELECT * FROM share_links WHERE token = ? AND is_active = 1').bind(token).first();
    if (link) {
      // Check expiration
      if (link.expires_at && new Date(link.expires_at as string) < new Date()) {
        link = null; // Expired
      } else {
        camera = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(link.camera_id).first();
      }
    }
  }

  // Backwards compatibility for the hardcoded generic access testing without a token
  if (!token) {
    // Just fetch the first camera if it exists
    camera = await c.env.DB.prepare('SELECT * FROM cameras LIMIT 1').first();
  }

  if (!camera) {
    return c.json({ success: false, message: 'Invalid or expired share link.' });
  }

  const status = isAllowed ? 'Granted' : 'Denied';
  const sessionId = generateToken();
  const streamUrl = (camera.stream_url as string) || 'http://localhost:1984/stream.html?src=dahua_cam';

  // Create Session Row
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(
        'INSERT INTO sessions (id, share_link_token, camera_id, status) VALUES (?, ?, ?, ?)'
      ).bind(sessionId, token || null, camera.id, status).run();
      
      // If granted, call local agent to start recording
      if (isAllowed) {
        fetch('http://localhost:3005/start-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, streamUrl })
        }).catch(e => console.error('Failed to start recording:', e));
      }
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  }

  if (isAllowed) {
    return c.json({
      success: true,
      sessionId,
      streamUrl,
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

// Close Session (called by Viewer beforeunload)
app.post('/api/session/close', async (c) => {
  const { sessionId } = await c.req.json();
  if (!sessionId || !c.env.DB) return c.json({ success: false });

  try {
    // Tell local agent to stop recording
    let recordingPath = null;
    try {
      const resp = await fetch('http://localhost:3005/stop-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (resp.ok) {
        const data = await resp.json();
        recordingPath = data.recordingPath;
      }
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }

    await c.env.DB.prepare(
      'UPDATE sessions SET closed_at = CURRENT_TIMESTAMP, recording_path = ? WHERE id = ?'
    ).bind(recordingPath, sessionId).run();

    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// Old /api/access endpoint for backwards compatibility during transition
// We'll redirect to a default tokenless flow if needed, but the frontend should use /api/session/start
app.get('/api/access', async (c) => {
  const { isAllowed, currentTimeStr } = getKarachiTimeStatus();
  
  let camera = await c.env.DB.prepare('SELECT * FROM cameras LIMIT 1').first();
  const streamUrl = camera ? (camera.stream_url as string) : 'http://localhost:1984/stream.html?src=dahua_cam';
  
  if (isAllowed) {
    return c.json({
      success: true,
      streamUrl,
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

export default app;
