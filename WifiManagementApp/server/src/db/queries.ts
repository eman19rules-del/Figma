import Database from 'better-sqlite3';

export type TimeRange = '1h' | '6h' | '24h' | '7d';

export interface BandwidthRow {
  ts: number;
  rx_bps: number;
  tx_bps: number;
  rx_bytes: number | null;
  tx_bytes: number | null;
}

export interface DeviceSnapshotRow {
  ts: number;
  mac: string;
  name: string | null;
  ip: string | null;
  band: string | null;
  online: number;
  connection_type: string | null;
}

export interface PollLogRow {
  ts: number;
  success: number;
  error: string | null;
}

const RANGE_SECONDS: Record<TimeRange, number> = {
  '1h': 3600,
  '6h': 21600,
  '24h': 86400,
  '7d': 604800,
};

// ---------------------------------------------------------------------------
// Writers (daemon only)
// ---------------------------------------------------------------------------

export function insertBandwidthSample(
  db: Database.Database,
  ts: number,
  rx_bps: number,
  tx_bps: number,
  rx_bytes: number | null,
  tx_bytes: number | null
): void {
  db.prepare(
    'INSERT INTO bandwidth_samples (ts, rx_bps, tx_bps, rx_bytes, tx_bytes) VALUES (?, ?, ?, ?, ?)'
  ).run(ts, rx_bps, tx_bps, rx_bytes, tx_bytes);
}

export interface DeviceSnapshotInput {
  mac: string;
  name: string | null;
  ip: string | null;
  band: string | null;
  online: boolean;
  connectionType: string | null;
}

export function insertDeviceSnapshots(
  db: Database.Database,
  ts: number,
  devices: DeviceSnapshotInput[]
): void {
  const stmt = db.prepare(
    'INSERT INTO device_snapshots (ts, mac, name, ip, band, online, connection_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((devs: DeviceSnapshotInput[]) => {
    for (const d of devs) {
      stmt.run(ts, d.mac, d.name, d.ip, d.band, d.online ? 1 : 0, d.connectionType);
    }
  });
  insertMany(devices);
}

export function insertPollLog(
  db: Database.Database,
  ts: number,
  success: boolean,
  error?: string
): void {
  db.prepare('INSERT INTO poll_log (ts, success, error) VALUES (?, ?, ?)').run(
    ts,
    success ? 1 : 0,
    error ?? null
  );
}

export function pruneOldRows(db: Database.Database, retentionDays = 30): void {
  const cutoff = Math.floor(Date.now() / 1000) - retentionDays * 86400;
  db.prepare('DELETE FROM bandwidth_samples WHERE ts < ?').run(cutoff);
  db.prepare('DELETE FROM device_snapshots WHERE ts < ?').run(cutoff);
  db.prepare('DELETE FROM poll_log WHERE ts < ?').run(cutoff);
}

// ---------------------------------------------------------------------------
// Readers (Express only)
// ---------------------------------------------------------------------------

export function getBandwidthHistory(
  db: Database.Database,
  range: TimeRange
): BandwidthRow[] {
  const since = Math.floor(Date.now() / 1000) - RANGE_SECONDS[range];
  return db
    .prepare(
      'SELECT ts, rx_bps, tx_bps, rx_bytes, tx_bytes FROM bandwidth_samples WHERE ts >= ? ORDER BY ts ASC'
    )
    .all(since) as BandwidthRow[];
}

export function getLatestBandwidthSample(db: Database.Database): BandwidthRow | null {
  return (
    (db
      .prepare(
        'SELECT ts, rx_bps, tx_bps, rx_bytes, tx_bytes FROM bandwidth_samples ORDER BY ts DESC LIMIT 1'
      )
      .get() as BandwidthRow | undefined) ?? null
  );
}

export function getDeviceHistory(
  db: Database.Database,
  mac: string,
  range: TimeRange
): DeviceSnapshotRow[] {
  const since = Math.floor(Date.now() / 1000) - RANGE_SECONDS[range];
  return db
    .prepare(
      'SELECT ts, mac, name, ip, band, online, connection_type FROM device_snapshots WHERE mac = ? AND ts >= ? ORDER BY ts ASC'
    )
    .all(mac, since) as DeviceSnapshotRow[];
}

export function getRecentPollLog(db: Database.Database, limit = 20): PollLogRow[] {
  return db
    .prepare('SELECT ts, success, error FROM poll_log ORDER BY ts DESC LIMIT ?')
    .all(limit) as PollLogRow[];
}

// Downsample to at most `targetPoints` by averaging buckets
export function downsample(rows: BandwidthRow[], targetPoints: number): BandwidthRow[] {
  if (rows.length <= targetPoints) return rows;
  const bucketSize = Math.ceil(rows.length / targetPoints);
  const result: BandwidthRow[] = [];
  for (let i = 0; i < rows.length; i += bucketSize) {
    const bucket = rows.slice(i, i + bucketSize);
    const avg_rx = bucket.reduce((s, r) => s + r.rx_bps, 0) / bucket.length;
    const avg_tx = bucket.reduce((s, r) => s + r.tx_bps, 0) / bucket.length;
    result.push({
      ts: bucket[Math.floor(bucket.length / 2)].ts, // median timestamp
      rx_bps: avg_rx,
      tx_bps: avg_tx,
      rx_bytes: null,
      tx_bytes: null,
    });
  }
  return result;
}
