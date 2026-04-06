import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { getCache } from '../router/poller';
import { login, performAction } from '../router/auth';
import {
  getBandwidthHistory,
  getDeviceHistory,
  getRecentPollLog,
  downsample,
  TimeRange,
} from '../db/queries';

const router = Router();
let db: Database.Database | null = null;

export function setDb(instance: Database.Database | null): void {
  db = instance;
}

const VALID_RANGES: TimeRange[] = ['1h', '6h', '24h', '7d'];
const MAX_CHART_POINTS = 300;

// ---------------------------------------------------------------------------
// GET /api/status
// ---------------------------------------------------------------------------
router.get('/status', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    online: cache.isOnline,
    lastPollTime: cache.lastPollTime,
    lastPollIso: cache.lastPollTime ? new Date(cache.lastPollTime).toISOString() : null,
    daemonConnected: db !== null,
  });
});

// ---------------------------------------------------------------------------
// GET /api/devices
// ---------------------------------------------------------------------------
router.get('/devices', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    stale: cache.devices.stale,
    lastUpdated: cache.devices.lastUpdated,
    devices: cache.devices.data,
  });
});

// ---------------------------------------------------------------------------
// GET /api/broadband
// ---------------------------------------------------------------------------
router.get('/broadband', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    stale: cache.broadband.stale,
    lastUpdated: cache.broadband.lastUpdated,
    ...cache.broadband.data,
  });
});

// ---------------------------------------------------------------------------
// GET /api/sysinfo
// ---------------------------------------------------------------------------
router.get('/sysinfo', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    stale: cache.sysinfo.stale,
    lastUpdated: cache.sysinfo.lastUpdated,
    ...cache.sysinfo.data,
  });
});

// ---------------------------------------------------------------------------
// GET /api/fiberstat
// ---------------------------------------------------------------------------
router.get('/fiberstat', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    stale: cache.fiberstat.stale,
    lastUpdated: cache.fiberstat.lastUpdated,
    ...cache.fiberstat.data,
  });
});

// ---------------------------------------------------------------------------
// GET /api/lanstats
// ---------------------------------------------------------------------------
router.get('/lanstats', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    stale: cache.lanstats.stale,
    lastUpdated: cache.lanstats.lastUpdated,
    ports: cache.lanstats.data,
  });
});

// ---------------------------------------------------------------------------
// GET /api/bandwidth-history?range=1h|6h|24h|7d
// Serves from SQLite if daemon is running, falls back to in-memory ring buffer
// ---------------------------------------------------------------------------
router.get('/bandwidth-history', (req: Request, res: Response) => {
  const range = (req.query.range as string) ?? '1h';

  if (!VALID_RANGES.includes(range as TimeRange)) {
    res.status(400).json({ error: `range must be one of: ${VALID_RANGES.join(', ')}` });
    return;
  }

  // Prefer SQLite (daemon data)
  if (db) {
    try {
      const rows = getBandwidthHistory(db, range as TimeRange);
      const sampled = downsample(rows, MAX_CHART_POINTS);
      const history = sampled.map((r) => ({
        time: r.ts * 1000, // convert to ms for frontend consistency
        rxBps: r.rx_bps,
        txBps: r.tx_bps,
      }));
      res.json({ history, count: history.length, range, source: 'db' });
      return;
    } catch (err) {
      console.error('[routes] SQLite read error, falling back to memory:', err);
    }
  }

  // Fall back to in-memory ring buffer
  const cache = getCache();
  res.json({
    history: cache.bandwidthHistory,
    count: cache.bandwidthHistory.length,
    range,
    source: 'memory',
  });
});

// ---------------------------------------------------------------------------
// GET /api/devices/history?mac=AA:BB:CC&range=24h
// ---------------------------------------------------------------------------
router.get('/devices/history', (req: Request, res: Response) => {
  const mac = req.query.mac as string;
  const range = (req.query.range as string) ?? '24h';

  if (!mac) {
    res.status(400).json({ error: 'mac is required' });
    return;
  }
  if (!VALID_RANGES.includes(range as TimeRange)) {
    res.status(400).json({ error: `range must be one of: ${VALID_RANGES.join(', ')}` });
    return;
  }
  if (!db) {
    res.status(503).json({ error: 'daemon not running — no historical data' });
    return;
  }

  const snapshots = getDeviceHistory(db, mac, range as TimeRange);
  res.json({ mac, range, snapshots });
});

// ---------------------------------------------------------------------------
// GET /api/poll-log?limit=20
// ---------------------------------------------------------------------------
router.get('/poll-log', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) ?? '20', 10);
  if (!db) {
    res.status(503).json({ error: 'daemon not running — no poll log' });
    return;
  }
  res.json({ entries: getRecentPollLog(db, limit) });
});

// ---------------------------------------------------------------------------
// POST /api/auth
// ---------------------------------------------------------------------------
router.post('/auth', async (req: Request, res: Response) => {
  const { deviceAccessCode } = req.body as { deviceAccessCode?: string };

  if (!deviceAccessCode || typeof deviceAccessCode !== 'string') {
    res.status(400).json({ success: false, message: 'deviceAccessCode is required' });
    return;
  }

  const result = await login(deviceAccessCode);
  res.status(result.success ? 200 : 401).json(result);
});

// ---------------------------------------------------------------------------
// POST /api/action
// ---------------------------------------------------------------------------
router.post('/action', async (req: Request, res: Response) => {
  const { action } = req.body as { action?: string };

  if (!action || typeof action !== 'string') {
    res.status(400).json({ success: false, message: 'action is required' });
    return;
  }

  const validActions = [
    'restart-gateway',
    'reset-connection',
    'reset-wifi',
    'reset-firewall',
    'reset-device',
    'reset-ip',
  ];

  if (!validActions.includes(action)) {
    res.status(400).json({
      success: false,
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
    });
    return;
  }

  const result = await performAction(action);
  res.status(result.success ? 200 : 403).json(result);
});

export default router;
