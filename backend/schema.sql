DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS share_links;
DROP TABLE IF EXISTS cameras;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS access_tokens;
DROP TABLE IF EXISTS audit_logs;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    display_name TEXT,
    rtsp_url TEXT NOT NULL,
    sub_stream_url TEXT,
    capabilities TEXT,
    last_seen DATETIME,
    day_mode_start TEXT,
    night_mode_start TEXT
);

CREATE TABLE IF NOT EXISTS camera_patrols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER NOT NULL,
    schedule_start TEXT,
    schedule_end TEXT,
    presets_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS access_tokens (
    token TEXT PRIMARY KEY,
    user_label TEXT,
    allowed_cameras TEXT NOT NULL, -- JSON string array of camera IDs
    is_revoked BOOLEAN DEFAULT 0,
    daily_start_time TEXT,
    daily_end_time TEXT,
    disable_ptz BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    action TEXT NOT NULL, -- 'ENTER' or 'EXIT'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
