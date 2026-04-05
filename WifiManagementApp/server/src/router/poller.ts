import { getPage } from './client';
import { parseDevices, DeviceEntry } from './parsers/devices';
import { parseBroadband, BroadbandStats } from './parsers/broadband';
import { parseSysinfo, SysInfo } from './parsers/sysinfo';
import { parseFiberstat, FiberStat } from './parsers/fiberstat';
import { parseIpalloc, IpAllocEntry } from './parsers/ipalloc';
import { parseLanstats, LanPortStat } from './parsers/lanstats';

export interface BandwidthSample {
  time: number; // Unix ms timestamp
  rxBps: number;
  txBps: number;
}

export interface MergedDevice {
  id: string;
  name: string | null;
  mac: string;
  ip: string | null;
  band: string | null;
  online: boolean;
  connectionType: string | null;
  // Placeholders — router HTML doesn't provide real-time per-device bandwidth
  download: null;
  upload: null;
  dataToday: null;
  connectedTime: null;
  signal: null;
}

interface CacheEntry<T> {
  data: T;
  stale: boolean;
  lastUpdated: number | null;
}

// ---------------------------------------------------------------------------
// Cache state
// ---------------------------------------------------------------------------

let devices: CacheEntry<MergedDevice[]> = {
  data: [],
  stale: false,
  lastUpdated: null,
};

let broadband: CacheEntry<BroadbandStats> = {
  data: {
    lineState: null,
    lineSpeed: null,
    rxBytes: null,
    txBytes: null,
    rxPackets: null,
    txPackets: null,
    rxErrors: null,
    txErrors: null,
    ipv4: null,
    ipv6: null,
    dns: null,
  },
  stale: false,
  lastUpdated: null,
};

let sysinfo: CacheEntry<SysInfo> = {
  data: {
    manufacturer: null,
    model: null,
    firmware: null,
    serial: null,
    uptime: null,
    uptimeSeconds: null,
  },
  stale: false,
  lastUpdated: null,
};

let fiberstat: CacheEntry<FiberStat> = {
  data: {
    temperature: null,
    voltage: null,
    txBias: null,
    txPower: null,
    rxPower: null,
  },
  stale: false,
  lastUpdated: null,
};

let lanstats: CacheEntry<LanPortStat[]> = {
  data: [],
  stale: false,
  lastUpdated: null,
};

// Ring buffer — last 60 bandwidth samples
const BANDWIDTH_HISTORY_SIZE = 60;
const bandwidthHistory: BandwidthSample[] = [];

let isOnline = false;
let lastPollTime: number | null = null;
let prevRxBytes: number | null = null;
let prevTxBytes: number | null = null;
let prevPollTime: number | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeMac(mac: string): string {
  return mac.toUpperCase().replace(/-/g, ':');
}

function mergeDevices(
  deviceEntries: DeviceEntry[],
  ipAllocEntries: IpAllocEntry[]
): MergedDevice[] {
  // Build a map from MAC -> ipalloc entry for name/ip enrichment
  const ipAllocMap = new Map<string, IpAllocEntry>();
  for (const entry of ipAllocEntries) {
    if (entry.mac) {
      ipAllocMap.set(normalizeMac(entry.mac), entry);
    }
  }

  const seen = new Set<string>();
  const merged: MergedDevice[] = [];

  for (const d of deviceEntries) {
    if (!d.mac) continue;
    const normalMac = normalizeMac(d.mac);
    if (seen.has(normalMac)) continue;
    seen.add(normalMac);

    const ipEntry = ipAllocMap.get(normalMac);

    merged.push({
      id: normalMac,
      name: d.name ?? ipEntry?.name ?? null,
      mac: normalMac,
      ip: d.ipv4 ?? ipEntry?.ip ?? null,
      band: d.band,
      online: d.online,
      connectionType: d.connectionType,
      download: null,
      upload: null,
      dataToday: null,
      connectedTime: null,
      signal: null,
    });
  }

  return merged;
}

