import {
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Tablet,
  Thermometer,
  Bell,
  Speaker,
  HelpCircle,
  Monitor,
  Printer,
  Watch,
  Camera,
  Router,
} from 'lucide-react'

interface DeviceIconProps {
  icon: string
  className?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  gamepad: Gamepad2,
  tablet: Tablet,
  thermometer: Thermometer,
  bell: Bell,
  speaker: Speaker,
  'help-circle': HelpCircle,
  monitor: Monitor,
  printer: Printer,
  watch: Watch,
  camera: Camera,
  router: Router,
}

const colorMap: Record<string, string> = {
  smartphone: 'bg-blue-500/20 text-blue-400',
  laptop: 'bg-purple-500/20 text-purple-400',
  tv: 'bg-teal-500/20 text-teal-400',
  gamepad: 'bg-indigo-500/20 text-indigo-400',
  tablet: 'bg-cyan-500/20 text-cyan-400',
  thermometer: 'bg-orange-500/20 text-orange-400',
  bell: 'bg-yellow-500/20 text-yellow-400',
  speaker: 'bg-pink-500/20 text-pink-400',
  'help-circle': 'bg-red-500/20 text-red-400',
  monitor: 'bg-green-500/20 text-green-400',
  printer: 'bg-gray-500/20 text-gray-400',
  watch: 'bg-rose-500/20 text-rose-400',
  camera: 'bg-emerald-500/20 text-emerald-400',
  router: 'bg-teal-500/20 text-teal-400',
}

export default function DeviceIcon({ icon, className = '' }: DeviceIconProps) {
  const IconComponent = iconMap[icon] || HelpCircle
  const colorClass = colorMap[icon] || 'bg-gray-500/20 text-gray-400'

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colorClass} ${className}`}>
      <IconComponent className="w-5 h-5" />
    </div>
  )
}
