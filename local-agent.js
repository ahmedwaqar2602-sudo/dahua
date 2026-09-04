const fs = require('fs');
if (fs.existsSync('.env')) {
  process.loadEnvFile('.env');
}
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const onvif = require('node-onvif');
const net = require('net');

let go2rtcProc = null;
function ensureGo2rtc() {
  const exePath = path.join(__dirname, 'go2rtc.exe');
  if (!fs.existsSync(exePath)) return;
  fetch('http://127.0.0.1:1984/api').catch(() => {
    if (!go2rtcProc) {
      console.log('[Agent] Spawning go2rtc engine on port 1984...');
      go2rtcProc = spawn(exePath, [], { cwd: __dirname, stdio: 'ignore', windowsHide: true });
      go2rtcProc.on('exit', () => { go2rtcProc = null; });
    }
  });
}

const API_BASE = 'http://localhost:8787';
const headers = { 'Cookie': 'admin_token=authenticated_session', 'Content-Type': 'application/json', 'x-internal-token': process.env.INTERNAL_API_KEY || 'default-fallback-token-for-dev' };

const state = {
  cameras: [],
  patrols: [],
  failedPings: {},
  patrolState: {},
  lastDayNight: {},
  recordingModes: {},
  recordingManagerReady: false
};

try {
  if (fs.existsSync('recording-modes.json')) {
    state.recordingModes = JSON.parse(fs.readFileSync('recording-modes.json'));
  }
} catch (e) {}

function saveRecordingModes() {
  fs.writeFileSync('recording-modes.json', JSON.stringify(state.recordingModes));
}

// ─── Combined Stream Manager ──────────────────────────────────────────────────
// Uses go2rtc's exec: source to spawn one FFmpeg process per combined share.
// FFmpeg pulls each camera from go2rtc's own RTSP port (8556) and composites
// them into a single tiled video that go2rtc serves on the external port (8554).
const CombinedStreamManager = {
  active: {}, // shareId -> { cams, proc }

  buildFilterComplex(n) {
    const w = 640, h = 360;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const total = cols * rows;

    const parts = [];
    for (let i = 0; i < n; i++) parts.push(`[${i}:v]scale=${w}:${h}[v${i}]`);
    for (let i = n; i < total; i++) parts.push(`color=c=black:s=${w}x${h}:r=15[v${i}]`);

    const vInputs = Array.from({ length: total }, (_, i) => `[v${i}]`).join('');
    if (total === 2) {
      parts.push(`${vInputs}hstack=inputs=2[v]`);
    } else {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c === 0 ? '0' : Array.from({ length: c }, (_, k) => `w${k}`).join('+');
          const y = r === 0 ? '0' : Array.from({ length: r }, (_, k) => `h${k * cols}`).join('+');
          layout.push(`${x}_${y}`);
        }
      }
      parts.push(`${vInputs}xstack=inputs=${total}:layout=${layout.join('|')}[v]`);
    }
    return parts.join(';'); 
  },

  async sync(shareId, cams) {
    if (!cams || cams.length < 2) return;
    
    try {
      const url = `http://127.0.0.1:1984/api/streams?name=combined_${shareId}&src=rtsp://`;
      await fetch(url, { method: 'PATCH' });
    } catch (e) {}

    let config = this.active[shareId];
    if (config) {
      config.cams = cams;
    } else {
      config = { cams, proc: null };
      this.active[shareId] = config;
    }

    this.startProcess(shareId);
  },

  startProcess(shareId) {
    const config = this.active[shareId];
    if (!config || config.proc) return;

    console.log(`[CombinedStream] ⏵ Starting ffmpeg for combined_${shareId}...`);
    const ffmpegBin = path.join(__dirname, 'ffmpeg.exe');
    const filterComplex = this.buildFilterComplex(config.cams.length);

    const args = ['-hide_banner'];
    for (const cam of config.cams) {
      args.push('-rtsp_transport', 'tcp', '-i', `rtsp://127.0.0.1:8556/${cam.name}`);
    }
    args.push(
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-rtsp_transport', 'tcp',
      '-f', 'rtsp',
      `rtsp://127.0.0.1:8556/combined_${shareId}`
    );

    config.proc = spawn(ffmpegBin, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    config.proc.stderr.on('data', (data) => {
      console.log(`[FFmpeg Error] ${data.toString()}`);
    });

    config.proc.on('exit', (code) => {
      console.log(`[CombinedStream] ⏹ ffmpeg for combined_${shareId} exited with code ${code}`);
      if (this.active[shareId]) {
        this.active[shareId].proc = null;
        setTimeout(() => this.startProcess(shareId), 5000);
      }
    });
  },

  async remove(shareId) {
    if (this.active[shareId]) {
      const proc = this.active[shareId].proc;
      delete this.active[shareId];
      if (proc) {
        proc.kill('SIGKILL');
      }
    }
  }
};


