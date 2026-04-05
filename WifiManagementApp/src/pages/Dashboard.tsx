import { Wifi, Download, Upload, Activity, Monitor, HardDrive, Clock, ShieldAlert, TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { bandwidthData } from '../data/mockData'

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
  return (
    <div className="space-y-5 max-w-6xl">
      {/* Network Status Card */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4aa]/10 flex items-center justify-center flex-shrink-0">
              <Wifi className="w-6 h-6 text-[#00d4aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">Network Healthy</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-xs font-medium border border-[#00d4aa]/20">
                  Active
                </span>
              </div>
              <p className="text-[#94a3b8] text-sm">HomeNet-5G · HomeNet-2.4G</p>
              <p className="text-[#94a3b8] text-xs mt-1">ISP: Comcast · WAN IP: 72.145.210.88</p>
            </div>
          </div>

          {/* Speed stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Download className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="text-xs text-[#94a3b8]">Download</span>
              </div>
              <div className="text-xl font-bold text-[#00d4aa]">481</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Upload className="w-3.5 h-3.5 text-[#f472b6]" />
                <span className="text-xs text-[#94a3b8]">Upload</span>
              </div>
              <div className="text-xl font-bold text-[#f472b6]">105</div>
              <div className="text-xs text-[#94a3b8]">Mbps</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span className="text-xs text-[#94a3b8]">Ping</span>
              </div>
              <div className="text-xl font-bold text-[#8b5cf6]">14</div>
              <div className="text-xs text-[#94a3b8]">ms</div>
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
            9<span className="text-[#94a3b8] text-base font-normal">/10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-xs text-[#94a3b8]">1 unknown device</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#f472b6]/10 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-[#f472b6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Bandwidth Today</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">57.4 <span className="text-base font-normal text-[#94a3b8]">GB</span></div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#00d4aa]" />
            <span className="text-xs text-[#94a3b8]">↑ 12% from yesterday</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">14d 6h</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            <span className="text-xs text-[#94a3b8]">99.98% reliability</span>
          </div>
        </div>

        <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[#94a3b8] text-xs font-medium">Threats Blocked</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">347</div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#94a3b8]">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Bandwidth Chart */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Bandwidth Usage</h3>
            <p className="text-[#94a3b8] text-xs mt-0.5">Last 24 hours</p>
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
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={bandwidthData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
      </div>
    </div>
  )
}
