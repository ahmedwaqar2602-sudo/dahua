const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const onvif = require('node-onvif');

let go2rtcProc = null;
function ensureGo2rtc() {
  const exePath = path.join(__dirname, 'go2rtc.exe');
  if (!fs.existsSync(exePath)) return;
  fetch('http://127.0.0.1:1984/api').catch(() => {
    if (!go2rtcProc) {
      console.log('[Agent] Spawning go2rtc engine on port 1984...');
      go2rtcProc = spawn(exePath, [], { cwd: __dirname, stdio: 'ignore' });
      go2rtcProc.on('exit', () => { go2rtcProc = null; });
    }
  });
}

const API_BASE = 'http://localhost:8787';
const headers = { 'Cookie': 'admin_token=authenticated_session', 'Content-Type': 'application/json' };

const state = {
  cameras: [],
  patrols: [],
  failedPings: {},
  patrolState: {},
  lastDayNight: {}
};

async function fetchState() {
  try {
    const camRes = await fetch(`${API_BASE}/api/admin/cameras`, { headers });
    const camData = await camRes.json();
    if (camData.success) state.cameras = camData.cameras;

    const patRes = await fetch(`${API_BASE}/api/admin/patrols`, { headers });
    const patData = await patRes.json();
    if (patData.success) state.patrols = patData.patrols;
  } catch (err) {
    console.error('[Agent] Failed to fetch state from backend', err.message);
  }
}

async function syncGo2rtc() {
  for (const cam of state.cameras) {
    try {
      let mainUrl = cam.rtsp_url;
      let subUrl = cam.sub_stream_url || cam.rtsp_url;
      if (!mainUrl.includes('#')) mainUrl += '#video=copy#audio=copy';
      if (!subUrl.includes('#')) subUrl += '#video=copy#audio=copy';
      const baseName = cam.name.replace(/_sub$/, '');
      await fetch(`http://127.0.0.1:1984/api/streams?name=${baseName}&src=${encodeURIComponent(mainUrl)}`, { method: 'PUT' });
      await fetch(`http://127.0.0.1:1984/api/streams?name=${baseName}_sub&src=${encodeURIComponent(subUrl)}`, { method: 'PUT' });
    } catch(e) {}
  }
}

// Device connection cache for instantaneous PTZ control
const onvifCache = {};

async function getCachedOnvif(host, user, pass) {
  const key = `${user}:${host}`;
  if (onvifCache[key]) return onvifCache[key];

  const device = new onvif.OnvifDevice({
    xaddr: `http://${host}/onvif/device_service`,
    user: user,
    pass: pass
  });

  try {
    await device.init();
    onvifCache[key] = device;
    return device;
  } catch (err) {
    console.warn(`[PTZ Agent] ONVIF init failed for ${host}:`, err.message);
    return null;
  }
}


function sendDahuaDigestPtz(host, user, pass, command, speed = 4) {
  const codeMap = {
    'UP': 'Up', 'DOWN': 'Down', 'LEFT': 'Left', 'RIGHT': 'Right',
    'ZOOM_IN': 'ZoomTele', 'ZOOM_OUT': 'ZoomWide', 'STOP': 'Stop'
  };
  const code = codeMap[command] || 'Stop';
  const action = command === 'STOP' ? 'stop' : 'start';
  const rawUrl = `http://${host}/cgi-bin/ptz.cgi?action=${action}&channel=1&code=${code}&arg1=0&arg2=${speed}&arg3=0`;

  http.get(rawUrl, (res) => {
    if (res.statusCode === 401 && res.headers['www-authenticate']) {
      const auth = res.headers['www-authenticate'];
      const realm = (auth.match(/realm="([^"]+)"/) || [])[1] || '';
      const nonce = (auth.match(/nonce="([^"]+)"/) || [])[1] || '';
      const opaque = (auth.match(/opaque="([^"]+)"/) || [])[1] || '';
      const qop = (auth.match(/qop="([^"]+)"/) || [])[1] || '';
      const u = new URL(rawUrl);

      const ha1 = crypto.createHash('md5').update(`${user}:${realm}:${pass}`).digest('hex');
      const ha2 = crypto.createHash('md5').update(`GET:${u.pathname}${u.search}`).digest('hex');
      let authStr = '';

      if (qop.includes('auth')) {
        const nc = '00000001';
        const cnonce = crypto.randomBytes(8).toString('hex');
        const resp = crypto.createHash('md5').update(`${ha1}:${nonce}:${nc}:${cnonce}:auth:${ha2}`).digest('hex');
        authStr = `Digest username="${user}", realm="${realm}", nonce="${nonce}", uri="${u.pathname}${u.search}", response="${resp}", qop=auth, nc=${nc}, cnonce="${cnonce}"`;
      } else {
        const resp = crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');
        authStr = `Digest username="${user}", realm="${realm}", nonce="${nonce}", uri="${u.pathname}${u.search}", response="${resp}"`;
      }
      if (opaque) authStr += `, opaque="${opaque}"`;

      http.get(rawUrl, { headers: { 'Authorization': authStr } }, (r2) => {
        console.log(`[PTZ Agent] Dahua ${command} -> Status ${r2.statusCode}`);
      }).on('error', () => {});
    } else {
      console.log(`[PTZ Agent] Dahua ${command} -> Status ${res.statusCode}`);
    }
  }).on('error', (e) => console.warn('[PTZ Agent] Dahua error:', e.message));
}

