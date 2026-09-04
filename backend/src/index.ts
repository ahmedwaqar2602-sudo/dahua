import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { streamSSE } from 'hono/streaming';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

// Global set to hold active SSE streams for live session updates
const sseClients = new Set<any>();

function broadcastSessionEvent(data: any) {
  for (const client of sseClients) {
    try {
      client.writeSSE({
        data: JSON.stringify(data),
      });
    } catch (e) {
      sseClients.delete(client);
    }
  }
}


const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (c) => c.text('Dahua Secure Backend Worker is running.'));

const DVR_TZ = 'Asia/Karachi';

function calendarDateInTz(date = new Date(), timeZone = DVR_TZ): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function localDayBoundsIso(dateStr: string): { start: string; end: string } {
  // Asia/Karachi is UTC+5 with no DST. Bound the selected calendar day in local time.
  const start = new Date(`${dateStr}T00:00:00+05:00`);
  const end = new Date(`${dateStr}T23:59:59.999+05:00`);
  return { start: start.toISOString(), end: end.toISOString() };
}

function clockHmInTz(iso: string, timeZone = DVR_TZ): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23'
  }).formatToParts(new Date(iso));
  const h = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${h}:${m}`;
}

const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'fallback-secret-key-for-local-dev-123';
const getEncryptionKey = (c: any) => c.env.ENCRYPTION_KEY || 'default-dev-key-must-be-32bytes!';
const getInternalToken = (c: any) => c.env.INTERNAL_API_KEY;

async function encryptPassword(text: string, keyString: string): Promise<string> {
  if (!text) return text;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyString.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    new TextEncoder().encode(text)
  );
  
  const buf2hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${buf2hex(iv.buffer)}:${buf2hex(encrypted)}`;
}

async function decryptPassword(cipherStr: string, keyString: string): Promise<string> {
  if (!cipherStr || !cipherStr.includes(':')) return cipherStr; 
  const [ivHex, cipherHex] = cipherStr.split(':');
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyString.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const hex2buf = (hex: string) => {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    return bytes.buffer;
  };
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(hex2buf(ivHex)) },
      keyMaterial,
      hex2buf(cipherHex)
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return cipherStr; 
  }
}

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

app.get('/api/admin/agent-status', requireAuth, async (c) => {
  return c.json({ success: true, last_heartbeat: Date.now() });
});

app.get('/api/admin/cameras', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  const { results } = await c.env.DB.prepare('SELECT * FROM cameras').all();
  
  for (const cam of results || []) {
    if (cam.password) cam.password = '';
  }

  return c.json({ success: true, cameras: results || [] });
});

app.get('/api/admin/cameras/:id/credentials', requireAuth, async (c) => {
  const id = c.req.param('id');
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  
  const cam = await c.env.DB.prepare('SELECT password, rtsp_url, sub_stream_url FROM cameras WHERE id = ?').bind(id).first();
  if (!cam) return c.json({ error: 'Camera not found' }, 404);

  const encKey = getEncryptionKey(c);
  if (cam.password) {
    cam.password = await decryptPassword(cam.password as string, encKey);
    const encPass = encodeURIComponent(cam.password as string);
    if (cam.rtsp_url) cam.rtsp_url = (cam.rtsp_url as string).replace(':***@', `:${encPass}@`);
    if (cam.sub_stream_url) cam.sub_stream_url = (cam.sub_stream_url as string).replace(':***@', `:${encPass}@`);
  }

  return c.json({ success: true, credentials: cam });
});

