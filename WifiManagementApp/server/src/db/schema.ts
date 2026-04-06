import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DB_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'homenet');
export const DB_PATH = path.join(DB_DIR, 'homenet.db');

const DDL = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bandwidth_samples (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,
  rx_bps   REAL    NOT NULL,
  tx_bps   REAL    NOT NULL,
  rx_bytes INTEGER,
  tx_bytes INTEGER
);
CREATE INDEX IF NOT EXISTS idx_bw_ts ON bandwidth_samples(ts);

CREATE TABLE IF NOT EXISTS device_snapshots (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              INTEGER NOT NULL,
  mac             TEXT    NOT NULL,
  name            TEXT,
  ip              TEXT,
  band            TEXT,
  online          INTEGER NOT NULL DEFAULT 0,
  connection_type TEXT
);
CREATE INDEX IF NOT EXISTS idx_dev_ts     ON device_snapshots(ts);
CREATE INDEX IF NOT EXISTS idx_dev_mac_ts ON device_snapshots(mac, ts);

CREATE TABLE IF NOT EXISTS poll_log (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  error   TEXT
);
CREATE INDEX IF NOT EXISTS idx_poll_ts ON poll_log(ts);
`;

export function openDb(options: { readonly?: boolean } = {}): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH, {
    readonly: options.readonly ?? false,
    fileMustExist: options.readonly ?? false,
  });

  if (!options.readonly) {
    db.exec(DDL);
    // Seed schema version on first open
    const version = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as
      | { version: number }
      | undefined;
    if (!version) {
      db.prepare('INSERT INTO schema_version VALUES (1)').run();
    }
  } else {
    // Still set connection-level PRAGMAs for readers
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
  }

  return db;
}