// Local PTZ HTTP Server for backend worker delegation
const ptzServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/local/ptz') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', async () => {
      try {
        const { brand, host, user, pass, command, speed = 0.5 } = JSON.parse(bodyStr || '{}');
        console.log(`[PTZ Agent] Received ${command} for ${brand} @ ${host}`);

        // Try ONVIF first (works directly on motorized EZVIZ & ONVIF cameras)
        const onvifDev = await getCachedOnvif(host, user, pass);
        if (onvifDev && onvifDev.services && onvifDev.services.ptz) {
          if (command === 'STOP') {
            await onvifDev.ptzStop().catch(() => {});
          } else {
            const speedVal = speed || 0.5;
            const speedVec = { x: 0, y: 0, z: 0 };
            if (command === 'UP') speedVec.y = speedVal;
            if (command === 'DOWN') speedVec.y = -speedVal;
            if (command === 'LEFT') speedVec.x = -speedVal;
            if (command === 'RIGHT') speedVec.x = speedVal;
            if (command === 'ZOOM_IN') speedVec.z = speedVal;
            if (command === 'ZOOM_OUT') speedVec.z = -speedVal;

            await onvifDev.ptzMove({ speed: speedVec, timeout: 1 }).catch(() => {});
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, method: 'ONVIF' }));
        }

        // Fallback to Dahua CGI with Digest Auth
        if (brand === 'Dahua' || host === '192.168.50.101' || host === '192.168.18.150') {
          const dahuaSpeed = Math.round((speed || 0.5) * 8);
          sendDahuaDigestPtz(host, user, pass, command, dahuaSpeed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, method: 'Dahua-Digest-CGI' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, method: 'dispatched' }));
      } catch (err) {
        console.error('[PTZ Agent] Processing error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

ptzServer.listen(4002, () => {
  console.log('[PTZ Agent] Hardware PTZ listener active on port 4002');
});


async function runWatchdog() {
  for (const cam of state.cameras) {
    if (!cam.rtsp_url.startsWith('onvif://')) {
      // For RTSP, we might just assume online or check port. Stubbing for RTSP.
      await fetch(`${API_BASE}/api/admin/cameras/${cam.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ last_seen: new Date().toISOString() })
      });
      continue;
    }

    try {
      const urlRegex = /:\/\/(.+):(.+)@([^:]+)/;
      const match = cam.rtsp_url.match(urlRegex);
      if (!match) continue;
      const [, username, password, hostname] = match;

      const device = new onvif.OnvifDevice({
        xaddr: `http://${hostname}:80/onvif/device_service`,
        user: username,
        pass: password
      });

      await device.init();
      // Success! Update status
      await fetch(`${API_BASE}/api/admin/cameras/${cam.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ last_seen: new Date().toISOString() })
      });
      state.failedPings[cam.id] = 0;
    } catch (err) {
      console.warn(`[Agent] Camera ${cam.name} ping failed.`);
      state.failedPings[cam.id] = (state.failedPings[cam.id] || 0) + 1;
      if (state.failedPings[cam.id] === 3) {
        console.error(`[Agent] ALERT: Camera ${cam.name} is OFFLINE (Mocking Web Push Notification)`);
      }
    }
  }
}

async function runPatrols() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const patrol of state.patrols) {
    if (!patrol.schedule_start || !patrol.schedule_end) continue;
    const [sH, sM] = patrol.schedule_start.split(':').map(Number);
    const [eH, eM] = patrol.schedule_end.split(':').map(Number);
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;

    let isActive = false;
    if (startMin <= endMin) {
      isActive = currentMinutes >= startMin && currentMinutes <= endMin;
    } else {
      isActive = currentMinutes >= startMin || currentMinutes <= endMin;
    }

    if (isActive) {
      let pState = state.patrolState[patrol.id];
      if (!pState) {
        pState = { currentIndex: 0, nextMoveTime: 0 };
        state.patrolState[patrol.id] = pState;
      }

      if (now.getTime() >= pState.nextMoveTime) {
        try {
          const presets = JSON.parse(patrol.presets_json);
          if (presets.length === 0) continue;
          
          if (pState.currentIndex >= presets.length) pState.currentIndex = 0;
          const currentPreset = presets[pState.currentIndex];
          
          // Send goto command
          await fetch(`${API_BASE}/api/camera/${patrol.camera_id}/presets`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ presetToken: currentPreset.token, action: 'goto' })
          });
          console.log(`[Agent] Patrol for cam ${patrol.camera_id}: Moved to preset ${currentPreset.token}`);

          pState.currentIndex++;
          pState.nextMoveTime = now.getTime() + (currentPreset.dwell || 10) * 1000;
        } catch(e) {
          console.error(`[Agent] Patrol error for cam ${patrol.camera_id}:`, e.message);
        }
      }
    } else {
      delete state.patrolState[patrol.id];
    }
  }
}

async function runDayNight() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const cam of state.cameras) {
    if (!cam.day_mode_start || !cam.night_mode_start) continue;

    const [dH, dM] = cam.day_mode_start.split(':').map(Number);
    const [nH, nM] = cam.night_mode_start.split(':').map(Number);
    const dayMin = dH * 60 + dM;
    const nightMin = nH * 60 + nM;

    let expectedMode = 'day';
    // Logic: if current time is between dayMin and nightMin, it's day. Otherwise night.
    if (dayMin < nightMin) {
      expectedMode = (currentMinutes >= dayMin && currentMinutes < nightMin) ? 'day' : 'night';
    } else {
      expectedMode = (currentMinutes >= dayMin || currentMinutes < nightMin) ? 'day' : 'night';
    }

    if (state.lastDayNight[cam.id] !== expectedMode) {
      state.lastDayNight[cam.id] = expectedMode;
      console.log(`[Agent] Switching camera ${cam.name} to ${expectedMode} mode...`);
      // Since ONVIF SetImagingSettings can be complex and varies per camera,
      // we'll mock the actual API call here or make a best-effort ONVIF call if possible.
      // Usually it's IR filter: expectedMode === 'night' ? 'OFF' : 'ON'
      try {
        const urlRegex = /:\/\/(.+):(.+)@([^:]+)/;
        const match = cam.rtsp_url.match(urlRegex);
        if (match) {
          const [, username, password, hostname] = match;
          const device = new onvif.OnvifDevice({
            xaddr: `http://${hostname}:80/onvif/device_service`,
            user: username,
            pass: password
          });
          await device.init();
          if (device.services.imaging) {
            const profile = device.getCurrentProfile();
            await device.services.imaging.setImagingSettings({
              VideoSourceToken: profile.videoSourceConfiguration.sourceToken,
              ImagingSettings: {
                IrCutFilter: expectedMode === 'night' ? 'OFF' : 'ON' // OFF means no IR cut filter = IR enabled
              }
            });
            console.log(`[Agent] Successfully switched ${cam.name} to ${expectedMode} mode.`);
          }
        }
      } catch(e) {
        console.error(`[Agent] Failed to set day/night mode on ${cam.name}:`, e.message);
      }
    }
  }
}

// Main Loop
async function agentLoop() {
  ensureGo2rtc();
  await fetchState();
  await syncGo2rtc();
  await runWatchdog();
  await runDayNight();
}

console.log('[Agent] Starting authoritative camera agent...');
ensureGo2rtc();
setInterval(agentLoop, 10000);
agentLoop();
setInterval(runPatrols, 2000);
