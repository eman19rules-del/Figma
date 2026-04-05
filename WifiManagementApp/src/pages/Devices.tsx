import { useState } from 'react'
import { Search, Download, Upload, Signal, Ban, Wifi, Cable } from 'lucide-react'
import { devices as initialDevices, Device } from '../data/mockData'
import DeviceIcon from '../components/DeviceIcon'

type FilterTab = 'All' | 'Online' | 'Offline' | 'Blocked' | '5GHz' | '2.4GHz' | 'Wired'

function SignalBars({ signal }: { signal: number }) {
  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm transition-colors ${
            bar <= signal ? 'bg-[#00d4aa]' : 'bg-[#2a2a3e]'
          }`}
          style={{ height: `${bar * 3 + 3}px` }}
        />
      ))}
    </div>
  )
}

function BandBadge({ band }: { band: Device['band'] }) {
  if (band === 'Wired') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
        <Cable className="w-3 h-3" />
        Wired
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs border border-[#8b5cf6]/20">
      <Wifi className="w-3 h-3" />
      {band}
    </span>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState(initialDevices)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')

  const onlineCount = devices.filter((d) => d.online).length
  const totalCount = devices.length

  const toggleBlock = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, blocked: !d.blocked } : d))
    )
  }

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(q) ||
      d.ip.includes(q) ||
      d.mac.toLowerCase().includes(q) ||
      d.manufacturer.toLowerCase().includes(q)

    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Online' && d.online) ||
      (activeFilter === 'Offline' && !d.online) ||
      (activeFilter === 'Blocked' && d.blocked) ||
      (activeFilter === '5GHz' && d.band === '5GHz') ||
      (activeFilter === '2.4GHz' && d.band === '2.4GHz') ||
      (activeFilter === 'Wired' && d.band === 'Wired')

    return matchSearch && matchFilter
  })

  const filterTabs: FilterTab[] = ['All', 'Online', 'Offline', 'Blocked', '5GHz', '2.4GHz', 'Wired']

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Filter pills + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-sm font-medium border border-[#00d4aa]/20">
            {onlineCount} online
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#252535] text-[#94a3b8] text-sm border border-[#2a2a3e]">
            {totalCount} total registered
          </span>
        </div>
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by name, IP, MAC, manufacturer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1e1e2e] border border-[#2a2a3e] text-sm text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === tab
                ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30'
                : 'bg-[#1e1e2e] text-[#94a3b8] border border-[#2a2a3e] hover:bg-[#252535] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((device) => (
          <div
            key={device.id}
            className={`bg-[#1e1e2e] rounded-2xl border p-4 transition-all ${
              device.blocked
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-[#2a2a3e] hover:border-[#3a3a5e]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <DeviceIcon icon={device.icon} />
                  {device.online && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00d4aa] border-2 border-[#1e1e2e]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">{device.name}</span>
                    {device.blocked && (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">Blocked</span>
                    )}
                  </div>
                  <div className="text-[#94a3b8] text-xs mt-0.5">
                    {device.manufacturer} · {device.ip}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <BandBadge band={device.band} />
                <button
                  onClick={() => toggleBlock(device.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    device.blocked
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                      : 'bg-transparent text-red-400 border-red-500/40 hover:bg-red-500/10'
                  }`}
                >
                  <Ban className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            {device.online ? (
              <div className="flex items-center gap-4 pt-3 border-t border-[#2a2a3e]">
                <div className="flex items-center gap-1.5">
                  <SignalBars signal={device.signal} />
                </div>
                <div className="flex items-center gap-1 text-xs text-[#00d4aa]">
                  <Download className="w-3 h-3" />
                  <span>{device.download >= 1 ? `${device.download}` : device.download} Mbps</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#f472b6]">
                  <Upload className="w-3 h-3" />
                  <span>{device.upload} Mbps</span>
                </div>
                <div className="text-xs text-[#94a3b8] ml-auto">{device.dataToday} GB today</div>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#2a2a3e]">
                <span className="text-xs text-[#94a3b8]">Offline</span>
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-2 text-xs text-[#94a3b8]">
              <span>Connected {device.connectedTime}</span>
              <span className="font-mono">{device.mac}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#94a3b8]">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No devices match your filter</p>
        </div>
      )}
    </div>
  )
}