app.get('/api/internal/cameras', async (c) => {
  const token = c.req.header('x-internal-token');
  const expectedToken = getInternalToken(c);
  if (!expectedToken || token !== expectedToken) {
    return c.json({ error: 'Unauthorized internal access' }, 403);
  }

  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  const { results } = await c.env.DB.prepare('SELECT * FROM cameras').all();
  
  const encKey = getEncryptionKey(c);
  for (const cam of results || []) {
    if (cam.password) {
      cam.password = await decryptPassword(cam.password as string, encKey);
      const encPass = encodeURIComponent(cam.password as string);
      if (cam.rtsp_url) cam.rtsp_url = (cam.rtsp_url as string).replace(':***@', `:${encPass}@`);
      if (cam.sub_stream_url) cam.sub_stream_url = (cam.sub_stream_url as string).replace(':***@', `:${encPass}@`);
    }
  }

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
  
  let subStreamUrl = null;

  let parsedCapabilities = null;
  if (typeof capabilities === 'string') parsedCapabilities = capabilities;
  else if (typeof capabilities === 'object' && capabilities !== null) parsedCapabilities = JSON.stringify(capabilities);
  
  try {
    const encKey = getEncryptionKey(c);
    const encPassword = await encryptPassword(password, encKey);
    const db_rtsp_url = rtsp_url.replace(`:${password}@`, ':***@');
    const db_sub_url = subStreamUrl ? (subStreamUrl as string).replace(`:${password}@`, ':***@') : null;

    await c.env.DB.prepare(`
      INSERT INTO cameras (
        name, display_name, rtsp_url, sub_stream_url, capabilities, last_seen,
        public_ip, forwarded_port, stream_type, camera_brand, username, password
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name, display_name || name, db_rtsp_url, db_sub_url || null, parsedCapabilities || null, new Date().toISOString(),
      public_ip, fport, stream_type || null, camera_brand || null, username || null, encPassword || null
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

    const encKey = getEncryptionKey(c);
    let db_password = password !== undefined ? password : null;
    if (db_password) {
      db_password = await encryptPassword(db_password, encKey);
    }
    
    let db_rtsp_url = rtsp_url !== undefined ? rtsp_url : null;
    if (db_rtsp_url && password) db_rtsp_url = db_rtsp_url.replace(`:${password}@`, ':***@');
    else if (db_rtsp_url && !password) {
       // if we update url without sending password, assume existing password replacement
       const oldPlaintext = await decryptPassword(existing.password as string, encKey);
       db_rtsp_url = db_rtsp_url.replace(`:${oldPlaintext}@`, ':***@');
    }

    let db_sub_url = sub_stream_url !== undefined ? sub_stream_url : null;
    if (db_sub_url && password) db_sub_url = db_sub_url.replace(`:${password}@`, ':***@');
    else if (db_sub_url && !password) {
       const oldPlaintext = await decryptPassword(existing.password as string, encKey);
       db_sub_url = db_sub_url.replace(`:${oldPlaintext}@`, ':***@');
    }

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
      db_rtsp_url,
      db_sub_url,
      username !== undefined ? username : null,
      db_password,
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
    dailyLimitMinutes,
    allow_ptz, 
    allow_recording, 
    allow_audio,
    public_ip,
    is_combined,
    recording_access_start,
    recording_access_end
  } = await c.req.json();

  if (!cameraIds || !Array.isArray(cameraIds)) return c.json({ error: 'Missing or invalid cameraIds' }, 400);
  if (is_combined && cameraIds.length < 2) {
    return c.json({ error: 'Combined streams must have at least 2 cameras.' }, 400);
  }
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {

    const token = crypto.randomUUID();
    let userLabel = customLabel;
    if (!userLabel) {
      const row = await c.env.DB.prepare('SELECT COUNT(*) as total FROM access_tokens').first();
      const total = (row?.total as number) || 0;
      userLabel = 'User ' + (total + 1);
    }

    const ptzAllowed = allow_ptz !== false && allow_ptz !== 0 ? 1 : 0;
    const recordingAllowed = allow_recording !== false && allow_recording !== 0 ? 1 : 0;
    const audioAllowed = allow_audio !== false && allow_audio !== 0 ? 1 : 0;

    await c.env.DB.prepare(`
      INSERT INTO access_tokens (
        token, user_label, allowed_cameras, daily_start_time, daily_end_time,
        daily_limit_minutes, allow_ptz, allow_recording, allow_audio, disable_ptz, is_combined,
        recording_access_start, recording_access_end
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      token, userLabel, JSON.stringify(cameraIds),
      daily_start_time || null, daily_end_time || null,
      dailyLimitMinutes ? Number(dailyLimitMinutes) : 0, ptzAllowed, recordingAllowed, audioAllowed,
      ptzAllowed ? 0 : 1, is_combined ? 1 : 0,
      recording_access_start || null, recording_access_end || null
    ).run();

    let rtspLinks: string[] = [];
    if (is_combined) {
      // Immediately tell local-agent to register this stream in go2rtc
      const firstCam = await c.env.DB.prepare(`SELECT public_ip FROM cameras WHERE id = ?`).bind(cameraIds[0]).first();
      const host = public_ip || (firstCam?.public_ip as string) || '202.163.103.241';

      let registeredInGo2rtc = false;
      let go2rtcNote = 'local-agent not reachable — stream will be created within 10s by background reconciler';
      try {
        const agentRes = await fetch('http://127.0.0.1:4002/api/local/combined-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareId: token, cameraIds }),
          signal: AbortSignal.timeout(8000)
        });
        if (agentRes.ok) {
          const agentData = await agentRes.json() as any;
          registeredInGo2rtc = agentData.registeredInGo2rtc;
          go2rtcNote = agentData.note || go2rtcNote;
        }
      } catch (e) {
        console.warn('[generate-link] Could not reach local-agent for immediate combined stream registration:', e);
      }

      // No ?token= — the shareId in the path IS the access secret
      const rtspUrl = `rtsp://${host}:8554/combined_${token}`;

      return c.json({
        success: true,
        token,
        user_label: userLabel,
        daily_limit_minutes: dailyLimitMinutes ? Number(dailyLimitMinutes) : 0,
        allow_ptz: ptzAllowed === 1,
        allow_recording: recordingAllowed === 1,
        allow_audio: audioAllowed === 1,
        rtspUrl,
        go2rtc: {
          registered: registeredInGo2rtc,
          streamName: `combined_${token}`,
          dashboard: 'http://127.0.0.1:1984',
          note: go2rtcNote
        }
      });
    } else {
      // Individual per-camera RTSP links
      for (const camId of cameraIds) {
        const cam = await c.env.DB.prepare(`SELECT name, public_ip, forwarded_port FROM cameras WHERE id = ?`).bind(camId).first();
        if (cam) {
          const host = public_ip || (cam.public_ip as string) || '202.163.103.241';
          const port = (cam.forwarded_port as number) || 8554;
          rtspLinks.push(`rtsp://${host}:${port}/${cam.name}?token=${token}`);
        }
      }
    }

    return c.json({ 
      success: true, 
      token, 
      user_label: userLabel, 
      daily_limit_minutes: dailyLimitMinutes ? Number(dailyLimitMinutes) : 0,
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
    const today = new Date().toISOString().split('T')[0];
    const { results } = await c.env.DB.prepare(`
      SELECT t.*, 
             (SELECT action FROM audit_logs a WHERE a.token = t.token ORDER BY timestamp DESC LIMIT 1) as last_action,
             (SELECT timestamp FROM audit_logs a WHERE a.token = t.token ORDER BY timestamp DESC LIMIT 1) as last_used,
             IFNULL((SELECT seconds_used FROM usage_logs u WHERE u.share_id = t.token AND u.date = ?), 0) as seconds_used
      FROM access_tokens t
    `).bind(today).all();

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

app.get('/api/admin/recordings', requireAuth, async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const cameraId = c.req.query('cameraId');
    let dateStr = c.req.query('date');
    if (!cameraId || !dateStr) return c.json({ error: 'Missing parameters' }, 400);

    let queryStr = '';
    let params: any[] = [];
    
    if (cameraId === 'all') {
      queryStr = `SELECT segment_start, segment_end, duration_seconds FROM recordings WHERE 1=1`;
    } else {
      const cam = await c.env.DB.prepare('SELECT id FROM cameras WHERE name = ? OR id = ?').bind(cameraId, cameraId).first();
      if (!cam) return c.json({ error: 'Camera not found' }, 404);

      queryStr = `SELECT segment_start, segment_end, duration_seconds FROM recordings WHERE camera_id = ?`;
      params = [cam.id];
    }

    if (dateStr === 'today') {
      dateStr = calendarDateInTz();
    }
    const { start: startOfDay, end: endOfDay } = localDayBoundsIso(dateStr);
    queryStr += ` AND segment_start >= ? AND segment_start <= ? ORDER BY segment_start ASC`;
    params.push(startOfDay, endOfDay);

    const { results } = await c.env.DB.prepare(queryStr).bind(...params).all();

    const segments = [];
    for (const r of results) {
      segments.push({
        start: clockHmInTz(r.segment_start as string),
        end: clockHmInTz(r.segment_end as string),
        status: 'recorded'
      });
    }

    const dedupSegs = [];
    const seen = new Set();
    for (const s of segments) {
      const key = s.start + '-' + s.end;
      if (!seen.has(key)) {
        seen.add(key);
        dedupSegs.push(s);
      }
    }

    return c.json({ success: true, cameraId, date: dateStr, segments: dedupSegs });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// User Viewer Endpoints
// -----------------------------------------------------------------------------
app.get('/api/view/recordings', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'Missing token' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const tokenRow = await c.env.DB.prepare('SELECT * FROM access_tokens WHERE token = ?').bind(token).first();
    if (!tokenRow || tokenRow.is_revoked) return c.json({ error: 'Invalid or revoked token' }, 403);
    
    if (!tokenRow.recording_access_start || !tokenRow.recording_access_end) {
      return c.json({ error: 'No recording access' }, 403);
    }

    const allowedCameras = JSON.parse(tokenRow.allowed_cameras as string || '[]');
    if (allowedCameras.length === 0) return c.json({ success: true, recordings: [] });

    const placeholders = allowedCameras.map(() => '?').join(',');
    const recordings = await c.env.DB.prepare(`
      SELECT r.*, c.name as camera_name, c.display_name
      FROM recordings r
      JOIN cameras c ON r.camera_id = c.id
      WHERE r.camera_id IN (${placeholders})
      AND r.segment_start >= ?
      AND r.segment_end <= ?
      ORDER BY r.segment_start DESC
    `).bind(...allowedCameras, tokenRow.recording_access_start, tokenRow.recording_access_end).all();

    return c.json({ success: true, recordings: recordings.results });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/view/recordings/:id/stream', async (c) => {
  const { id } = c.req.param();
  const token = c.req.query('token');
  if (!token) return c.body('Missing token', 400);
  
  try {
    const tokenRow = await c.env.DB.prepare('SELECT * FROM access_tokens WHERE token = ?').bind(token).first();
    if (!tokenRow || tokenRow.is_revoked) return c.body('Invalid token', 403);
    if (!tokenRow.recording_access_start || !tokenRow.recording_access_end) return c.body('No recording access', 403);

    const recording = await c.env.DB.prepare('SELECT * FROM recordings WHERE id = ?').bind(id).first();
    if (!recording) return c.body('Not found', 404);

    const allowedCameras = JSON.parse(tokenRow.allowed_cameras as string || '[]');
    if (!allowedCameras.includes(Number(recording.camera_id)) && !allowedCameras.includes(String(recording.camera_id))) {
      return c.body('Forbidden camera', 403);
    }

    const recStart = new Date(recording.segment_start as string).getTime();
    const recEnd = new Date(recording.segment_end as string).getTime();
    const tStart = new Date(tokenRow.recording_access_start as string).getTime();
    const tEnd = new Date(tokenRow.recording_access_end as string).getTime();

    if (recStart < tStart || recEnd > tEnd) return c.body('Out of bounds', 403);

    const parts = (recording.file_path as string).split(/[\\/]/);
    const fileName = parts[parts.length - 1];

    const proxyRes = await fetch(`http://127.0.0.1:4002/clips/${recording.camera_id}/${fileName}`, {
      headers: c.req.raw.headers
    });
    
    return new Response(proxyRes.body, proxyRes);
  } catch (err) {
    return c.body(String(err), 500);
  }
});

app.get('/api/view/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'Missing token' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const accessToken = await c.env.DB.prepare('SELECT * FROM access_tokens WHERE token = ?').bind(token).first();
    if (!accessToken) return c.json({ success: false, message: 'Invalid token' }, 403);
    if (accessToken.is_revoked) return c.json({ success: false, message: 'Token has been revoked by admin' }, 403);

    // Check daily usage limit
    if (accessToken.daily_limit_minutes && accessToken.daily_limit_minutes > 0) {
      const today = new Date().toISOString().split('T')[0];
      const usageRow = await c.env.DB.prepare('SELECT seconds_used FROM usage_logs WHERE share_id = ? AND date = ?').bind(token, today).first();
      const secondsUsed = usageRow ? (usageRow.seconds_used as number) : 0;
      if (secondsUsed >= accessToken.daily_limit_minutes * 60) {
        return c.json({ success: false, message: 'Daily viewing time limit has been reached.' }, 403);
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
    const cameras = await c.env.DB.prepare(`SELECT id, name, display_name, rtsp_url, sub_stream_url, camera_brand, capabilities FROM cameras WHERE id IN (${placeholders})`).bind(...allowedCameraIds).all();

    const host = new URL(c.req.url).hostname || 'localhost';
    const streams = (cameras.results || []).map((cam: any) => {
      let caps = {};
      try { caps = cam.capabilities ? JSON.parse(cam.capabilities) : {}; } catch(e){}
      return {
        id: cam.id,
        name: cam.name,
        display_name: cam.display_name || cam.name,
        camera_brand: cam.camera_brand,
        capabilities: caps,
        streamUrl: `http://${host}:1984/stream.html?src=${encodeURIComponent(cam.name)}&mode=webrtc,mse`
      };
    });

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
// Live Session Internal & SSE Endpoints
// -----------------------------------------------------------------------------

app.post('/api/internal/session-event', async (c) => {
  const { token, camera_id, action, duration_seconds } = await c.req.json();
  if (!token || !action) return c.json({ error: 'Missing token or action' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

    try {
      await c.env.DB.prepare(
        'INSERT INTO audit_logs (token, action, camera_id, duration_seconds) VALUES (?, ?, ?, ?)'
      ).bind(token, action, camera_id || null, duration_seconds || null).run();

      if (action === 'ENTER') {
        const now = Date.now();
        await c.env.DB.prepare(
          'INSERT INTO active_sessions_tracker (token, camera_id, start_time, last_ping) VALUES (?, ?, ?, ?)'
        ).bind(token, camera_id || null, now, now).run();
      } else if (action === 'EXIT') {
        await c.env.DB.prepare('DELETE FROM active_sessions_tracker WHERE token = ?').bind(token).run();
      }

      // Broadcast via SSE
      broadcastSessionEvent({
        token,
        camera_id,
        action,
        duration_seconds,
        timestamp: new Date().toISOString()
      });

      return c.json({ success: true });
    } catch (err) {
      return c.json({ error: String(err) }, 500);
    }
});

app.post('/api/internal/heartbeat', async (c) => {
  const token = c.req.header('x-internal-token');
  if (token !== getInternalToken(c)) return c.json({ error: 'Unauthorized' }, 401);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  const now = Date.now();
  await c.env.DB.prepare('INSERT OR REPLACE INTO agent_status (id, last_heartbeat) VALUES (1, ?)').bind(now).run();
  return c.json({ success: true, timestamp: now });
});

app.get('/api/admin/agent-status', async (c) => {
  const adminCookie = getCookie(c, 'admin_session');
  if (!adminCookie || adminCookie !== c.env.ADMIN_SECRET) return c.json({ error: 'Unauthorized' }, 401);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  const row = await c.env.DB.prepare('SELECT last_heartbeat FROM agent_status WHERE id = 1').first();
  return c.json({ success: true, last_heartbeat: row ? row.last_heartbeat : null });
});

app.post('/api/internal/recordings', async (c) => {
  const { camera_id, file_path, segment_start, segment_end, duration_seconds } = await c.req.json();
  if (!camera_id || !file_path || !segment_start || !segment_end || duration_seconds == null) {
    return c.json({ error: 'Missing parameters' }, 400);
  }
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO recordings (camera_id, file_path, segment_start, segment_end, duration_seconds) VALUES (?, ?, ?, ?, ?)'
    ).bind(camera_id, file_path, segment_start, segment_end, duration_seconds).run();

    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/internal/recordings/protected', async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const now = new Date().toISOString();
    const tokens = await c.env.DB.prepare(`
      SELECT token, user_label, allowed_cameras, recording_access_start, recording_access_end 
      FROM access_tokens 
      WHERE is_revoked = 0 
      AND recording_access_start IS NOT NULL 
      AND recording_access_end > ?
    `).bind(now).all();
    return c.json({ success: true, tokens: tokens.results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/internal/recordings/delete', async (c) => {
  const { deletedFiles } = await c.req.json();
  if (!deletedFiles || !Array.isArray(deletedFiles) || deletedFiles.length === 0) {
    return c.json({ success: true });
  }
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const placeholders = deletedFiles.map(() => '?').join(',');
    await c.env.DB.prepare(`DELETE FROM recordings WHERE file_path IN (${placeholders})`)
      .bind(...deletedFiles)
      .run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.get('/api/admin/sessions/live', requireAuth, async (c) => {
  return streamSSE(c, async (stream) => {
    sseClients.add(stream);
    
    stream.onAbort(() => {
      sseClients.delete(stream);
    });

    // Keep-alive loop to prevent Cloudflare Worker timeout
    while (true) {
      await stream.sleep(15000);
      try {
        await stream.writeSSE({ data: 'ping' });
      } catch (e) {
        sseClients.delete(stream);
        break;
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Internal RTSP Proxy Endpoints
// -----------------------------------------------------------------------------

app.get('/api/internal/combined-shares', async (c) => {
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);
  try {
    const { results } = await c.env.DB.prepare('SELECT token, allowed_cameras FROM access_tokens WHERE is_combined = 1 AND is_revoked = 0').all();
    return c.json({ success: true, shares: results || [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

app.post('/api/internal/usage', async (c) => {
  const { token, secondsToAdd } = await c.req.json();
  if (!token) return c.json({ error: 'Missing token' }, 400);
  if (!c.env.DB) return c.json({ error: 'DB not available' }, 500);

  try {
    const accessToken = await c.env.DB.prepare('SELECT daily_limit_minutes FROM access_tokens WHERE token = ? AND is_revoked = 0').bind(token).first();
    if (!accessToken) return c.json({ valid: false, reason: 'Invalid or revoked token' });

    const now = Date.now();
    await c.env.DB.prepare('UPDATE active_sessions_tracker SET last_ping = ? WHERE token = ?').bind(now, token).run();

    const today = new Date().toISOString().split('T')[0];
    
    // Add seconds and get new value
    if (secondsToAdd > 0) {
      await c.env.DB.prepare(`
        INSERT INTO usage_logs (share_id, date, seconds_used) 
        VALUES (?, ?, ?)
        ON CONFLICT(share_id, date) DO UPDATE SET seconds_used = seconds_used + ?
      `).bind(token, today, secondsToAdd, secondsToAdd).run();
    }

    const usageRow = await c.env.DB.prepare('SELECT seconds_used FROM usage_logs WHERE share_id = ? AND date = ?').bind(token, today).first();
    const secondsUsed = usageRow ? (usageRow.seconds_used as number) : 0;
    
    const limitMinutes = (accessToken.daily_limit_minutes as number) || 0;
    const isExceeded = limitMinutes > 0 && secondsUsed >= limitMinutes * 60;

    return c.json({
      valid: !isExceeded,
      secondsUsed,
      limitMinutes
    });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// -----------------------------------------------------------------------------
// PTZ Camera Control API (Admin & Authorized Viewers)
// -----------------------------------------------------------------------------

app.post('/api/camera/ptz', async (c) => {
  const { token, cameraId, command, speed, flip, mirror } = await c.req.json();

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
  const encKey = getEncryptionKey(c);
  let pass = cam.password ? await decryptPassword(cam.password as string, encKey) : 'admin123';
  let host = cam.public_ip || '192.168.50.101';
  let port = cam.forwarded_port || 80;
  let user = cam.username || 'admin';
  const camName = String(cam.name || '');
  const brand = String(cam.camera_brand || (camName.includes('ezviz') ? 'EZVIZ' : 'Dahua'));

  if (cam.rtsp_url) {
    const match = (cam.rtsp_url as string).match(/:\/\/(?:([^:]+):([^@]+)@)?([^:/]+)(?::(\d+))?/);
    if (match) {
      if (match[1]) user = decodeURIComponent(match[1]);
      if (match[3]) host = match[3];
      // Note: match[2] is likely '***' due to DB stripping, so we rely on the decrypted `pass` variable
    }
  }

  console.log(`[PTZ] Executing ${command} on ${camName} (${brand} @ ${host}) with speed ${speed || 0.5}, flip: ${flip}, mirror: ${mirror}`);

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
        speed: speed || 0.5,
        flip,
        mirror
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
  const cam = await c.env.DB.prepare('SELECT rtsp_url, password FROM cameras WHERE id = ?').bind(cameraId).first();
  if (!cam || !cam.rtsp_url) throw new Error('Camera not found');
  const urlRegex = /:\/\/(.+):(.+)@([^:]+)/;
  const match = (cam.rtsp_url as string).match(urlRegex);
  if (!match) throw new Error('Invalid URL');
  
  const encKey = getEncryptionKey(c);
  const decryptedPass = cam.password ? await decryptPassword(cam.password as string, encKey) : match[2];
  
  const [, username, _dbPassword, hostname] = match;
  const reqFn = (globalThis as any).require;
  const onvifLib = (globalThis as any).onvif || (reqFn ? reqFn('node-onvif') : {});
  const device = new onvifLib.OnvifDevice({
    xaddr: `http://${hostname}:80/onvif/device_service`,
    user: username,
    pass: decryptedPass
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
    
    let rawPresets = res.data.Preset;
    if (!rawPresets && res.data.GetPresetsResponse && res.data.GetPresetsResponse.Preset) {
      rawPresets = res.data.GetPresetsResponse.Preset;
    }
    
    const presetList = Array.isArray(rawPresets) ? rawPresets : (rawPresets ? [rawPresets] : []);
    const presets = presetList.map((p: any) => ({
      name: p.Name,
      token: (p.$ && p.$.token) ? p.$.token : p.token
    }));
    
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

export default {
  fetch: app.fetch,
  scheduled: async (batch: any, env: any, ctx: any) => {
    try {
      const now = Date.now();
      const staleThreshold = now - 60000; // 60 seconds (since cron runs every minute)
      
      const { results } = await env.DB.prepare('SELECT * FROM active_sessions_tracker WHERE last_ping < ?').bind(staleThreshold).all();
      
      if (results && results.length > 0) {
        for (const session of results) {
          const duration_seconds = Math.round((now - session.start_time) / 1000);
          
          await env.DB.prepare(
            'INSERT INTO audit_logs (token, action, camera_id, duration_seconds) VALUES (?, ?, ?, ?)'
          ).bind(session.token, 'EXIT', session.camera_id, duration_seconds).run();
          
          await env.DB.prepare('DELETE FROM active_sessions_tracker WHERE token = ?').bind(session.token).run();
          
          console.log(`[Cron Staleness Tracker] Auto-resolved session for ${session.token} to EXIT due to timeout.`);
          
          // Best effort broadcast (will only reach SSE clients on this specific isolate)
          broadcastSessionEvent({
            token: session.token,
            camera_id: session.camera_id,
            action: 'EXIT',
            duration_seconds,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('[Cron Staleness Tracker] Error during cron sweep:', e);
    }
  }
};
