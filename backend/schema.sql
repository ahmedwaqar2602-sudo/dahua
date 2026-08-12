DROP TABLE IF EXISTS access_logs;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    onvif_port INTEGER DEFAULT 80,
    username TEXT,
    password TEXT,
    stream_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS share_links (
    token TEXT PRIMARY KEY,
    camera_id INTEGER NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    share_link_token TEXT,
    camera_id INTEGER NOT NULL,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    status TEXT NOT NULL,
    recording_path TEXT,
    FOREIGN KEY(share_link_token) REFERENCES share_links(token) ON DELETE SET NULL,
    FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);