const RecordingManager = {
  processes: {},
  motionTimeouts: {},
  async syncClipsToDb() {
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
            await fetch('http://127.0.0.1:8787/api/internal/recordings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                camera_id: Number(camId),
                file_path: path.join(camDir, file),
                segment_start: parsedStart.toISOString(),
                segment_end: actualSegmentEnd.toISOString(),
                duration_seconds: durationSeconds
              })
            });
          } catch(e) {}
        }
      }
    }
  },
  updateMode(cam, mode) {
    if (this.processes[cam.id]) {
      if (this.processes[cam.id].flushSegment) {
        this.processes[cam.id].flushSegment();
      }
      this.processes[cam.id].kill('SIGTERM');
      delete this.processes[cam.id];
    }
    if (this.motionTimeouts[cam.id]) {
      clearTimeout(this.motionTimeouts[cam.id]);
      delete this.motionTimeouts[cam.id];
    }
    
    // Trigger syncClipsToDb to pick up any orphaned files
    this.syncClipsToDb().catch(e => console.error('[RecordingManager] syncClipsToDb error:', e));
    
    if (mode === 'continuous') {
      this.startContinuous(cam);
    } else if (mode === 'motion') {
      this.startMotion(cam);
    }
  },
  
  startContinuous(cam) {
    const clipDir = path.join(__dirname, 'clips', String(cam.id));
    fs.mkdirSync(clipDir, { recursive: true });
    
    // We expect the go2rtc restream URL at 127.0.0.1:8554
    const url = `rtsp://127.0.0.1:8554/${cam.name}`;
    console.log(`[RecordingManager] Starting continuous for ${cam.name}`);
    const proc = spawn(path.join(__dirname, 'ffmpeg.exe'), [
      '-y', '-i', url,
      '-c', 'copy',
      '-f', 'segment',
      '-segment_time', '180',
      '-segment_format', 'mp4',
      '-reset_timestamps', '1',
      '-strftime', '1',
      path.join(clipDir, '%Y%m%d_%H%M%S.mp4')
    ], { windowsHide: true });
    
    this.processes[cam.id] = proc;
    
    let currentSegmentFile = null;
    let currentSegmentStartTime = null;

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      // Look for FFmpeg writing a new segment file
      const match = str.match(/Opening '(.+?)' for writing/);
      if (match) {
        const nextSegmentFile = match[1];
        const now = new Date();
        
        if (currentSegmentFile) {
          const duration_seconds = Math.round((now - currentSegmentStartTime) / 1000);
          this.postSegmentMetadata(cam.id, currentSegmentFile, currentSegmentStartTime, now, duration_seconds);
        }
        
        currentSegmentFile = nextSegmentFile;
        currentSegmentStartTime = now;
      }
    });
    
    proc.flushSegment = () => {
      if (currentSegmentFile) {
        const now = new Date();
        const duration_seconds = Math.round((now - currentSegmentStartTime) / 1000);
        this.postSegmentMetadata(cam.id, currentSegmentFile, currentSegmentStartTime, now, duration_seconds);
        currentSegmentFile = null;
      }
    };

    proc.on('exit', () => {
      proc.flushSegment();

      if (state.recordingModes[cam.id] === 'continuous') {
        console.log(`[RecordingManager] ffmpeg exited for ${cam.name}, restarting in 5s...`);
        setTimeout(() => {
          if (state.recordingModes[cam.id] === 'continuous') this.startContinuous(cam);
        }, 5000);
      }
    });
  },

  postSegmentMetadata(cameraId, filePath, segmentStart, segmentEnd, durationSeconds) {
    let parsedStart = segmentStart;
    const base = path.basename(filePath);
    // Parse timestamp from filename: YYYYMMDD_HHMMSS.mp4
    const m = base.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
    if (m) {
      parsedStart = new Date(m[1], parseInt(m[2]) - 1, m[3], m[4], m[5], m[6]);
    }
    
    const actualSegmentEnd = new Date(parsedStart.getTime() + durationSeconds * 1000);

    fetch('http://127.0.0.1:8787/api/internal/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        camera_id: Number(cameraId),
        file_path: filePath,
        segment_start: parsedStart.toISOString(),
        segment_end: actualSegmentEnd.toISOString(),
        duration_seconds: durationSeconds
      })
    }).then(res => res.json()).then(res => {
      if (!res.success) console.warn(`[RecordingManager] Failed to index ${filePath}:`, res.error);
    }).catch(err => {
      console.error(`[RecordingManager] Error indexing recording ${filePath}:`, err.message);
    });
  },

  async startMotion(cam) {
    console.log(`[RecordingManager] Motion armed for ${cam.name}`);
    
    const urlRegex = /:\/\/(.+):(.+)@([^:]+)/;
    const match = cam.rtsp_url.match(urlRegex);
    if (!match) return;
    
    const [, username, password, hostname] = match;
    
    let isSubscribed = false;
    try {
      const device = await getCachedOnvif(hostname, username, password);
      if (device && device.services && device.services.events) {
        // Attempt ONVIF PullPoint Subscription
        await device.services.events.createPullPointSubscription();
        device.on('event', (evt) => {
          if (state.recordingModes[cam.id] !== 'motion') return;
          const blob = JSON.stringify(evt).toLowerCase();
          const isMotion = blob.includes('motion');
          const isStateTrue = blob.includes('true') || blob.includes('"state":1');
          
          if (isMotion) {
            if (isStateTrue) this.triggerMotionStart(cam);
            else this.triggerMotionStop(cam);
          }
        });
        isSubscribed = true;
        console.log(`[RecordingManager] Successfully subscribed to ONVIF events for ${cam.name}`);
      }
    } catch(e) {
      console.warn(`[RecordingManager] ONVIF event subscription failed for ${cam.name}: ${e.message}`);
    }
    
    if (!isSubscribed) {
      const brand = String(cam.camera_brand || '').toLowerCase();
      if (brand === 'ezviz') {
        console.warn(`[RecordingManager] Skipping Dahua CGI motion poll for ${cam.name}; use continuous mode or ONVIF events`);
      } else {
        console.log(`[RecordingManager] Falling back to Dahua CGI API for ${cam.name}`);
        this.pollDahuaMotion(cam, hostname, username, password);
      }
    }
  },
  
  pollDahuaMotion(cam, hostname, username, password) {
    if (state.recordingModes[cam.id] !== 'motion') return;
    
    const rawUrl = `http://${hostname}/cgi-bin/eventManager.cgi?action=getEventIndexes&code=VideoMotion`;
    sendDigestRequest(rawUrl, username, password, 'GET', null, (resCode, data) => {
       if (resCode === 200 && data) {
         if (data.includes('channels[0]=0')) {
           this.triggerMotionStart(cam);
         } else {
           this.triggerMotionStop(cam);
         }
       }
    });
    
    // Poll every 3 seconds
    setTimeout(() => {
      if (state.recordingModes[cam.id] === 'motion') {
         this.pollDahuaMotion(cam, hostname, username, password);
      }
    }, 3000);
  },
  
  triggerMotionStart(cam) {
    if (state.recordingModes[cam.id] !== 'motion') return;
    
    // If a stop timeout is pending, cancel it (motion re-triggered)
    if (this.motionTimeouts[cam.id]) {
       clearTimeout(this.motionTimeouts[cam.id]);
       delete this.motionTimeouts[cam.id];
    }
    
    if (this.processes[cam.id]) return; // Already recording
    
    const clipDir = path.join(__dirname, 'clips', String(cam.id));
    fs.mkdirSync(clipDir, { recursive: true });
    
    const url = `rtsp://127.0.0.1:8554/${cam.name}`;
    const filePath = path.join(clipDir, `${this.formatDate(new Date())}.mp4`);
    const segmentStart = new Date();
    console.log(`[RecordingManager] Motion start for ${cam.name}`);
    const proc = spawn(path.join(__dirname, 'ffmpeg.exe'), [
      '-y', '-i', url,
      '-c', 'copy',
      '-f', 'mp4',
      filePath
    ], { windowsHide: true });
    this.processes[cam.id] = proc;
    
    proc.on('exit', () => {
      if (this.processes[cam.id] === proc) delete this.processes[cam.id];
      const now = new Date();
      const duration_seconds = Math.max(1, Math.round((now - segmentStart) / 1000));
      this.postSegmentMetadata(cam.id, filePath, segmentStart, now, duration_seconds);
    });
  },
  
  triggerMotionStop(cam) {
    if (!this.processes[cam.id]) return;
    if (this.motionTimeouts[cam.id]) return; // Already stopping
    
    // 8 second post-roll
    this.motionTimeouts[cam.id] = setTimeout(() => {
      console.log(`[RecordingManager] Motion stop for ${cam.name} (post-roll)`);
      if (this.processes[cam.id]) {
        this.processes[cam.id].kill('SIGINT');
      }
      delete this.motionTimeouts[cam.id];
    }, 8000);
  },

  formatDate(d) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
};

