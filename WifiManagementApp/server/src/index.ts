import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes, { setDb } from './api/routes';
import { startPoller } from './router/poller';
import { login } from './router/auth';
import { openDb } from './db/schema';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS
  ? parseInt(process.env.POLL_INTERVAL_MS)
  : 30000;
const DEVICE_ACCESS_CODE = process.env.DEVICE_ACCESS_CODE ?? '';

// Open SQLite in read-only mode — daemon is the sole writer
try {
  const db = openDb({ readonly: true });
  setDb(db);
  console.log('[server] SQLite DB opened (read-only)');
} catch {
  console.warn('[server] SQLite DB not found — historical data unavailable until daemon runs');
}

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT, async () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);

  if (DEVICE_ACCESS_CODE) {
    console.log('[server] DEVICE_ACCESS_CODE found — attempting auto-login...');
    const result = await login(DEVICE_ACCESS_CODE);
    if (result.success) {
      console.log('[server] Router auth successful');
    } else {
      console.warn('[server] Router auth failed:', result.message);
    }
  } else {
    console.log('[server] No DEVICE_ACCESS_CODE set — write operations disabled');
  }

  startPoller(POLL_INTERVAL_MS);
});
