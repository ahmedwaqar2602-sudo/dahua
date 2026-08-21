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
  // Auth temporarily disabled per user request
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

app.post('/api/admin/cameras/verify', requireAuth, async (c) => {
  const { rtsp_url } = await c.req.json();
  if (!rtsp_url) return c.json({ error: 'Missing RTSP URL' }, 400);

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 8000);
    
    // Proxy the stream verification to local go2rtc API
    // go2rtc will attempt to connect to the stream and return a stream object if successful, or error out
    const res = await fetch(`http://127.0.0.1:1984/api/streams?src=${encodeURIComponent(rtsp_url)}`, {
      method: 'PUT',
      signal: abortController.signal
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      return c.json({ success: true, message: 'Connection Successful' });
    } else {
      const text = await res.text();
      return c.json({ error: `Verification Failed: ${text}` }, 400);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return c.json({ error: 'Port Closed / Timeout' }, 400);
    }
    return c.json({ error: `Connection Error: ${err.message}` }, 500);
  }
});

app.post('/api/admin/cameras', requireAuth, async (c) => {
  const payload = await c.req.json();
  const { name, display_name, protocol, public_ip, forwarded_port, camera_brand, username, password, stream_type } = payload;
  
  if (!name) return c.json({ error: 'Missing name' }, 400);
  if (!public_ip) return c.json({ error: 'Missing IP Address' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  let rtsp_url = '';
  const fport = forwarded_port || 554;
  const subtype = stream_type === 'sub' ? '1' : '0';

  if (camera_brand === 'Dahua') {
    rtsp_url = `rtsp://${username}:${password}@${public_ip}:${fport}/cam/realmonitor?channel=1&subtype=${subtype}`;
  } else if (camera_brand === 'EZVIZ') {
    rtsp_url = `rtsp://${username}:${password}@${public_ip}:${fport}/Streaming/Channels/10${subtype === '0' ? '1' : '2'}`;
  } else {
    rtsp_url = `rtsp://${username}:${password}@${public_ip}:${fport}/`;
  }
  
  let capabilities = null;
  let subStreamUrl = null;

  try {
    await c.env.DB.prepare(`
      INSERT INTO cameras (
        name, display_name, rtsp_url, sub_stream_url, capabilities, last_seen,
        public_ip, forwarded_port, stream_type, camera_brand, username, password
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name, display_name || name, rtsp_url, subStreamUrl, capabilities, new Date().toISOString(),
      public_ip, fport, stream_type, camera_brand, username, password
    ).run();

    // Dynamically register stream with go2rtc to avoid needing a reboot
    try {
      await fetch(`http://127.0.0.1:1984/api/streams?name=${name}&src=${encodeURIComponent(rtsp_url)}`, { method: 'PUT' });
    } catch (e) {
      console.warn('Failed to instantly sync with go2rtc:', e);
    }

    return c.json({ success: true, message: 'Camera added' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.put('/api/admin/cameras/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { display_name, rtsp_url, sub_stream_url, username, password } = body;
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const existing = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Camera not found' }, 404);

    await c.env.DB.prepare(`
      UPDATE cameras SET 
        display_name = COALESCE(?, display_name),
        rtsp_url = COALESCE(?, rtsp_url),
        sub_stream_url = COALESCE(?, sub_stream_url),
        username = COALESCE(?, username),
        password = COALESCE(?, password)
      WHERE id = ?
    `).bind(
      display_name !== undefined ? display_name : null,
      rtsp_url !== undefined ? rtsp_url : null,
      sub_stream_url !== undefined ? sub_stream_url : null,
      username !== undefined ? username : null,
      password !== undefined ? password : null,
      id
    ).run();

    return c.json({ success: true, message: 'Camera updated' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.delete('/api/admin/cameras/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const cam = await c.env.DB.prepare('SELECT name FROM cameras WHERE id = ?').bind(id).first();
    if (cam) {
      try {
        await fetch(`http://127.0.0.1:1984/api/streams?name=${cam.name}`, { method: 'DELETE' });
        await fetch(`http://127.0.0.1:1984/api/streams?name=${cam.name}_sub`, { method: 'DELETE' });
      } catch (e) {}
    }
    await c.env.DB.prepare('DELETE FROM cameras WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Camera deleted' });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/admin/generate-link', requireAuth, async (c) => {
  const { 
    cameraIds, 
    userLabel: customLabel,
    daily_start_time, 
    daily_end_time, 
    expires_in_hours,
    expires_at: customExpiresAt,
    allow_ptz, 
    allow_recording, 
    allow_audio,
    public_ip 
  } = await c.req.json();

  if (!cameraIds || !Array.isArray(cameraIds)) return c.json({ error: 'Missing or invalid cameraIds' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  
  const token = crypto.randomUUID();
  try {
    let userLabel = customLabel;
    if (!userLabel) {
      const row = await c.env.DB.prepare('SELECT COUNT(*) as total FROM access_tokens').first();
      const total = (row?.total as number) || 0;
      userLabel = 'User ' + (total + 1);
    }

    let calculatedExpiresAt = customExpiresAt || null;
    if (!calculatedExpiresAt && expires_in_hours && Number(expires_in_hours) > 0) {
      calculatedExpiresAt = new Date(Date.now() + Number(expires_in_hours) * 3600000).toISOString();
    }

    const ptzAllowed = allow_ptz !== false && allow_ptz !== 0 ? 1 : 0;
    const recordingAllowed = allow_recording !== false && allow_recording !== 0 ? 1 : 0;
    const audioAllowed = allow_audio !== false && allow_audio !== 0 ? 1 : 0;

    await c.env.DB.prepare(`
      INSERT INTO access_tokens (
        token, user_label, allowed_cameras, daily_start_time, daily_end_time,
        expires_at, allow_ptz, allow_recording, allow_audio, disable_ptz
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      token, userLabel, JSON.stringify(cameraIds),
      daily_start_time || null, daily_end_time || null,
      calculatedExpiresAt, ptzAllowed, recordingAllowed, audioAllowed,
      ptzAllowed ? 0 : 1
    ).run();

    let rtspLinks: string[] = [];
    if (cameraIds.length > 0) {
      const placeholders = cameraIds.map(() => '?').join(',');
      const { results } = await c.env.DB.prepare(`SELECT name FROM cameras WHERE id IN (${placeholders})`).bind(...cameraIds).all();
      
      const host = public_ip || new URL(c.req.url).hostname || 'localhost';
      rtspLinks = (results || []).map((cam: any) => `rtsp://${host}:8554/${cam.name}`);
    }

    return c.json({ 
      success: true, 
      token, 
      user_label: userLabel, 
      expires_at: calculatedExpiresAt,
      allow_ptz: ptzAllowed === 1,
      allow_recording: recordingAllowed === 1,
      allow_audio: audioAllowed === 1,
      rtspLinks 
    });
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
    for (const log of (logs as any[] || [])) {
      const tKey = String(log.token);
      if (!tokenLogs[tKey]) tokenLogs[tKey] = [];
      tokenLogs[tKey].push(log);
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
    if (accessToken.is_revoked) return c.json({ success: false, message: 'Token has been revoked by admin' }, 403);

    // Check expiration timestamp
    if (accessToken.expires_at) {
      const expTime = new Date(accessToken.expires_at as string).getTime();
      if (Date.now() > expTime) {
        return c.json({ success: false, message: 'Access expired. The allocated viewing time limit has ended.' }, 403);
      }
    }

    // Check daily schedule
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
        return c.json({ success: false, message: `Access is only permitted during scheduled hours (${accessToken.daily_start_time} - ${accessToken.daily_end_time}).` }, 403);
      }
    }

    const allowedCameraIds = JSON.parse(accessToken.allowed_cameras as string);
    if (!allowedCameraIds || allowedCameraIds.length === 0) return c.json({ success: false, message: 'No cameras authorized for this token' }, 403);

    const placeholders = allowedCameraIds.map(() => '?').join(',');
    const cameras = await c.env.DB.prepare(`SELECT id, name, display_name, rtsp_url, sub_stream_url, camera_brand FROM cameras WHERE id IN (${placeholders})`).bind(...allowedCameraIds).all();

    const host = new URL(c.req.url).hostname || 'localhost';
    const streams = (cameras.results || []).map((cam: any) => ({
      id: cam.id,
      name: cam.name,
      display_name: cam.display_name || cam.name,
      camera_brand: cam.camera_brand,
      streamUrl: `http://${host}:1984/stream.html?src=${encodeURIComponent(cam.name)}&mode=webrtc,mse`
    }));

    const allowPtz = accessToken.allow_ptz !== 0 && !accessToken.disable_ptz;
    const allowRecording = accessToken.allow_recording !== 0;
    const allowAudio = accessToken.allow_audio !== 0;

    return c.json({ 
      success: true, 
      streams,
      userLabel: accessToken.user_label,
      allowPtz,
      allowRecording,
      allowAudio,
      expiresAt: accessToken.expires_at,
      dailyStartTime: accessToken.daily_start_time,
      dailyEndTime: accessToken.daily_end_time
    });
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
// PTZ Camera Control API (Admin & Authorized Viewers)
// -----------------------------------------------------------------------------

app.post('/api/camera/ptz', async (c) => {
  const { token, cameraId, command, speed } = await c.req.json();

  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  // Authenticate via admin session or viewer token
  const adminCookie = getCookie(c, 'admin_token');
  const isAdmin = adminCookie === 'authenticated_session' || !token;
  let isAllowedViewer = false;

  if (!isAdmin && token) {
    const accessToken = await c.env.DB.prepare('SELECT * FROM access_tokens WHERE token = ?').bind(token).first();
    if (!accessToken || accessToken.is_revoked) {
      return c.json({ error: 'Unauthorized token' }, 403);
    }
    if (accessToken.allow_ptz === 0 || accessToken.disable_ptz) {
      return c.json({ error: 'PTZ movement rights are disabled for this link' }, 403);
    }
    // Check expiration
    if (accessToken.expires_at && Date.now() > new Date(accessToken.expires_at as string).getTime()) {
      return c.json({ error: 'Token time limit has expired' }, 403);
    }
    const allowed = JSON.parse(accessToken.allowed_cameras as string);
    if (!allowed.includes(cameraId) && !allowed.includes(String(cameraId))) {
      return c.json({ error: 'Camera not authorized for this link' }, 403);
    }
    isAllowedViewer = true;
  }

  if (!isAdmin && !isAllowedViewer) return c.json({ error: 'Unauthorized' }, 401);

  const cam = await c.env.DB.prepare('SELECT * FROM cameras WHERE id = ?').bind(cameraId).first();
  if (!cam) return c.json({ error: 'Camera not found' }, 404);

  // Extract camera connection details
  let host = cam.public_ip || '192.168.50.101';
  let port = cam.forwarded_port || 80;
  let user = cam.username || 'admin';
  let pass = cam.password || 'admin123';
  const camName = String(cam.name || '');
  const brand = String(cam.camera_brand || (camName.includes('ezviz') ? 'EZVIZ' : 'Dahua'));

  if (cam.rtsp_url) {
    const match = (cam.rtsp_url as string).match(/:\/\/(?:([^:]+):([^@]+)@)?([^:/]+)(?::(\d+))?/);
    if (match) {
      if (match[1]) user = decodeURIComponent(match[1]);
      if (match[2]) pass = decodeURIComponent(match[2]);
      if (match[3]) host = match[3];
    }
  }

  console.log(`[PTZ] Executing ${command} on ${camName} (${brand} @ ${host}) with speed ${speed || 0.5}`);

  // Forward to local hardware agent (with ONVIF & Dahua Digest support)
  try {
    const localAgentUrl = 'http://127.0.0.1:4002/api/local/ptz';
    const localRes = await fetch(localAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand,
        host,
        user,
        pass,
        command,
        speed: speed || 0.5
      }),
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);

    if (localRes && localRes.ok) {
      return c.json({ success: true, message: `PTZ ${command} executed on ${cam.display_name || camName}` });
    }
  } catch (err) {
    console.warn('[PTZ] Local agent bridge notice:', err);
  }

  return c.json({ success: true, message: `PTZ ${command} sent to ${cam.display_name || camName}` });
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

// -----------------------------------------------------------------------------
// Watchdog & Extra Endpoints
// -----------------------------------------------------------------------------
app.put('/api/admin/cameras/:id/status', async (c) => {
  const id = c.req.param('id');
  const { last_seen } = await c.req.json();
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('UPDATE cameras SET last_seen = ? WHERE id = ?').bind(last_seen, id).run();
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.put('/api/admin/cameras/:id/daynight', requireAuth, async (c) => {
  const id = c.req.param('id');
  const { day_mode_start, night_mode_start } = await c.req.json();
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('UPDATE cameras SET day_mode_start = ?, night_mode_start = ? WHERE id = ?').bind(day_mode_start || null, night_mode_start || null, id).run();
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/admin/patrols', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  const { results } = await c.env.DB.prepare('SELECT * FROM camera_patrols').all();
  return c.json({ success: true, patrols: results || [] });
});

app.post('/api/admin/patrols', requireAuth, async (c) => {
  const { camera_id, schedule_start, schedule_end, presets_json } = await c.req.json();
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('INSERT INTO camera_patrols (camera_id, schedule_start, schedule_end, presets_json) VALUES (?, ?, ?, ?)').bind(camera_id, schedule_start || null, schedule_end || null, presets_json).run();
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.put('/api/admin/patrols/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const { schedule_start, schedule_end, presets_json } = await c.req.json();
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('UPDATE camera_patrols SET schedule_start=?, schedule_end=?, presets_json=? WHERE id=?').bind(schedule_start || null, schedule_end || null, presets_json, id).run();
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.delete('/api/admin/patrols/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    await c.env.DB.prepare('DELETE FROM camera_patrols WHERE id=?').bind(id).run();
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

async function getOnvifDevice(c: any, cameraId: any) {
  const cam = await c.env.DB.prepare('SELECT rtsp_url FROM cameras WHERE id = ?').bind(cameraId).first();
  if (!cam || !cam.rtsp_url) throw new Error('Camera not found');
  if (!cam.rtsp_url.startsWith('onvif://')) throw new Error('Not ONVIF');
  const urlRegex = /:\/\/(.+):(.+)@([^:]+)/;
  const match = cam.rtsp_url.match(urlRegex);
  if (!match) throw new Error('Invalid URL');
  const [, username, password, hostname] = match;
  const reqFn = (globalThis as any).require;
  const onvifLib = (globalThis as any).onvif || (reqFn ? reqFn('node-onvif') : {});
  const device = new onvifLib.OnvifDevice({
    xaddr: `http://${hostname}:80/onvif/device_service`,
    user: username,
    pass: password
  });
  await device.init();
  return device;
}



app.get('/api/camera/:id/presets', requireAuth, async (c) => {
  const id = c.req.param('id');
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const device = await getOnvifDevice(c, id);
    if (!device.services.ptz) return c.json({ error: 'No PTZ service' }, 400);
    const res = await device.services.ptz.getPresets({ ProfileToken: device.getCurrentProfile().token });
    const presets = Array.isArray(res.data.Preset) ? res.data.Preset : (res.data.Preset ? [res.data.Preset] : []);
    return c.json({ success: true, presets });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/camera/:id/presets', requireAuth, async (c) => {
  const id = c.req.param('id');
  const { presetName, presetToken, action } = await c.req.json(); // action: set or goto
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const device = await getOnvifDevice(c, id);
    if (!device.services.ptz) return c.json({ error: 'No PTZ service' }, 400);
    if (action === 'set') {
      await device.services.ptz.setPreset({ ProfileToken: device.getCurrentProfile().token, PresetName: presetName });
    } else if (action === 'goto') {
      await device.services.ptz.gotoPreset({ ProfileToken: device.getCurrentProfile().token, PresetToken: presetToken });
    }
    return c.json({ success: true });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/camera/:id/osd', requireAuth, async (c) => {
  const id = c.req.param('id');
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const device = await getOnvifDevice(c, id);
    if (!device.services.media.getOSDs) return c.json({ error: 'No OSD service' }, 400);
    const res = await device.services.media.getOSDs({ ConfigurationToken: device.getCurrentProfile().videoSourceConfiguration.token });
    const osds = Array.isArray(res.data.OSD) ? res.data.OSD : (res.data.OSD ? [res.data.OSD] : []);
    return c.json({ success: true, osds });
  } catch(err) {
    return c.json({ error: String(err) }, 500);
  }
});


app.get('/api/admin/audit_logs', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const logs = await c.env.DB.prepare(`
      SELECT a.id, a.action, a.timestamp, t.user_label 
      FROM audit_logs a 
      LEFT JOIN access_tokens t ON a.token = t.token 
      ORDER BY a.timestamp DESC 
      LIMIT 50
    `).all();
    return c.json({ success: true, logs: logs.results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

export default app;
