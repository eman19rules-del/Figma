import { useState } from 'react'
import { Search, Wifi, Cable, Loader2 } from 'lucide-react'
import { useRouterContext } from '../hooks/useRouterData'
import { RouterDevice } from '../api/client'

type FilterTab = 'All' | 'Online' | 'Offline' | '5GHz' | '2.4GHz' | 'Wired'

function BandBadge({ band }: { band: string | null }) {
  if (band === 'Wired') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
        <Cable className="w-3 h-3" />
        Wired
      </span>
    )
  }
  if (!band) return null
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs border border-[#8b5cf6]/20">
      <Wifi className="w-3 h-3" />
      {band}
    </span>
  )
}

function DeviceCard({ device }: { device: RouterDevice }) {
  const displayName = device.name ?? device.mac

  return (
    <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4 hover:border-[#3a3a5e] transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#252535] border border-[#2a2a3e] flex items-center justify-center">
              {device.band === 'Wired'
                ? <Cable className="w-4 h-4 text-blue-400" />
                : <Wifi className="w-4 h-4 text-[#8b5cf6]" />
              }
            </div>
            {device.online && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00d4aa] border-2 border-[#1e1e2e]" />
            )}
          </div>
          <div>
            <span className="text-white text-sm font-semibold">{displayName}</span>
            <div className="text-[#94a3b8] text-xs mt-0.5">
              {device.ip ?? 'No IP'} · {device.mac}
            </div>
          </div>
        </div>

        <BandBadge band={device.band} />
      </div>

      <div className="pt-3 border-t border-[#2a2a3e]">
        {device.online ? (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            <span className="text-xs text-[#00d4aa]">Online</span>
          </div>
        ) : (
          <span className="text-xs text-[#94a3b8]">Offline</span>
        )}
      </div>
    </div>
  )
}

export default function Devices() {
  const { devices, loading } = useRouterContext()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')

  const onlineCount = devices.filter((d) => d.online).length
  const totalCount = devices.length

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      (d.name ?? '').toLowerCase().includes(q) ||
      (d.ip ?? '').includes(q) ||
      d.mac.toLowerCase().includes(q)

    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Online' && d.online) ||
      (activeFilter === 'Offline' && !d.online) ||
      (activeFilter === '5GHz' && d.band === '5GHz') ||
      (activeFilter === '2.4GHz' && d.band === '2.4GHz') ||
      (activeFilter === 'Wired' && d.band === 'Wired')

    return matchSearch && matchFilter
  })

  const filterTabs: FilterTab[] = ['All', 'Online', 'Offline', '5GHz', '2.4GHz', 'Wired']

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
          {loading && <Loader2 className="w-4 h-4 text-[#94a3b8] animate-spin" />}
        </div>
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by name, IP, MAC"
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
      {loading && devices.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[#94a3b8] gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading devices...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-[#94a3b8]">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No devices match your filter</p>
        </div>
      )}
    </div>
  )
}