function pushBandwidthSample(rxBytes: number | null, txBytes: number | null, now: number): void {
  if (
    rxBytes === null ||
    txBytes === null ||
    prevRxBytes === null ||
    prevTxBytes === null ||
    prevPollTime === null
  ) {
    prevRxBytes = rxBytes;
    prevTxBytes = txBytes;
    prevPollTime = now;
    return;
  }

  const deltaSec = (now - prevPollTime) / 1000;
  if (deltaSec <= 0) return;

  const rxDelta = rxBytes - prevRxBytes;
  const txDelta = txBytes - prevTxBytes;

  // Guard against counter resets (router reboot)
  const rxBps = rxDelta >= 0 ? rxDelta / deltaSec : 0;
  const txBps = txDelta >= 0 ? txDelta / deltaSec : 0;

  bandwidthHistory.push({ time: now, rxBps, txBps });
  if (bandwidthHistory.length > BANDWIDTH_HISTORY_SIZE) {
    bandwidthHistory.shift();
  }

  prevRxBytes = rxBytes;
  prevTxBytes = txBytes;
  prevPollTime = now;
}

// ---------------------------------------------------------------------------
// Poll
// ---------------------------------------------------------------------------

async function pollOnce(): Promise<void> {
  const now = Date.now();

  try {
    // Fetch all pages concurrently
    const [devHtml, bbHtml, syHtml, fibHtml, ipHtml, lanHtml] = await Promise.allSettled([
      getPage('devices.ha'),
      getPage('broadbandstatistics.ha'),
      getPage('sysinfo.ha'),
      getPage('fiberstat.ha'),
      getPage('ipalloc.ha'),
      getPage('lanstatistics.ha'),
    ]);

    isOnline = true;
    lastPollTime = now;

    // Devices
    const deviceEntries =
      devHtml.status === 'fulfilled' ? parseDevices(devHtml.value) : devices.data.map((d) => ({
        name: d.name,
        ipv4: d.ip,
        ipv6: null,
        mac: d.mac,
        connectionType: d.connectionType,
        band: d.band,
        online: false,
      }));

    const ipAllocEntries: IpAllocEntry[] =
      ipHtml.status === 'fulfilled' ? parseIpalloc(ipHtml.value) : [];

    devices = {
      data: mergeDevices(deviceEntries, ipAllocEntries),
      stale: devHtml.status !== 'fulfilled',
      lastUpdated: now,
    };

    // Broadband
    if (bbHtml.status === 'fulfilled') {
      const bbData = parseBroadband(bbHtml.value);
      pushBandwidthSample(bbData.rxBytes, bbData.txBytes, now);
      broadband = { data: bbData, stale: false, lastUpdated: now };
    } else {
      broadband.stale = true;
    }

    // Sysinfo
    if (syHtml.status === 'fulfilled') {
      sysinfo = { data: parseSysinfo(syHtml.value), stale: false, lastUpdated: now };
    } else {
      sysinfo.stale = true;
    }

    // Fiberstat
    if (fibHtml.status === 'fulfilled') {
      fiberstat = { data: parseFiberstat(fibHtml.value), stale: false, lastUpdated: now };
    } else {
      fiberstat.stale = true;
    }

    // LAN stats
    if (lanHtml.status === 'fulfilled') {
      lanstats = { data: parseLanstats(lanHtml.value), stale: false, lastUpdated: now };
    } else {
      lanstats.stale = true;
    }
  } catch {
    isOnline = false;
    lastPollTime = now;
    // Mark everything as stale
    devices.stale = true;
    broadband.stale = true;
    sysinfo.stale = true;
    fiberstat.stale = true;
    lanstats.stale = true;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getCache() {
  return {
    isOnline,
    lastPollTime,
    devices,
    broadband,
    sysinfo,
    fiberstat,
    lanstats,
    bandwidthHistory: [...bandwidthHistory],
  };
}

export function startPoller(intervalMs: number = 5000): void {
  console.log(`[poller] Starting poll interval every ${intervalMs}ms`);

  // Run immediately, then on interval
  pollOnce().catch((err) => {
    console.error('[poller] Initial poll error:', err);
  });

  setInterval(() => {
    pollOnce().catch((err) => {
      console.error('[poller] Poll error:', err);
    });
  }, intervalMs);
}
