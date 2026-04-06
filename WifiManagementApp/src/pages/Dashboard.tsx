import { useState, useEffect } from 'react'
import { Wifi, Download, Upload, Monitor, Clock, Database, Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useRouterContext } from '../hooks/useRouterData'
import { api, TimeRange, BandwidthSample } from '../api/client'

// ─── helpers ────────────────────────────────────────────────────────────────

function bpsToMbps(bps: number): string {
  return (bps / 1_000_000).toFixed(2)
}

function formatChartTime(ts: number, range: TimeRange): string {
  const d = new Date(ts)
  if (range === '7d') {
    return d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
  }
  if (range === '24h' || range === '6h') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── subcomponents ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#252535] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="text-[#94a3b8] mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value} Mbps
          </p>
        ))}
      </div>
    )
  }
  return null
}

const RANGE_LABELS: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
]

// ─── main component ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const { devices, broadband, sysinfo, online, loading } = useRouterContext()

  const [range, setRange] = useState<TimeRange>('1h')
  const [historyData, setHistoryData] = useState<BandwidthSample[]>([])
  const [historySource, setHistorySource] = useState<'db' | 'memory' | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [daemonConnected, setDaemonConnected] = useState(false)

  // Fetch bandwidth history whenever range changes, and refresh every 30s
  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      setHistoryLoading(true)
      try {
        const res = await api.bandwidthHistory(range)
        if (!cancelled) {
          setHistoryData(res.history)
          setHistorySource(res.source)
        }
      } catch {
        // silently keep previous data
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [range])

  // Check daemon status
  useEffect(() => {
    api.status().then((s) => setDaemonConnected(s.daemonConnected)).catch(() => {})
  }, [])

  const onlineCount = devices.filter((d) => d.online).length
  const totalCount = devices.length

  // Latest sample for header stats
  const latest = historyData[historyData.length - 1]
  const downloadMbps = latest ? bpsToMbps(latest.rxBps) : '—'
  const uploadMbps = latest ? bpsToMbps(latest.txBps) : '—'

  // Format for chart
  const chartData = historyData.map((s) => ({
    time: formatChartTime(s.time, range),
    download: parseFloat(bpsToMbps(s.rxBps)),
    upload: parseFloat(bpsToMbps(s.txBps)),
  }))

  const lineState = broadband?.lineState ?? '—'
  const wanIp = broadband?.ipv4 ?? '—'
  const uptime = sysinfo?.uptime ?? '—'
  const model = sysinfo?.model ?? '—'
  const rxTotal = broadband?.rxBytes != null ? (broadband.rxBytes / 1e9).toFixed(1) : '—'
  const txTotal = broadband?.txBytes != null ? (broadband.txBytes / 1e9).toFixed(1) : '—'

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Network Status Card */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0">
              <Wifi className={`w-6 h-6 ${online ? 'text-[#00d4aa]' : 'text-red-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg font-bold text-white">
                  {loading ? 'Loading...' : online ? 'Network Healthy' : 'Network Offline'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  online
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {lineState}
                </span>
                {daemonConnected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20">
                    <Database className="w-3 h-3" />
                    Daemon active
                  </span>
                )}
              </div>
              <p className="text-[#94a3b8] text-sm">{model}</p>
              <p className="text-[#94a3b8] text-xs mt-1">WAN IP: {wanIp}</p>
            </div>
          </div>

          {/* Live speed stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Download className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-xs text-[#94a3b8]">Down</span>
              </div>
              <div className="text-xl font-bold text-[#00d4aa]">{downloadMbps}</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Upload className="w-3.5 h-3.5 text-[#f472b6]" />
                <span className="text-xs text-[#94a3b8]">Up</span>
              </div>
              <div className="text-xl font-bold text-[#f472b6]">{uploadMbps}</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span className="text-xs text-[#94a3b8]">Line</span>
              </div>
              <div className="text-sm font-bold text-[#8b5cf6]">{broadband?.lineSpeed ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-[#00d4aa]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Devices Online</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {onlineCount}<span className="text-[#94a3b8] text-base font-normal">/{totalCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            <span className="text-xs text-[#94a3b8]">{totalCount - onlineCount} offline</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#f472b6]/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#f472b6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Total Received</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {rxTotal}<span className="text-base font-normal text-[#94a3b8]"> GB</span>
          </div>
          <div className="text-xs text-[#94a3b8]">Sent: {txTotal} GB</div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Uptime</span>
          </div>
          <div className="text-sm font-bold text-white mb-1 leading-snug">{uptime}</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            <span className="text-xs text-[#94a3b8]">Since last reboot</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">History Points</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{historyData.length}</div>
          <div className="text-xs text-[#94a3b8]">
            {historySource === 'db' ? 'From SQLite daemon' : historySource === 'memory' ? 'In-memory' : '—'}
          </div>
        </div>
      </div>

      {/* Bandwidth Chart */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-white font-semibold">Bandwidth Usage</h3>
            <p className="text-[#94a3b8] text-xs mt-0.5">
              {historyLoading ? 'Loading...' : `${chartData.length} samples · ${historySource === 'db' ? 'Persistent history' : 'Live memory'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range switcher */}
            <div className="flex rounded-lg overflow-hidden border border-[#2a2a3e]">
              {RANGE_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setRange(value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    range === value
                      ? 'bg-[#00d4aa]/20 text-[#00d4aa]'
                      : 'bg-[#1e1e2e] text-[#94a3b8] hover:bg-[#252535] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded bg-[#00d4aa]" />
                <span className="text-[#94a3b8]">Down</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded bg-[#f472b6]" />
                <span className="text-[#94a3b8]">Up</span>
              </div>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-[#94a3b8] text-sm gap-2">
            {historyLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
                <span>Loading history...</span>
              </>
            ) : daemonConnected ? (
              <span>Collecting data — check back in 30s</span>
            ) : (
              <span>Start the daemon to collect persistent history</span>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="download"
                name="Download"
                stroke="#00d4aa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00d4aa' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="Upload"
                stroke="#f472b6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f472b6' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
