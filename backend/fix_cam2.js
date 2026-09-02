const db = require('better-sqlite3')('C:\\Dahua\\backend\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b71c385e7e43108957b25ea44c5a4065e3fa84d7a5326d1dc80f6c326587a4cf.sqlite'); 
db.prepare(`UPDATE cameras SET rtsp_url = 'rtsp://admin:***@192.168.50.102:554/Streaming/Channels/101', sub_stream_url = 'rtsp://admin:***@192.168.50.102:554/Streaming/Channels/102' WHERE id = 2`).run();
console.log('Fixed cam 2');
