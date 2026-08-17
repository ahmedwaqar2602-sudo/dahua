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

app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (c) => c.text('Dahua Secure Backend Worker is running.'));

const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'fallback-secret-key-for-local-dev-123';

// -----------------------------------------------------------------------------
// Admin Auth
// -----------------------------------------------------------------------------

app.post('/api/admin/setup', async (c) => {
  const username = 'flexnook';
  const password = 'Khan1234';
  
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) return c.json({ success: false, message: 'Admin user already seeded.' });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await c.env.DB.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').bind(username, hash).run();
    return c.json({ success: true, message: 'Admin user seeded successfully.' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/login', async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) return c.json({ error: 'Missing credentials' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    let isValid = false;
    let userId = 1;

    if (username === 'flexnook' && password === 'Khan1234') {
      isValid = true;
    }

    if (!isValid) return c.json({ success: false, message: 'Invalid credentials' }, 401);

    setCookie(c, 'admin_token', 'authenticated_session', { path: '/', httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 86400 });

    return c.json({ success: true, message: 'Logged in successfully' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/logout', (c) => {
  deleteCookie(c, 'admin_token', { path: '/' });
  return c.json({ success: true });
});

// Middleware for auth verification
const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'admin_token');
  if (!token || token !== 'authenticated_session') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  await next();
};

app.get('/api/admin/me', async (c) => {
  const token = getCookie(c, 'admin_token');
  if (token) {
    return c.json({ authenticated: true });
  } else {
    return c.json({ authenticated: false }, 401);
  }
});

// -----------------------------------------------------------------------------
// Admin Endpoints
// -----------------------------------------------------------------------------
app.get('/api/admin/cameras', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  const { results } = await c.env.DB.prepare('SELECT * FROM cameras').all();
  return c.json({ success: true, cameras: results || [] });
});

