import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Monitor,
  Users,
  Shield,
  Settings,
  Wifi,
  Menu,
  X,
  Bell,
  UserCheck,
  Router,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Monitor },
  { path: '/guest-network', label: 'Guest Network', icon: Users },
  { path: '/parental-controls', label: 'Parental Controls', icon: UserCheck },
  { path: '/security', label: 'Security', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/devices': 'Devices',
  '/guest-network': 'Guest Network',
  '/parental-controls': 'Parental Controls',
  '/security': 'Security',
  '/settings': 'Settings',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#0f0f1a] overflow-hidden">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] border-r border-[#2a2a3e] flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center">
              <Wifi className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">HomeNet</div>
              <div className="text-[#94a3b8] text-xs">Network Manager</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-[#2a2a3e] text-[#94a3b8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Router status */}
        <div className="mx-4 my-3 px-3 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e]">
          <div className="flex items-center gap-2">
            <Router className="w-4 h-4 text-[#00d4aa]" />
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                <span className="text-xs font-medium text-[#00d4aa]">Router Online</span>
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">ASUS RT-AX88U Pro</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                  : 'text-[#94a3b8] hover:bg-[#252535] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a3e]">
          <div className="text-xs text-[#94a3b8] text-center">v3.0.0.4 · ASUS RT-AX88U Pro</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-[#1a1a2e] border-b border-[#2a2a3e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-[#252535] text-[#94a3b8] hover:text-white transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl hover:bg-[#252535] text-[#94a3b8] hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/20">
              <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
              <span className="text-xs font-medium text-[#00d4aa]">10 devices online</span>
            </div>
            <button className="p-2 rounded-xl hover:bg-[#252535] text-[#94a3b8] hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f472b6] rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