async function fetchState() {
  try {
    const camRes = await fetch(`${API_BASE}/api/internal/cameras`, { headers });
    const camData = await camRes.json();
    if (camData.success) state.cameras = camData.cameras;

    const patRes = await fetch(`${API_BASE}/api/admin/patrols`, { headers });
    const patData = await patRes.json();
    if (patData.success) state.patrols = patData.patrols;

    const combinedRes = await fetch(`${API_BASE}/api/internal/combined-shares`, { headers });
    const combinedData = await combinedRes.json();
    if (combinedData.success) state.combinedShares = combinedData.shares;
  } catch (err) {
    console.error('[Agent] Failed to fetch state from backend', err.message);
  }
}

async function syncGo2rtc() {
  for (const cam of state.cameras) {
    try {
      let mainUrl = cam.rtsp_url;
      let subUrl = cam.sub_stream_url || cam.rtsp_url;
      const baseName = cam.name.replace(/_sub$/, '');
      await fetch(`http://127.0.0.1:1984/api/streams?name=${baseName}&src=${encodeURIComponent(mainUrl)}`, { method: 'PUT' });
      await fetch(`http://127.0.0.1:1984/api/streams?name=${baseName}_sub&src=${encodeURIComponent(subUrl)}`, { method: 'PUT' });
    } catch (e) { }
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
      }).on('error', () => { });
    } else {
      console.log(`[PTZ Agent] Dahua ${command} -> Status ${res.statusCode}`);
    }
  }).on('error', (e) => console.warn('[PTZ Agent] Dahua error:', e.message));
}

