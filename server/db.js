const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'agency.db');
const db = new Database(dbPath);

// Inicializar tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    agencyName TEXT,
    avatarUrl TEXT,
    google_tokens TEXT,
    plan_status TEXT,
    maintenance_active INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    email TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    totalInteractions INTEGER DEFAULT 0,
    conversionRate REAL DEFAULT 0,
    avgSessionTime REAL DEFAULT 0,
    sentimentPositive INTEGER DEFAULT 0,
    sentimentNeutral INTEGER DEFAULT 0,
    sentimentNegative INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    external_reference TEXT UNIQUE,
    preference_id TEXT,
    payment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME
  );
`);

module.exports = db;

// ─── Migrations ───────────────────────────────────────────────────────────────
// Safe: only runs if the column doesn't exist yet
try {
  db.exec('ALTER TABLE users ADD COLUMN google_tokens TEXT');
} catch {
  // Column already exists — ignore
}

try {
  db.exec('ALTER TABLE users ADD COLUMN plan_status TEXT');
} catch {
  // Column already exists — ignore
}

try {
  db.exec('ALTER TABLE users ADD COLUMN maintenance_active INTEGER DEFAULT 0');
} catch {
  // Column already exists — ignore
}

try {
  db.exec('ALTER TABLE metrics ADD COLUMN sentimentPositive INTEGER DEFAULT 0');
} catch {
  // Column already exists — ignore
}

try {
  db.exec('ALTER TABLE metrics ADD COLUMN sentimentNeutral INTEGER DEFAULT 0');
} catch {
  // Column already exists — ignore
}

try {
  db.exec('ALTER TABLE metrics ADD COLUMN sentimentNegative INTEGER DEFAULT 0');
} catch {
  // Column already exists — ignore
}
