import { useState } from 'react'
import { Eye, EyeOff, QrCode, UserX, Wifi, Shield, Gauge } from 'lucide-react'
import { guestDevices as initialGuests } from '../data/mockData'

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-[#94a3b8] mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-[#00d4aa]' : 'bg-[#2a2a3e]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function GuestNetwork() {
  const [enabled, setEnabled] = useState(true)
  const [ssid, setSsid] = useState('HomeNet-Guest')
  const [password, setPassword] = useState('guest@2024!')
  const [showPassword, setShowPassword] = useState(false)
  const [isolated, setIsolated] = useState(true)
  const [bandwidthLimit, setBandwidthLimit] = useState(25)
  const [guests, setGuests] = useState(initialGuests)

  const kickGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Enable toggle */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <div>
              <div className="text-white font-semibold">Guest Network</div>
              <div className="text-[#94a3b8] text-xs mt-0.5">
                {enabled ? 'Active — guests can connect' : 'Disabled'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              enabled ? 'bg-[#00d4aa]' : 'bg-[#2a2a3e]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <>
          {/* Network config */}
          <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Network Configuration</h3>

            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5">Network Name (SSID)</label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 pr-10 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-5 h-5 text-[#8b5cf6]" />
              <h3 className="text-white font-semibold text-sm">Share via QR Code</h3>
            </div>
            <div className="flex items-center gap-5">
              {/* Fake QR code */}
              <div className="w-24 h-24 bg-white rounded-xl p-2 flex-shrink-0">
                <div className="w-full h-full grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,12,17,6,11,16,8,13,18][i] % 2 === 0
                          ? 'bg-black'
                          : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1">{ssid}</div>
                <div className="text-[#94a3b8] text-xs mb-3">Scan to join guest network</div>
                <button className="px-3 py-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-medium border border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 transition-colors">
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Security & limits */}
          <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5 space-y-5">
            <h3 className="text-white font-semibold text-sm">Security & Limits</h3>

            <Toggle
              checked={isolated}
              onChange={setIsolated}
              label="Network Isolation"
              description="Prevent guests from accessing your local network (LAN)"
            />

            <div className="border-t border-[#2a2a3e] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#94a3b8]" />
                  <span className="text-sm text-white">Bandwidth Limit</span>
                </div>
                <span className="text-[#00d4aa] text-sm font-bold">
                  {bandwidthLimit === 0 ? 'Unlimited' : `${bandwidthLimit} Mbps`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94a3b8]">0</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bandwidthLimit}
                  onChange={(e) => setBandwidthLimit(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00d4aa ${bandwidthLimit}%, #2a2a3e ${bandwidthLimit}%)`,
                  }}
                />
                <span className="text-xs text-[#94a3b8]">100</span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">
                {bandwidthLimit === 0 ? 'No bandwidth restrictions' : `Guests limited to ${bandwidthLimit} Mbps`}
              </p>
            </div>
          </div>

          {/* Connected guests */}
          <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Connected Guests</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-xs border border-[#00d4aa]/20">
                {guests.length} connected
              </span>
            </div>

            {guests.length === 0 ? (
              <div className="text-center py-8 text-[#94a3b8]">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No guests currently connected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#252535] border border-[#2a2a3e]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
                        <Wifi className="w-4 h-4 text-[#8b5cf6]" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{guest.name}</div>
                        <div className="text-[#94a3b8] text-xs">{guest.ip} · {guest.connectedTime}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => kickGuest(guest.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                    >
                      <UserX className="w-3 h-3" />
                      Kick
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
