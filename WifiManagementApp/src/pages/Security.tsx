import { useState } from 'react'
import { Shield, ShieldCheck, Scan, Globe, AlertCircle } from 'lucide-react'

interface SecurityToggle {
  id: string
  label: string
  description: string
  enabled: boolean
}

const initialToggles: SecurityToggle[] = [
  {
    id: 'spi',
    label: 'SPI Firewall',
    description: 'Stateful Packet Inspection to block unauthorized access',
    enabled: true,
  },
  {
    id: 'ipv6',
    label: 'IPv6 Firewall',
    description: 'Extend firewall protection to IPv6 traffic',
    enabled: true,
  },
  {
    id: 'dos',
    label: 'DoS Protection',
    description: 'Prevent Denial of Service attacks',
    enabled: true,
  },
  {
    id: 'vpn',
    label: 'VPN Passthrough',
    description: 'Allow VPN tunnels through the router',
    enabled: false,
  },
  {
    id: 'dns',
    label: 'DNS Filtering',
    description: 'Block access to known malicious domains',
    enabled: true,
  },
  {
    id: 'ids',
    label: 'Intrusion Detection (IDS)',
    description: 'Monitor and alert on suspicious network behavior',
    enabled: true,
  },
]

const openPorts = [
  { port: 80, protocol: 'TCP', service: 'HTTP', status: 'Open' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', status: 'Open' },
  { port: 53, protocol: 'UDP', service: 'DNS', status: 'Open' },
  { port: 22, protocol: 'TCP', service: 'SSH', status: 'Filtered' },
]

export default function Security() {
  const [toggles, setToggles] = useState(initialToggles)
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)

  const enabledCount = toggles.filter((t) => t.enabled).length
  const score = Math.round((enabledCount / toggles.length) * 100)

  const toggle = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))
  }

  const runScan = () => {
    setScanning(true)
    setScanComplete(false)
    setTimeout(() => {
      setScanning(false)
      setScanComplete(true)
    }, 2500)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Security Score */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-6">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle
                cx="18" cy="18" r="15.9"
                fill="none" stroke="#2a2a3e" strokeWidth="2.5"
              />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={score >= 80 ? '#00d4aa' : score >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2.5"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{score}%</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#00d4aa]" />
              <span className="text-white font-bold text-lg">
                {score === 100 ? 'Fully Protected' : score >= 80 ? 'Well Protected' : 'Needs Attention'}
              </span>
            </div>
            <p className="text-[#94a3b8] text-sm">
              {score === 100
                ? 'Your network is well protected'
                : `${toggles.length - enabledCount} protection(s) disabled`}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-[#94a3b8]">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#00d4aa]" />
                {enabledCount} active
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#2a2a3e]" />
                {toggles.length - enabledCount} disabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Firewall & Protection */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#00d4aa]" />
          <h3 className="text-white font-semibold">Firewall & Protection</h3>
        </div>
        <div className="space-y-4">
          {toggles.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <div className="border-t border-[#2a2a3e] mb-4" />}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">{item.description}</div>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    item.enabled ? 'bg-[#00d4aa]' : 'bg-[#2a2a3e]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerability Scan */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Scan className="w-5 h-5 text-[#8b5cf6]" />
          <h3 className="text-white font-semibold">Network Vulnerability Scan</h3>
        </div>
        <p className="text-[#94a3b8] text-xs mb-4">
          Scan your network for potential vulnerabilities and misconfigurations
        </p>

        {scanComplete && (
          <div className="mb-4 p-3 rounded-xl bg-[#00d4aa]/5 border border-[#00d4aa]/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-[#00d4aa] text-sm font-medium">Scan complete — No vulnerabilities found</span>
            </div>
          </div>
        )}

        <button
          onClick={runScan}
          disabled={scanning}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            scanning
              ? 'bg-[#00d4aa]/20 text-[#00d4aa] cursor-not-allowed'
              : 'bg-[#00d4aa] text-[#0f0f1a] hover:bg-[#00bfa0]'
          }`}
        >
          <Scan className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      {/* Open Ports */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#94a3b8]" />
          <h3 className="text-white font-semibold">Open Ports</h3>
        </div>
        <div className="space-y-2">
          {openPorts.map((port) => (
            <div
              key={port.port}
              className="flex items-center justify-between p-3 rounded-xl bg-[#252535] border border-[#2a2a3e]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 text-center">
                  <span className="text-white font-mono text-sm font-bold">{port.port}</span>
                </div>
                <div>
                  <div className="text-white text-sm">{port.service}</div>
                  <div className="text-[#94a3b8] text-xs">{port.protocol}</div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  port.status === 'Open'
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {port.status}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-[#252535] border border-[#2a2a3e]">
          <AlertCircle className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
          <p className="text-xs text-[#94a3b8]">
            All listed ports are expected and managed by your router. No unauthorized ports detected.
          </p>
        </div>
      </div>
    </div>
  )
}
