const db = require('better-sqlite3')('C:\\Dahua\\backend\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite'); 
console.log(db.prepare("SELECT id, password, rtsp_url FROM cameras WHERE name = 'test_cam'").get());
