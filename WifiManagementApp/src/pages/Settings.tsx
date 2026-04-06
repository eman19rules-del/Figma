import { useState } from 'react'
import { Router, Wifi, RefreshCw, Download, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react'

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

function SelectField({ label, value, options }: {
  label: string
  value: string
  options: string[]
}) {
  const [val, setVal] = useState(value)
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-white">{label}</label>
      <div className="relative">
        <select
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm focus:outline-none focus:border-[#00d4aa]/50 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
      </div>
    </div>
  )
}

export default function Settings() {
  const [ssid5, setSsid5] = useState('HomeNet-5G')
  const [ssid24, setSsid24] = useState('HomeNet-2.4G')
  const [txPower, setTxPower] = useState(80)
  const [beamforming, setBeamforming] = useState(true)
  const [muMimo, setMuMimo] = useState(true)
  const [qos, setQos] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [saved, setSaved] = useState(false)
  const [restarting, setRestarting] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleRestart = () => {
    setRestarting(true)
    setTimeout(() => setRestarting(false), 3000)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Router Info */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
            <Router className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">ASUS RT-AX88U Pro</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] text-xs border border-[#00d4aa]/20">
                Up to date
              </span>
            </div>
            <div className="text-[#94a3b8] text-xs mt-0.5">Model AX6000 · Firmware 3.0.0.4.390_22195</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'WAN IP', value: '72.145.210.88' },
            { label: 'LAN IP', value: '192.168.1.1' },
            { label: 'Subnet Mask', value: '255.255.255.0' },
            { label: 'Uptime', value: '14d 6h 22m' },
            { label: 'DNS Primary', value: '1.1.1.1' },
            { label: 'DNS Secondary', value: '8.8.8.8' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-[#252535] border border-[#2a2a3e]">
              <div className="text-[#94a3b8] text-xs mb-0.5">{label}</div>
              <div className="text-white text-sm font-mono font-medium">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wireless Settings */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-[#8b5cf6]" />
          <h3 className="text-white font-semibold">Wireless Settings</h3>
        </div>

        <div>
          <label className="block text-xs text-[#94a3b8] mb-1.5">5 GHz Network Name</label>
          <input
            type="text"
            value={ssid5}
            onChange={(e) => setSsid5(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-[#94a3b8] mb-1.5">2.4 GHz Network Name</label>
          <input
            type="text"
            value={ssid24}
            onChange={(e) => setSsid24(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
          />
        </div>

        <div className="border-t border-[#2a2a3e] pt-4 space-y-3">
          <SelectField
            label="5 GHz Channel"
            value="Auto"
            options={['Auto', '36', '40', '44', '48', '149', '153', '157', '161']}
          />
          <SelectField
            label="2.4 GHz Channel"
            value="Auto"
            options={['Auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}
          />
        </div>

        <div className="border-t border-[#2a2a3e] pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Transmit Power</span>
            <span className="text-[#00d4aa] text-sm font-bold">{txPower}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8]">Low</span>
            <input
              type="range"
              min={0}
              max={100}
              value={txPower}
              onChange={(e) => setTxPower(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00d4aa ${txPower}%, #2a2a3e ${txPower}%)`,
              }}
            />
            <span className="text-xs text-[#94a3b8]">High</span>
          </div>
        </div>

        <div className="border-t border-[#2a2a3e] pt-4 space-y-4">
          <Toggle
            checked={beamforming}
            onChange={setBeamforming}
            label="Beamforming"
            description="Focus signal toward connected devices"
          />
          <Toggle
            checked={muMimo}
            onChange={setMuMimo}
            label="MU-MIMO"
            description="Serve multiple devices simultaneously"
          />
          <Toggle
            checked={qos}
            onChange={setQos}
            label="QoS Priority Mode"
            description="Automatically prioritize gaming and video streaming"
          />
          <Toggle
            checked={autoUpdate}
            onChange={setAutoUpdate}
            label="Auto Firmware Update"
            description="Keep router firmware up to date automatically"
          />
        </div>
      </div>

      {/* Router Actions */}
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-5">
        <h3 className="text-white font-semibold mb-4">Router Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRestart}
            disabled={restarting}
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#252535] border border-[#2a2a3e] hover:border-[#3a3a5e] text-white text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d4aa] ${restarting ? 'animate-spin' : ''}`} />
            {restarting ? 'Restarting...' : 'Restart Router'}
          </button>
          <button className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#252535] border border-[#2a2a3e] hover:border-[#3a3a5e] text-white text-sm font-medium transition-all">
            <Download className="w-4 h-4 text-[#8b5cf6]" />
            Backup Config
          </button>
          <button className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#252535] border border-yellow-500/20 hover:border-yellow-500/40 text-white text-sm font-medium transition-all">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Factory Reset
          </button>
          <button className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#252535] border border-[#2a2a3e] hover:border-[#3a3a5e] text-white text-sm font-medium transition-all">
            <Download className="w-4 h-4 text-[#f472b6]" />
            Check for Updates
          </button>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
            : 'bg-[#00d4aa] text-[#0f0f1a] hover:bg-[#00bfa0]'
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Settings Saved!
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </div>
  )
}
