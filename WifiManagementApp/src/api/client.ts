const API_BASE = 'http://localhost:3001/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface RouterDevice {
  id: string
  name: string | null
  mac: string
  ip: string | null
  band: string | null
  online: boolean
  connectionType: string | null
  download: null
  upload: null
  dataToday: null
  connectedTime: null
  signal: null
}

export interface BroadbandData {
  stale: boolean
  lastUpdated: number | null
  lineState: string | null
  lineSpeed: string | null
  rxBytes: number | null
  txBytes: number | null
  rxPackets: number | null
  txPackets: number | null
  rxErrors: number | null
  txErrors: number | null
  ipv4: string | null
  ipv6: string | null
  dns: string | null
}

export interface SysInfo {
  stale: boolean
  lastUpdated: number | null
  manufacturer: string | null
  model: string | null
  firmware: string | null
  serial: string | null
  uptime: string | null
  uptimeSeconds: number | null
}

export interface BandwidthSample {
  time: number
  rxBps: number
  txBps: number
}

export interface DevicesResponse {
  stale: boolean
  lastUpdated: number | null
  devices: RouterDevice[]
}

export type TimeRange = '1h' | '6h' | '24h' | '7d'

export interface BandwidthHistoryResponse {
  history: BandwidthSample[]
  count: number
  range: string
  source: 'db' | 'memory'
}

export const api = {
  devices: () => get<DevicesResponse>('/devices'),
  broadband: () => get<BroadbandData>('/broadband'),
  sysinfo: () => get<SysInfo>('/sysinfo'),
  bandwidthHistory: (range: TimeRange = '1h') =>
    get<BandwidthHistoryResponse>(`/bandwidth-history?range=${range}`),
  status: () => get<{ online: boolean; lastPollTime: number | null; daemonConnected: boolean }>('/status'),
}