function sendDigestRequest(urlStr, user, pass, method = 'GET', bodyStr = null, callback = null) {
  const u = new URL(urlStr);
  const reqOpts = { host: u.hostname, port: u.port || 80, path: u.pathname + u.search, method };
  const req = http.request(reqOpts, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 401 && res.headers['www-authenticate']) {
        const auth = res.headers['www-authenticate'];
        const realm = (auth.match(/realm="([^"]+)"/) || [])[1] || '';
        const nonce = (auth.match(/nonce="([^"]+)"/) || [])[1] || '';
        const qop = (auth.match(/qop="([^"]+)"/) || [])[1] || '';

        const ha1 = crypto.createHash('md5').update(`${user}:${realm}:${pass}`).digest('hex');
        const ha2 = crypto.createHash('md5').update(`${method}:${u.pathname}${u.search}`).digest('hex');
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

        const req2Opts = { ...reqOpts, headers: { 'Authorization': authStr } };
        if (bodyStr) {
          req2Opts.headers['Content-Type'] = 'application/xml';
          req2Opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        const req2 = http.request(req2Opts, (r2) => {
          let data2 = '';
          r2.on('data', chunk => data2 += chunk);
          r2.on('end', () => {
             console.log(`[PTZ Agent] Digest ${method} -> Status ${r2.statusCode}`);
             if (callback) callback(r2.statusCode, data2);
          });
        }).on('error', () => { if (callback) callback(500, null); });
        if (bodyStr) req2.write(bodyStr);
        req2.end();
      } else {
        console.log(`[PTZ Agent] ${method} -> Status ${res.statusCode}`);
        if (callback) callback(res.statusCode, data);
      }
    });
  }).on('error', (e) => { 
     console.warn('[PTZ Agent] error:', e.message); 
     if (callback) callback(500, null);
  });
  if (bodyStr) req.write(bodyStr);
  req.end();
}

