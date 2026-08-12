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
  origin: ['http://localhost:3000'],
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
  const body = await c.req.json();
  const { username, password } = body;

  if (!username || !password) return c.json({ error: 'Missing credentials' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    if (!user) return c.json({ success: false, message: 'Invalid credentials' }, 401);

    const match = bcrypt.compareSync(password, user.password_hash as string);
    if (!match) return c.json({ success: false, message: 'Invalid credentials' }, 401);

    const token = await sign({ sub: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, getJwtSecret(c));

    setCookie(c, 'admin_token', token, {
      path: '/',
      secure: false, 
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

// Middleware for auth verification
const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'admin_token');
  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  try {
    const decoded = await verify(token, getJwtSecret(c));
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
};

app.get('/api/admin/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ success: true, user });
});

// -----------------------------------------------------------------------------
// Stream Access & Logic
// -----------------------------------------------------------------------------

function getKarachiTimeStatus(): { isAllowed: boolean; currentTimeStr: string; hour: number; minute: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
  const parts = formatter.formatToParts(now);
  let hour = 0, minute = 0;
  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }
  const isAllowed = hour >= 8 && (hour < 18 || (hour === 18 && minute === 0));
  return { isAllowed, currentTimeStr: formatter.format(now), hour, minute };
}

// Public Route (Strict Timing)
app.get('/api/access', async (c) => {
  const { isAllowed, currentTimeStr } = getKarachiTimeStatus();
  const status = isAllowed ? 'Granted' : 'Denied';

  if (c.env.DB) {
    try {
      await c.env.DB.prepare('INSERT INTO access_logs (status) VALUES (?)').bind(status).run();
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  }

  if (isAllowed) {
    return c.json({ success: true, streamUrl: 'http://localhost:1984/stream.html?src=dahua_cam', timestamp: currentTimeStr, timezone: 'Asia/Karachi' });
  } else {
    return c.json({ success: false, message: 'Camera feed is currently offline. Operational viewing hours are 08:00 - 18:00 PKT.', timestamp: currentTimeStr, timezone: 'Asia/Karachi' }, 403);
  }
});

// Admin Route (Bypass Timing)
app.get('/api/admin/stream', requireAuth, async (c) => {
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('INSERT INTO access_logs (status) VALUES (?)').bind('Admin Accessed').run();
    } catch (err) {
      console.error('Failed to log admin session:', err);
    }
  }
  return c.json({ success: true, streamUrl: 'http://localhost:1984/stream.html?src=dahua_cam' });
});

// Logs API
app.get('/api/admin/logs', requireAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM access_logs ORDER BY timestamp DESC').all();
    return c.json({ success: true, logs: results || [] });
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
