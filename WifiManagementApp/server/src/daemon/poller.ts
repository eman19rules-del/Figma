/**
 * Standalone daemon — polls the BGW320-505 router and writes to SQLite.
 * Run via launchd or `npm run daemon`. No Express, no HTTP.
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import { openDb } from '../db/schema';
import {
  insertBandwidthSample,
  insertDeviceSnapshots,
  insertPollLog,
  pruneOldRows,
} from '../db/queries';
import { login } from '../router/auth';
import { getPage } from '../router/client';
import { parseBroadband } from '../router/parsers/broadband';
import { parseDevices } from '../router/parsers/devices';

const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS
  ? parseInt(process.env.POLL_INTERVAL_MS)
  : 30_000;
const DEVICE_ACCESS_CODE = process.env.DEVICE_ACCESS_CODE ?? '';
const PRUNE_EVERY_N_POLLS = Math.ceil((7 * 24 * 3600 * 1000) / POLL_INTERVAL_MS); // ~weekly
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS ?? '30');

let db: Database.Database;
let prevRxBytes: number | null = null;
let prevTxBytes: number | null = null;
let prevTs: number | null = null;
let pollCount = 0;

async function pollOnce(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  try {
    const [bbResult, devResult] = await Promise.allSettled([
      getPage('broadbandstatistics.ha'),
      getPage('devices.ha', 35_000),
    ]);

    // ── Bandwidth sample ──────────────────────────────────────────────────
    if (bbResult.status === 'fulfilled') {
      const bb = parseBroadband(bbResult.value);
      const rxBytes = bb.rxBytes;
      const txBytes = bb.txBytes;

      if (
        rxBytes !== null &&
        txBytes !== null &&
        prevRxBytes !== null &&
        prevTxBytes !== null &&
        prevTs !== null
      ) {
        const deltaSec = now - prevTs;
        const rxDelta = rxBytes - prevRxBytes;
        const txDelta = txBytes - prevTxBytes;

        // Guard against counter reset (router reboot)
        if (deltaSec > 0 && rxDelta >= 0 && txDelta >= 0) {
          const rx_bps = rxDelta / deltaSec;
          const tx_bps = txDelta / deltaSec;
          insertBandwidthSample(db, now, rx_bps, tx_bps, rxBytes, txBytes);
        }
        // On counter reset, skip insertion (gap in chart is better than zero spike)
      }

      prevRxBytes = rxBytes;
      prevTxBytes = txBytes;
      prevTs = now;
    }

    // ── Device snapshots ──────────────────────────────────────────────────
    if (devResult.status === 'fulfilled') {
      const devices = parseDevices(devResult.value);
      if (devices.length > 0) {
        insertDeviceSnapshots(
          db,
          now,
          devices.map((d) => ({
            mac: d.mac ?? '',
            name: d.name,
            ip: d.ipv4,
            band: d.band,
            online: d.online,
            connectionType: d.connectionType,
          })).filter((d) => d.mac)
        );
      }
    }

    insertPollLog(db, now, true);
    console.log(`[daemon] Poll OK — ts=${now}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    insertPollLog(db, now, false, msg);
    console.error(`[daemon] Poll error: ${msg}`);
  }

  // Weekly prune
  pollCount++;
  if (pollCount % PRUNE_EVERY_N_POLLS === 0) {
    try {
      pruneOldRows(db, RETENTION_DAYS);
      console.log(`[daemon] Pruned rows older than ${RETENTION_DAYS} days`);
    } catch (err) {
      console.error('[daemon] Prune error:', err);
    }
  }
}

async function main(): Promise<void> {
  console.log('[daemon] Starting homenet poller daemon');

  // Open DB as sole writer
  db = openDb({ readonly: false });
  console.log('[daemon] SQLite DB opened');

  // Authenticate
  if (DEVICE_ACCESS_CODE) {
    const result = await login(DEVICE_ACCESS_CODE);
    if (result.success) {
      console.log('[daemon] Router auth successful');
    } else {
      console.warn('[daemon] Router auth failed:', result.message);
      // Continue anyway — will retry naturally on next auth attempt
    }
  } else {
    console.warn('[daemon] No DEVICE_ACCESS_CODE set — running unauthenticated');
  }

  // First poll immediately
  await pollOnce();

  // Then on interval
  const interval = setInterval(() => {
    pollOnce().catch((err) => console.error('[daemon] Uncaught poll error:', err));
  }, POLL_INTERVAL_MS);

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`[daemon] Received ${signal} — shutting down`);
    clearInterval(interval);
    try {
      db.close();
      console.log('[daemon] DB closed cleanly');
    } catch (err) {
      console.error('[daemon] Error closing DB:', err);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  console.log(`[daemon] Polling every ${POLL_INTERVAL_MS / 1000}s`);
}

main().catch((err) => {
  console.error('[daemon] Fatal error:', err);
  process.exit(1);
});