// Local Agent HTTP Server
const app = express();
app.use(cors());
app.use(express.json());

app.use('/clips', express.static(path.join(__dirname, 'clips')));

app.post('/api/internal/combined/start/:shareId', (req, res) => {
  const shareId = req.params.shareId;
  const config = CombinedStreamManager.active[shareId];
  if (!config) {
    return res.status(404).json({ error: 'Not found' });
  }
  CombinedStreamManager.startProcess(shareId);
  res.json({ success: true });
});

app.get('/api/cameras/recording-modes', (req, res) => {
  const active_recording = {};
  for (const id in state.recordingModes) {
    active_recording[id] = !!RecordingManager.processes[id];
  }
  res.json({ modes: state.recordingModes, active_recording });
});

app.get('/api/cameras/:id/recording-mode', (req, res) => {
  const mode = state.recordingModes[req.params.id] || 'off';
  res.json({ mode });
});

app.patch('/api/cameras/:id/recording-mode', (req, res) => {
  const mode = req.body.mode || 'off';
  state.recordingModes[req.params.id] = mode;
  saveRecordingModes();
  const cam = state.cameras.find(c => String(c.id) === String(req.params.id));
  if (cam) RecordingManager.updateMode(cam, mode);
  res.json({ success: true, mode });
});

app.post('/api/local/combined-stream', async (req, res) => {
  try {
    const { shareId, cameraIds } = req.body;
    if (!shareId || !cameraIds || cameraIds.length < 2) {
      return res.status(400).json({ error: 'shareId and at least 2 cameraIds required' });
    }

    // Fetch camera details from local state (already synced from backend)
    let cams = cameraIds.map(id => state.cameras.find(c => String(c.id) === String(id))).filter(Boolean);

    // If cameras not yet in state, fetch from backend directly
    if (cams.length < cameraIds.length) {
      try {
        const r = await fetch(`${API_BASE}/api/internal/cameras`, { headers });
        const d = await r.json();
        if (d.success) {
          state.cameras = d.cameras;
          cams = cameraIds.map(id => state.cameras.find(c => String(c.id) === String(id))).filter(Boolean);
        }
      } catch (e) {}
    }

    if (cams.length < 2) {
      return res.status(400).json({ error: 'Not enough valid cameras found in state' });
    }

    await CombinedStreamManager.sync(shareId, cams);

    // Verify go2rtc accepted it
    const check = await fetch(`http://127.0.0.1:1984/api/streams`).then(r => r.json()).catch(() => ({}));
    const registered = check && check[`combined_${shareId}`] !== undefined;

    res.json({
      success: true,
      shareId,
      streamName: `combined_${shareId}`,
      registeredInGo2rtc: registered,
      go2rtcDashboard: 'http://127.0.0.1:1984',
      note: registered
        ? 'Stream is live in go2rtc. Check dashboard to confirm before testing in VLC.'
        : 'Registered but could not verify — check go2rtc dashboard at http://127.0.0.1:1984'
    });
  } catch (err) {
    console.error('[CombinedStream] API error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/local/combined-stream/:shareId', async (req, res) => {
  await CombinedStreamManager.remove(req.params.shareId);
  res.json({ success: true });
});

app.get('/api/local/combined-stream/verify/:shareId', async (req, res) => {
  try {
    const streams = await fetch('http://127.0.0.1:1984/api/streams').then(r => r.json()).catch(() => ({}));
    const name = `combined_${req.params.shareId}`;
    const info = streams[name];
    res.json({
      shareId: req.params.shareId,
      streamName: name,
      exists: !!info,
      go2rtcEntry: info || null,
      dashboard: 'http://127.0.0.1:1984'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/local/ptz', async (req, res) => {
  try {
    const { brand, host, user, pass, command, speed = 0.5 } = req.body;
    console.log(`[PTZ Agent] Received ${command} for ${brand} @ ${host}`);

    if (command === 'SET_FLIP_MIRROR') {
      const { flip, mirror } = req.body;
      if (brand === 'Dahua' || host === '192.168.50.101' || host === '192.168.18.150') {
        const url1 = `http://${host}/cgi-bin/configManager.cgi?action=setConfig&VideoInOptions[0].Flip=${!!flip}&VideoInOptions[0].Mirror=${!!mirror}`;
        sendDigestRequest(url1, user, pass, 'GET');
      } else {
        const isapiUrl = `http://${host}/ISAPI/Image/channels/1/Flip`;
        const flipStyle = flip && mirror ? 'CENTER' : (mirror ? 'LEFT_RIGHT' : (flip ? 'UP_DOWN' : 'NORMAL'));
        const xml = `<Flip><flipStyle>${flipStyle}</flipStyle></Flip>`;
        sendDigestRequest(isapiUrl, user, pass, 'PUT', xml);
      }
      return res.json({ success: true, method: 'HardwareFlipMirror' });
    }

    const onvifDev = await getCachedOnvif(host, user, pass);
    if (onvifDev && onvifDev.services && onvifDev.services.ptz) {
      if (command === 'STOP') {
        await onvifDev.ptzStop().catch(() => { });
      } else {
        const speedVal = speed || 0.5;
        const speedVec = { x: 0, y: 0, z: 0 };
        if (command === 'UP') speedVec.y = speedVal;
        if (command === 'DOWN') speedVec.y = -speedVal;
        if (command === 'LEFT') speedVec.x = -speedVal;
        if (command === 'RIGHT') speedVec.x = speedVal;
        if (command === 'ZOOM_IN') speedVec.z = speedVal;
        if (command === 'ZOOM_OUT') speedVec.z = -speedVal;

        await onvifDev.ptzMove({ speed: speedVec, timeout: 1 }).catch(() => { });
      }
      return res.json({ success: true, method: 'ONVIF' });
    }

    if (brand === 'Dahua' || host === '192.168.50.101' || host === '192.168.18.150') {
      const dahuaSpeed = Math.round((speed || 0.5) * 8);
      sendDahuaDigestPtz(host, user, pass, command, dahuaSpeed);
      return res.json({ success: true, method: 'Dahua-Digest-CGI' });
    }

    res.json({ success: true, method: 'dispatched' });
  } catch (err) {
    console.error('[PTZ Agent] Processing error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4002, () => {
  console.log('[PTZ Agent] Hardware PTZ and Recording listener active on port 4002');
});

// Periodic background sync for orphaned clips (e.g. agent restart, unexpected stop)
setInterval(() => {
  RecordingManager.syncClipsToDb().catch(e => console.error('[RecordingManager] periodic sync error:', e));
}, 60000);

async function checkRtspOnline(url) {
  return new Promise((resolve) => {
    try {
      const match = url.match(/@([^:]+)(?::(\d+))?/);
      if (!match) return resolve(false);
      const host = match[1];
      const port = match[2] ? parseInt(match[2], 10) : 554;
      const socket = new net.Socket();
      let resolved = false;

      const finish = (result) => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(result);
        }
      };

      socket.setTimeout(2500);
      socket.on('connect', () => {
        socket.write(`OPTIONS rtsp://${host}:${port}/ RTSP/1.0\r\nCSeq: 1\r\n\r\n`);
      });
      socket.on('data', (data) => {
        if (data.toString().includes('RTSP/1.0')) {
          finish(true);
        } else {
          finish(false);
        }
      });
      socket.on('timeout', () => finish(false));
      socket.on('error', () => finish(false));
      socket.connect(port, host);
    } catch (e) {
      resolve(false);
    }
  });
}

async function runWatchdog() {
  for (const cam of state.cameras) {
    let isOnline = false;

    if (!cam.rtsp_url.startsWith('onvif://')) {
      isOnline = await checkRtspOnline(cam.rtsp_url);
    } else {
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
          isOnline = true;
        }
      } catch (err) {
        isOnline = false;
      }
    }

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/api/admin/cameras/${cam.id}/status`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ last_seen: new Date().toISOString() })
        });
      } catch (e) {
        console.warn(`[Agent] Failed to update status for ${cam.name}:`, e.message);
      }
      state.failedPings[cam.id] = 0;
    } else {
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
          try {
            await fetch(`${API_BASE}/api/camera/${patrol.camera_id}/presets`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ presetToken: currentPreset.token, action: 'goto' })
            });
          } catch (e) {
            console.warn(`[Agent] Patrol fetch failed for camera ${patrol.camera_id}:`, e.message);
          }
          console.log(`[Agent] Patrol for cam ${patrol.camera_id}: Moved to preset ${currentPreset.token}`);

          pState.currentIndex++;
          pState.nextMoveTime = now.getTime() + (currentPreset.dwell || 10) * 1000;
        } catch (e) {
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
      } catch (e) {
        console.error(`[Agent] Failed to set day/night mode on ${cam.name}:`, e.message);
      }
    }
  }
}

// ─── Access Control Background Job ──────────────────────────────────────────
// Polls backend for revoked/daily-limited combined shares and removes their
// go2rtc streams so they stop resolving. Also re-adds streams for a new day.
async function runCombinedStreamAccessControl() {
  try {
    const r = await fetch(`${API_BASE}/api/internal/combined-shares`, { headers });
    const data = await r.json();
    if (!data.success) return;

    const activeShouldServe = new Set();
    const today = new Date().toISOString().split('T')[0];

    for (const share of (data.shares || [])) {
      // Already revoked in DB
      if (share.is_revoked) {
        await CombinedStreamManager.remove(share.token);
        continue;
      }

      // Check daily usage limit
      if (share.daily_limit_minutes && share.daily_limit_minutes > 0) {
        try {
          const ur = await fetch(`${API_BASE}/api/internal/usage`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ token: share.token, secondsToAdd: 0 })
          });
          const ud = await ur.json();
          if (!ud.valid) {
            await CombinedStreamManager.remove(share.token);
            continue;
          }
        } catch (e) {}
      }

      // Share is valid — ensure stream is registered and running
      activeShouldServe.add(share.token);
      let cameraIds = [];
      try { cameraIds = JSON.parse(share.allowed_cameras); } catch (e) {}
      const cams = cameraIds.map(id => state.cameras.find(c => String(c.id) === String(id))).filter(Boolean);
      if (cams.length >= 2) await CombinedStreamManager.sync(share.token, cams);
    }
    
    // Cleanup any memory shares that are no longer active
    for (const id of Object.keys(CombinedStreamManager.active)) {
      if (!activeShouldServe.has(id)) {
        await CombinedStreamManager.remove(id);
      }
    }
  } catch (e) {
    console.warn('[CombinedStream] Access control check failed:', e.message);
  }
}

const RETENTION_DAYS = 7;
const MAX_DISK_GB = 50;
const MAX_DISK_BYTES = MAX_DISK_GB * 1024 * 1024 * 1024;

async function runDiskCleanup() {
  const clipsDir = path.join(__dirname, 'clips');
  if (!fs.existsSync(clipsDir)) return;

  let camDirs = [];
  try {
    camDirs = fs.readdirSync(clipsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch (e) {
    return;
  }

  const deletedFiles = [];
  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  let protectedTokens = [];
  try {
    const res = await fetch(API_BASE + '/api/internal/recordings/protected').then(r => r.json());
    if (res.success && res.tokens) {
      protectedTokens = res.tokens;
    }
  } catch (e) {
    console.warn('[DiskCleanup] Failed to fetch protected tokens:', e.message);
  }

  for (const camId of camDirs) {
    const camPath = path.join(clipsDir, camId);
    let files = [];
    try {
      files = fs.readdirSync(camPath).filter(f => f.endsWith('.mp4'));
    } catch(e) { continue; }
    
    const fileStats = files.map(file => {
      const filePath = path.join(camPath, file);
      try {
        const stat = fs.statSync(filePath);
        return { path: filePath, file, size: stat.size, mtime: stat.mtimeMs };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    fileStats.sort((a, b) => a.mtime - b.mtime);

    let totalSize = fileStats.reduce((acc, f) => acc + f.size, 0);

    for (const file of fileStats) {
      // Skip files modified in the last 5 minutes (likely actively being written by FFmpeg)
      if (now - file.mtime < 300000) {
        continue;
      }

      // Check access_tokens protection
      let isProtected = false;
      let protectingToken = null;
      const match = file.file.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.mp4$/);
      if (match) {
        const [_, y, m, d, H, M, S] = match;
        const fileDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(H), parseInt(M), parseInt(S));
        const fileStartMs = fileDate.getTime();
        const fileEndMs = fileStartMs + 180000; // 3 minutes duration assumption

        for (const pt of protectedTokens) {
          const allowedCams = JSON.parse(pt.allowed_cameras || '[]');
          if (allowedCams.includes(camId) || allowedCams.includes(Number(camId))) {
            const protStartMs = new Date(pt.recording_access_start).getTime();
            const protEndMs = new Date(pt.recording_access_end).getTime();
            if (fileStartMs <= protEndMs && fileEndMs >= protStartMs) {
              isProtected = true;
              protectingToken = pt;
              break;
            }
          }
        }
      }

      if (isProtected) {
        console.warn(`[DiskCleanup] Skipped deletion of ${file.file}. Protected by token ${protectingToken.token} (valid until ${protectingToken.recording_access_end})`);
        continue;
      }

      let deleteReason = null;
      if (now - file.mtime > retentionMs) {
        deleteReason = 'retention';
      } else if (totalSize > MAX_DISK_BYTES) {
        deleteReason = 'size';
      }

      if (deleteReason) {
        try {
          fs.unlinkSync(file.path);
          console.log(`[DiskCleanup] Deleted ${file.file} due to ${deleteReason} limit.`);
          deletedFiles.push(file.path);
          totalSize -= file.size;
        } catch (e) {
          console.error(`[DiskCleanup] Failed to delete ${file.file}:`, e.message);
        }
      }
    }

    if (totalSize > MAX_DISK_BYTES) {
      console.warn(`[DiskCleanup] ALERT: Camera ${camId} exceeds MAX_DISK limit (${totalSize} > ${MAX_DISK_BYTES}) but remaining files are protected by active tokens.`);
    }
  }

  if (deletedFiles.length > 0) {
    try {
      await fetch(API_BASE + '/api/internal/recordings/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedFiles })
      });
    } catch (e) {
      console.warn('[DiskCleanup] Failed to sync deletions with backend:', e.message);
    }
  }
}

// Main Loop
async function agentLoop() {
  ensureGo2rtc();
  await fetchState();
  await RecordingManager.syncClipsToDb();
  await syncGo2rtc();
  await runWatchdog();
  await runDiskCleanup();
  await runDayNight();

  if (!state.recordingManagerReady && state.cameras.length > 0) {
    state.recordingManagerReady = true;
    for (const cam of state.cameras) {
      const mode = state.recordingModes[cam.id];
      if (mode && mode !== 'off') RecordingManager.updateMode(cam, mode);
    }
  }
}

console.log('[Agent] Starting authoritative camera agent...');
ensureGo2rtc();
setInterval(agentLoop, 10000);
agentLoop();

// Background tasks
setInterval(() => {
  RecordingManager.syncClipsToDb();
}, 300000);

setInterval(async () => {
  try {
    await fetch(API_BASE + '/api/internal/heartbeat', {
      method: 'POST',
      headers
    });
  } catch(e) {}
}, 60000);

setInterval(runPatrols, 2000);
// Access control check every 60 seconds
runCombinedStreamAccessControl();
setInterval(runCombinedStreamAccessControl, 60000);

// ================== DVR ENDPOINTS (MIGRATED) ==================

const CLIPS_DIR = path.join(__dirname, 'clips');

// Helper: map camera name to ID by calling backend (or just checking clips directory)
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
          url: `/clips/${camId}/${file}`
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
          downloadUrl = `/clips/${camId}/${file}`;
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

// ==============================================================
