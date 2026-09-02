const crypto = require('crypto');
const Database = require('better-sqlite3');
const path = require('path');

const keyString = 'default-dev-key-must-be-32bytes!';
const keyBuffer = Buffer.from(keyString.padEnd(32, '0').slice(0, 32));

function encryptPassword(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // We must store the auth tag with the ciphertext for WebCrypto compatibility.
  // WebCrypto AES-GCM appends the 16-byte tag to the end of the ciphertext.
  const finalEncrypted = Buffer.concat([encrypted, tag]);
  
  return `${iv.toString('hex')}:${finalEncrypted.toString('hex')}`;
}

const dbPath = 'C:\\Dahua\\backend\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite';
const db = new Database(dbPath);

const cameras = db.prepare('SELECT id, password, rtsp_url, sub_stream_url FROM cameras').all();

for (const cam of cameras) {
  if (cam.password && !cam.password.includes(':')) {
    console.log(`Encrypting camera ${cam.id}...`);
    const enc = encryptPassword(cam.password);
    let rtsp = cam.rtsp_url ? cam.rtsp_url.replace(`:${cam.password}@`, ':***@') : null;
    let sub = cam.sub_stream_url ? cam.sub_stream_url.replace(`:${cam.password}@`, ':***@') : null;
    
    db.prepare('UPDATE cameras SET password = ?, rtsp_url = ?, sub_stream_url = ? WHERE id = ?')
      .run(enc, rtsp, sub, cam.id);
  }
}

console.log('Migration complete.');
db.close();
