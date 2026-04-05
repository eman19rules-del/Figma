import { Wifi, Download, Upload, Activity, Monitor, Clock, ShieldAlert } from 'lucide-react'
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

function bpsToMbps(bps: number): string {
  return (bps / 1_000_000).toFixed(1)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#252535] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs">
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

export default function Dashboard() {
  const { devices, broadband, sysinfo, bandwidthHistory, online, loading } = useRouterContext()

  const onlineCount = devices.filter((d) => d.online).length
  const totalCount = devices.length

  // Latest bandwidth sample
  const latest = bandwidthHistory[bandwidthHistory.length - 1]
  const downloadMbps = latest ? bpsToMbps(latest.rxBps) : '—'
  const uploadMbps = latest ? bpsToMbps(latest.txBps) : '—'

  // Chart data: last 20 samples
  const chartData = bandwidthHistory.slice(-20).map((s) => ({
    time: formatTime(s.time),
    download: parseFloat(bpsToMbps(s.rxBps)),
    upload: parseFloat(bpsToMbps(s.txBps)),
  }))

  const lineState = broadband?.lineState ?? '—'
  const wanIp = broadband?.ipv4 ?? '—'
  const uptime = sysinfo?.uptime ?? '—'
  const model = sysinfo?.model ?? '—'

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
              <div className="flex items-center gap-2 mb-1">
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
              </div>
              <p className="text-[#94a3b8] text-sm">{model}</p>
              <p className="text-[#94a3b8] text-xs mt-1">WAN IP: {wanIp}</p>
            </div>
          </div>

          {/* Speed stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Download className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-xs text-[#94a3b8]">Download</span>
              </div>
              <div className="text-xl font-bold text-[#00d4aa]">{downloadMbps}</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Upload className="w-3.5 h-3.5 text-[#f472b6]" />
                <span className="text-xs text-[#94a3b8]">Upload</span>
              </div>
              <div className="text-xl font-bold text-[#f472b6]">{uploadMbps}</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span className="text-xs text-[#94a3b8]">Line Speed</span>
              </div>
              <div className="text-xl font-bold text-[#8b5cf6]">{broadband?.lineSpeed ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards 2x2 */}
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
            <span className="text-[#94a3b8] text-xs font-medium">Total RX</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {broadband?.rxBytes != null
              ? `${(broadband.rxBytes / 1e9).toFixed(1)}`
              : '—'}
            <span className="text-base font-normal text-[#94a3b8]"> GB</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#94a3b8]">Cumulative received</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Uptime</span>
          </div>
          <div className="text-lg font-bold text-white mb-1 truncate">{uptime}</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            <span className="text-xs text-[#94a3b8]">Since last reboot</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">RX Errors</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {broadband?.rxErrors ?? '—'}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#94a3b8]">TX errors: {broadband?.txErrors ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Bandwidth Chart */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Bandwidth Usage</h3>
            <p className="text-[#94a3b8] text-xs mt-0.5">Live — last {chartData.length} samples</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-[#00d4aa]" />
              <span className="text-[#94a3b8]">Download</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-[#f472b6]" />
              <span className="text-[#94a3b8]">Upload</span>
            </div>
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-[#94a3b8] text-sm">
            Collecting bandwidth data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={3}
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
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="Upload"
                stroke="#f472b6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f472b6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