app.post('/api/admin/cameras', requireAuth, async (c) => {
  const { name, display_name, rtsp_url } = await c.req.json();
  if (!name || !rtsp_url) return c.json({ error: 'Missing name or rtsp_url' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('INSERT INTO cameras (name, display_name, rtsp_url) VALUES (?, ?, ?)').bind(name, display_name || null, rtsp_url).run();
    return c.json({ success: true, message: 'Camera added' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.put('/api/admin/cameras/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const { display_name } = await c.req.json();
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('UPDATE cameras SET display_name = ? WHERE id = ?').bind(display_name || null, id).run();
    return c.json({ success: true, message: 'Camera updated' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/generate-link', requireAuth, async (c) => {
  const { cameraIds, daily_start_time, daily_end_time } = await c.req.json();
  if (!cameraIds || !Array.isArray(cameraIds)) return c.json({ error: 'Missing or invalid cameraIds' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  
  const token = crypto.randomUUID();
  try {
    const row = await c.env.DB.prepare('SELECT COUNT(*) as total FROM access_tokens').first();
    const total = row?.total || 0;
    const nextNum = (total as number) + 1;
    const userLabel = 'User ' + nextNum;

    await c.env.DB.prepare('INSERT INTO access_tokens (token, user_label, allowed_cameras, daily_start_time, daily_end_time) VALUES (?, ?, ?, ?, ?)').bind(token, userLabel, JSON.stringify(cameraIds), daily_start_time || null, daily_end_time || null).run();
    return c.json({ success: true, token, user_label: userLabel });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/update-access', requireAuth, async (c) => {
  const { token, cameraIds, revoke } = await c.req.json();
  if (!token) return c.json({ error: 'Missing token' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    if (revoke) {
      await c.env.DB.prepare('UPDATE access_tokens SET is_revoked = 1 WHERE token = ?').bind(token).run();
      return c.json({ success: true, message: 'Token revoked' });
    } else if (cameraIds && Array.isArray(cameraIds)) {
      await c.env.DB.prepare('UPDATE access_tokens SET allowed_cameras = ? WHERE token = ?').bind(JSON.stringify(cameraIds), token).run();
      return c.json({ success: true, message: 'Access updated' });
    }
    return c.json({ error: 'Invalid update parameters' }, 400);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/admin/user-sessions', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const { results: logs } = await c.env.DB.prepare('SELECT a.id, a.token, a.action, a.timestamp, t.user_label, t.allowed_cameras FROM audit_logs a JOIN access_tokens t ON a.token = t.token ORDER BY a.timestamp ASC').all();
    
    // Group logs by token
    const tokenLogs: Record<string, any[]> = {};
    for (const log of (logs || [])) {
      if (!tokenLogs[log.token]) tokenLogs[log.token] = [];
      tokenLogs[log.token].push(log);
    }

    const sessions = [];
    for (const token in tokenLogs) {
      let currentEnter = null;
      for (const log of tokenLogs[token]) {
        if (log.action === 'ENTER') {
          currentEnter = log;
        } else if (log.action === 'EXIT' && currentEnter) {
          let cameraIds = [];
          try { cameraIds = JSON.parse(log.allowed_cameras); } catch(e){}
          sessions.push({
            sessionId: `${currentEnter.id}-${log.id}`,
            token: token,
            userLabel: log.user_label,
            cameraIds: cameraIds,
            startTime: currentEnter.timestamp,
            endTime: log.timestamp
          });
          currentEnter = null;
        }
      }
    }

    // Sort sessions descending by start time
    sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return c.json({ success: true, sessions });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/admin/active-shares', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT t.*, 
             (SELECT action FROM audit_logs a WHERE a.token = t.token ORDER BY timestamp DESC LIMIT 1) as last_action,
             (SELECT timestamp FROM audit_logs a WHERE a.token = t.token ORDER BY timestamp DESC LIMIT 1) as last_used
      FROM access_tokens t
    `).all();

    const shares = (results || []).map((t: any) => {
      let status = 'Offline';
      if (t.last_action === 'ENTER') status = 'Online';
      return {
        ...t,
        status,
        last_used: t.last_used
      };
    });

    return c.json({ success: true, shares });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// User Viewer Endpoints
// -----------------------------------------------------------------------------
app.get('/api/view/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'Missing token' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const accessToken = await c.env.DB.prepare('SELECT * FROM access_tokens WHERE token = ?').bind(token).first();
    if (!accessToken) return c.json({ success: false, message: 'Invalid token' }, 403);
    if (accessToken.is_revoked) return c.json({ success: false, message: 'Token has been revoked' }, 403);

    if (accessToken.daily_start_time && accessToken.daily_end_time) {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', hour: 'numeric', minute: 'numeric', hour12: false });
      const parts = formatter.formatToParts(now);
      let hour = 0, minute = 0;
      for (const part of parts) {
        if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
        if (part.type === 'minute') minute = parseInt(part.value, 10);
      }
      
      const currentMinutes = hour * 60 + minute;
      const [startHour, startMin] = (accessToken.daily_start_time as string).split(':').map(Number);
      const [endHour, endMin] = (accessToken.daily_end_time as string).split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      let isAllowed = false;
      if (startMinutes <= endMinutes) {
        isAllowed = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        isAllowed = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
      
      if (!isAllowed) {
        return c.json({ error: 'Stream is currently offline. Access is only permitted during scheduled hours.' }, 403);
      }
    }

    const allowedCameraIds = JSON.parse(accessToken.allowed_cameras as string);
    if (allowedCameraIds.length === 0) return c.json({ success: false, message: 'No cameras allowed' }, 403);

    const placeholders = allowedCameraIds.map(() => '?').join(',');
    const cameras = await c.env.DB.prepare(`SELECT id, name, display_name, rtsp_url FROM cameras WHERE id IN (${placeholders})`).bind(...allowedCameraIds).all();

    const streams = (cameras.results || []).map((cam: any) => ({
      id: cam.id,
      name: cam.name,
      display_name: cam.display_name,
      streamUrl: `http://localhost:1984/stream.html?src=${encodeURIComponent(cam.name)}`
    }));

    return c.json({ success: true, streams });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/view/log', async (c) => {
  let token, action;
  
  const contentType = c.req.header('Content-Type') || '';
  if (contentType.includes('application/json')) {
    const body = await c.req.json();
    token = body.token;
    action = body.action;
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const body = await c.req.parseBody();
    token = body.token;
    action = body.action;
  } else {
    try {
      const text = await c.req.text();
      const params = new URLSearchParams(text);
      token = params.get('token');
      action = params.get('action');
      if (!token && !action) {
         const json = JSON.parse(text);
         token = json.token;
         action = json.action;
      }
    } catch(e) {}
  }

  if (!token || !action) return c.json({ error: 'Missing token or action' }, 400);
  if (!['ENTER', 'EXIT'].includes(action)) return c.json({ error: 'Invalid action' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    await c.env.DB.prepare('INSERT INTO audit_logs (token, action) VALUES (?, ?)').bind(token, action).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// Dahua CGI API Stubs
// -----------------------------------------------------------------------------

app.post('/api/camera/ptz', requireAuth, async (c) => {
  // TODO: Implement Dahua HTTP CGI command (e.g. /cgi-bin/ptz.cgi)
  const body = await c.req.json();
  console.log('PTZ Stub:', body);
  return c.json({ success: true, message: 'PTZ command stubbed' });
});

app.post('/api/camera/settings', requireAuth, async (c) => {
  // TODO: Implement Dahua HTTP CGI settings adjustments
  const body = await c.req.json();
  console.log('Settings Stub:', body);
  return c.json({ success: true, message: 'Camera settings applied (stub)' });
});

app.post('/api/camera/alarms', requireAuth, async (c) => {
  // TODO: Implement Dahua HTTP CGI alarm subscriptions / manual triggers
  const body = await c.req.json();
  console.log('Alarms Stub:', body);
  return c.json({ success: true, message: 'Alarm config applied (stub)' });
});

export default app;
