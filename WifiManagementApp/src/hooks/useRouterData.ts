import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { api, RouterDevice, BroadbandData, SysInfo, BandwidthSample } from '../api/client'

export interface RouterState {
  online: boolean
  devices: RouterDevice[]
  broadband: BroadbandData | null
  sysinfo: SysInfo | null
  bandwidthHistory: BandwidthSample[]
  loading: boolean
  lastUpdated: number | null
}

const POLL_MS = 10_000

export function useRouterData(): RouterState {
  const [state, setState] = useState<RouterState>({
    online: false,
    devices: [],
    broadband: null,
    sysinfo: null,
    bandwidthHistory: [],
    loading: true,
    lastUpdated: null,
  })

  const fetchAll = useCallback(async () => {
    try {
      const [statusRes, devRes, bbRes, syRes, bwRes] = await Promise.allSettled([
        api.status(),
        api.devices(),
        api.broadband(),
        api.sysinfo(),
        api.bandwidthHistory(),
      ])

      setState((prev) => ({
        ...prev,
        loading: false,
        lastUpdated: Date.now(),
        online: statusRes.status === 'fulfilled' ? statusRes.value.online : prev.online,
        devices: devRes.status === 'fulfilled' ? devRes.value.devices : prev.devices,
        broadband: bbRes.status === 'fulfilled' ? bbRes.value : prev.broadband,
        sysinfo: syRes.status === 'fulfilled' ? syRes.value : prev.sysinfo,
        bandwidthHistory:
          bwRes.status === 'fulfilled' ? bwRes.value.history : prev.bandwidthHistory,
      }))
    } catch {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, POLL_MS)
    return () => clearInterval(interval)
  }, [fetchAll])

  return state
}

// Context for sharing router data across the app without prop drilling
export const RouterDataContext = createContext<RouterState>({
  online: false,
  devices: [],
  broadband: null,
  sysinfo: null,
  bandwidthHistory: [],
  loading: true,
  lastUpdated: null,
})

export const useRouterContext = () => useContext(RouterDataContext)
