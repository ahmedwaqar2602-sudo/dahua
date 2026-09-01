const net = require('net');

const PROXY_PORT = 8554;
const GO2RTC_PORT = 8556;
const BACKEND_URL = 'http://127.0.0.1:8787/api/internal/usage';
const SESSION_EVENT_URL = 'http://127.0.0.1:8787/api/internal/session-event';


// Maps socket to its tracking interval
const activeConnections = new Map();

const server = net.createServer((clientSocket) => {
  let go2rtcSocket = null;
  let isConnected = false;
  let token = null;
  let initialBuffer = Buffer.alloc(0);
  let hasParsedInitial = false;

  clientSocket.on('data', async (chunk) => {
    if (!hasParsedInitial) {
      initialBuffer = Buffer.concat([initialBuffer, chunk]);
      
      // Parse the first few bytes to find the RTSP URL
      const dataStr = initialBuffer.toString('utf8');
      if (dataStr.includes('\r\n\r\n')) {
        hasParsedInitial = true;
        
        // Extract token from RTSP URL (e.g. rtsp://.../?token=xyz or rtsp://.../combined_xyz)
        const match = dataStr.match(/token=([a-zA-Z0-9-]+)/);
        const combinedMatch = dataStr.match(/combined_([a-zA-Z0-9-]+)/);
        
        if (match) {
          token = match[1];
        } else if (combinedMatch) {
          token = combinedMatch[1];
        }

        // Extract camera_id (stream name) from the RTSP URL path
        let camera_id = null;
        const urlMatch = dataStr.match(/rtsp:\/\/[^\/]+\/([^\?\s]+)/);
        if (urlMatch) {
          camera_id = urlMatch[1];
        }

        if (token) {
          // Check initial validity
          try {
            const res = await fetch(BACKEND_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, secondsToAdd: 0 })
            });
            const result = await res.json();

            if (!result.valid) {
              console.log(`[RTSP Proxy] Connection rejected for token ${token}`);
              clientSocket.write('RTSP/1.0 401 Unauthorized\r\n\r\n');
              clientSocket.destroy();
              return;
            }

            // Connection is valid, log ENTER event
            const startTime = Date.now();
            fetch(SESSION_EVENT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, camera_id, action: 'ENTER' })
            }).catch(err => console.error('[RTSP Proxy] Error logging ENTER', err));

            // Attach session info to socket for cleanup
            clientSocket.sessionInfo = { token, camera_id, startTime };

            // Start tracking usage (e.g. every 10s)
            const intervalId = setInterval(async () => {
              try {
                const updateRes = await fetch(BACKEND_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token, secondsToAdd: 10 })
                });
                const updateResult = await updateRes.json();
                
                if (!updateResult.valid) {
                  console.log(`[RTSP Proxy] Daily limit reached for token ${token}, dropping connection.`);
                  clearInterval(intervalId);
                  if (go2rtcSocket) go2rtcSocket.destroy();
                  clientSocket.destroy();
                }
              } catch (err) {
                console.error('[RTSP Proxy] Error tracking usage', err);
              }
            }, 10000);

            activeConnections.set(clientSocket, intervalId);

          } catch (err) {
            console.error('[RTSP Proxy] Validation error', err);
            clientSocket.destroy();
            return;
          }
        }

        // Connect to go2rtc
        go2rtcSocket = net.connect(GO2RTC_PORT, '127.0.0.1', () => {
          isConnected = true;
          go2rtcSocket.write(initialBuffer);
        });

        go2rtcSocket.on('data', (proxyChunk) => {
          clientSocket.write(proxyChunk);
        });

        go2rtcSocket.on('end', () => clientSocket.end());
        go2rtcSocket.on('error', () => clientSocket.destroy());
      }
    } else if (isConnected && go2rtcSocket) {
      go2rtcSocket.write(chunk);
    }
  });

  const cleanup = () => {
    if (activeConnections.has(clientSocket)) {
      clearInterval(activeConnections.get(clientSocket));
      activeConnections.delete(clientSocket);
      
      // Log EXIT event if session was authenticated
      if (clientSocket.sessionInfo) {
        const { token, camera_id, startTime } = clientSocket.sessionInfo;
        const duration_seconds = Math.round((Date.now() - startTime) / 1000);
        fetch(SESSION_EVENT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, camera_id, action: 'EXIT', duration_seconds })
        }).catch(err => console.error('[RTSP Proxy] Error logging EXIT', err));
        delete clientSocket.sessionInfo;
      }
    }
    if (go2rtcSocket) go2rtcSocket.destroy();
  };

  clientSocket.on('end', cleanup);
  clientSocket.on('error', cleanup);
});

server.listen(PROXY_PORT, () => {
  console.log(`[RTSP Proxy] Listening on port ${PROXY_PORT} and forwarding to ${GO2RTC_PORT}`);
});
