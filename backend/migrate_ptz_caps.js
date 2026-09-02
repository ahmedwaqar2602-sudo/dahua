const db = require('better-sqlite3')('C:\\Dahua\\backend\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite'); 
db.prepare("UPDATE cameras SET capabilities = '{\"ptz\":true}' WHERE name LIKE '%dahua%'").run();
db.prepare("UPDATE cameras SET capabilities = '{\"ptz\":false}' WHERE name NOT LIKE '%dahua%'").run();
console.log('Capabilities migrated');
