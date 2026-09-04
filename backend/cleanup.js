const db = require('better-sqlite3')('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite');
const info = db.prepare("UPDATE recordings SET camera_id = (SELECT id FROM cameras WHERE name = recordings.camera_id) WHERE typeof(camera_id) = 'text'").run();
console.log('Updated rows:', info.changes);
