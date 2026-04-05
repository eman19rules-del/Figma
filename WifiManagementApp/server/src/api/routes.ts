import { Router, Request, Response } from 'express';
import { getCache } from '../router/poller';
import { login, performAction } from '../router/auth';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/status
// ---------------------------------------------------------------------------
router.get('/status', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    online: cache.isOnline,
    lastPollTime: cache.lastPollTime,
    lastPollIso: cache.lastPollTime ? new Date(cache.lastPollTime).toISOString() : null,
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
// GET /api/bandwidth-history
// ---------------------------------------------------------------------------
router.get('/bandwidth-history', (_req: Request, res: Response) => {
  const cache = getCache();
  res.json({
    history: cache.bandwidthHistory,
    count: cache.bandwidthHistory.length,
  });
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
