const db = require('better-sqlite3')('.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite');
const result = db.prepare("DELETE FROM cameras WHERE name = 'test_cam'").run();
console.log('Deleted test_cam:', result);
