const fs = require('fs');
const path = require('path');
const onvif = require('node-onvif');

// Helper to build yaml string to avoid dependency if js-yaml not installed
function buildGo2rtcYaml(cameras) {
  let yml = 'streams:\n';
  for (const cam of cameras) {
    let mainUrl = cam.rtsp_url;
    let subUrl = cam.sub_stream_url || cam.rtsp_url;
    
    // go2rtc's native ONVIF often throws 400 Bad Request on Dahua cameras.
    // Since we know this is a Dahua ONVIF camera (if it starts with onvif://),
    // we can explicitly translate it to the standard Dahua RTSP URL for go2rtc,
    // while keeping the onvif:// protocol in the database for local-agent's PTZ.
    if (mainUrl.startsWith('onvif://')) {
      const match = mainUrl.match(/onvif:\/\/(.+):(.+)@([^:]+)/);
      if (match) {
        const [, user, pass, ip] = match;
        mainUrl = `rtsp://${user}:${pass}@${ip}:554/cam/realmonitor?channel=1&subtype=0`;
        subUrl = `rtsp://${user}:${pass}@${ip}:554/cam/realmonitor?channel=1&subtype=1`;
      }
    }
    
    yml += `  ${cam.name}: "${mainUrl}"\n`;
    yml += `  ${cam.name}_sub: "${subUrl}"\n`;
  }
  return yml;
}

const API_BASE = 'http://localhost:8787';
const headers = { 'Cookie': 'admin_token=authenticated_session', 'Content-Type': 'application/json' };

const state = {
  cameras: [],
  patrols: [],
  failedPings: {},
  patrolState: {}, // { cameraId: { currentIndex: 0, nextMoveTime: 0 } }
  lastDayNight: {} // { cameraId: 'day' | 'night' }
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

let go2rtcProcess = null;

async function syncGo2rtc() {
  const yamlPath = path.join(__dirname, 'go2rtc.yaml');
  const newYaml = buildGo2rtcYaml(state.cameras);
  let oldYaml = '';
  try { oldYaml = fs.readFileSync(yamlPath, 'utf8'); } catch (e) {}

  if (oldYaml !== newYaml) {
    fs.writeFileSync(yamlPath, newYaml, 'utf8');
    console.log('[Agent] Updated go2rtc.yaml with new camera streams');
    
    // Restart go2rtc if it's already running
    if (go2rtcProcess) {
      console.log('[Agent] Restarting go2rtc to apply new config...');
      go2rtcProcess.kill();
    }
  }
  
  // Ensure go2rtc is always running
  if (!go2rtcProcess || go2rtcProcess.killed) {
    const { spawn } = require('child_process');
    const exeExt = process.platform === 'win32' ? '.exe' : '';
    console.log('[Agent] Spawning go2rtc...');
    go2rtcProcess = spawn(path.join(__dirname, `go2rtc${exeExt}`), { stdio: 'ignore' });
    go2rtcProcess.on('exit', () => {
      console.log('[Agent] go2rtc exited, will be restarted on next loop if needed');
      go2rtcProcess = null;
    });
  }
}

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
  await fetchState();
  await syncGo2rtc();
  await runWatchdog();
  await runDayNight();
}

console.log('[Agent] Starting authoritative camera agent...');
setInterval(agentLoop, 10000);
agentLoop();
setInterval(runPatrols, 2000);
