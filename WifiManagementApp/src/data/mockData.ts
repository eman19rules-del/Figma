export interface Device {
  id: string
  name: string
  manufacturer: string
  ip: string
  mac: string
  band: '5GHz' | '2.4GHz' | 'Wired'
  online: boolean
  blocked: boolean
  download: number // Mbps
  upload: number // Mbps
  dataToday: number // GB
  connectedTime: string
  signal: number // 1-4
  icon: string
}

export const devices: Device[] = [
  {
    id: '1',
    name: "Sarah's iPhone",
    manufacturer: 'Apple',
    ip: '192.168.1.101',
    mac: 'A4:C3:F0:12:34:56',
    band: '5GHz',
    online: true,
    blocked: false,
    download: 245,
    upload: 48,
    dataToday: 3.2,
    connectedTime: '6h 14m',
    signal: 4,
    icon: 'smartphone',
  },
  {
    id: '2',
    name: 'MacBook Pro',
    manufacturer: 'Apple',
    ip: '192.168.1.102',
    mac: 'B8:E8:56:78:9A:BC',
    band: '5GHz',
    online: true,
    blocked: false,
    download: 480,
    upload: 95,
    dataToday: 12.7,
    connectedTime: '14h 6m',
    signal: 4,
    icon: 'laptop',
  },
  {
    id: '3',
    name: 'Living Room TV',
    manufacturer: 'Samsung',
    ip: '192.168.1.103',
    mac: 'C0:71:AA:DE:F0:12',
    band: '5GHz',
    online: true,
    blocked: false,
    download: 120,
    upload: 5,
    dataToday: 8.4,
    connectedTime: '8h 32m',
    signal: 3,
    icon: 'tv',
  },
  {
    id: '4',
    name: 'PlayStation 5',
    manufacturer: 'Sony',
    ip: '192.168.1.104',
    mac: 'D4:42:1B:34:56:78',
    band: 'Wired',
    online: true,
    blocked: false,
    download: 850,
    upload: 180,
    dataToday: 24.1,
    connectedTime: '5h 48m',
    signal: 4,
    icon: 'gamepad',
  },
  {
    id: '5',
    name: "Jake's iPad",
    manufacturer: 'Apple',
    ip: '192.168.1.105',
    mac: 'E8:6F:38:9A:BC:DE',
    band: '2.4GHz',
    online: true,
    blocked: false,
    download: 54,
    upload: 12,
    dataToday: 1.8,
    connectedTime: '3h 22m',
    signal: 3,
    icon: 'tablet',
  },
  {
    id: '6',
    name: 'Nest Thermostat',
    manufacturer: 'Google',
    ip: '192.168.1.106',
    mac: 'F4:F5:D8:BC:DE:F0',
    band: '2.4GHz',
    online: true,
    blocked: false,
    download: 0.5,
    upload: 0.2,
    dataToday: 0.05,
    connectedTime: '14d 6h',
    signal: 2,
    icon: 'thermometer',
  },
  {
    id: '7',
    name: 'Ring Doorbell',
    manufacturer: 'Ring',
    ip: '192.168.1.107',
    mac: '00:1A:2B:DE:F0:12',
    band: '2.4GHz',
    online: true,
    blocked: false,
    download: 4.2,
    upload: 2.1,
    dataToday: 0.8,
    connectedTime: '14d 6h',
    signal: 2,
    icon: 'bell',
  },
  {
    id: '8',
    name: 'Echo Dot',
    manufacturer: 'Amazon',
    ip: '192.168.1.108',
    mac: '10:AE:60:12:34:56',
    band: '2.4GHz',
    online: true,
    blocked: false,
    download: 8,
    upload: 1,
    dataToday: 0.3,
    connectedTime: '14d 6h',
    signal: 3,
    icon: 'speaker',
  },
  {
    id: '9',
    name: 'Unknown Device',
    manufacturer: 'Unknown',
    ip: '192.168.1.109',
    mac: '22:33:44:55:66:77',
    band: '2.4GHz',
    online: true,
    blocked: false,
    download: 2,
    upload: 0.5,
    dataToday: 0.1,
    connectedTime: '1h 5m',
    signal: 1,
    icon: 'help-circle',
  },
  {
    id: '10',
    name: "Mom's Laptop",
    manufacturer: 'Dell',
    ip: '192.168.1.110',
    mac: '34:45:56:67:78:89',
    band: '5GHz',
    online: false,
    blocked: false,
    download: 0,
    upload: 0,
    dataToday: 0,
    connectedTime: 'Offline',
    signal: 0,
    icon: 'laptop',
  },
]

export interface BandwidthDataPoint {
  time: string
  download: number
  upload: number
}

export const bandwidthData: BandwidthDataPoint[] = [
  { time: '00:00', download: 45, upload: 12 },
  { time: '01:00', download: 30, upload: 8 },
  { time: '02:00', download: 20, upload: 5 },
  { time: '03:00', download: 15, upload: 4 },
  { time: '04:00', download: 12, upload: 3 },
  { time: '05:00', download: 18, upload: 5 },
  { time: '06:00', download: 55, upload: 18 },
  { time: '07:00', download: 120, upload: 35 },
  { time: '08:00', download: 280, upload: 75 },
  { time: '09:00', download: 350, upload: 90 },
  { time: '10:00', download: 420, upload: 95 },
  { time: '11:00', download: 390, upload: 88 },
  { time: '12:00', download: 460, upload: 100 },
  { time: '13:00', download: 481, upload: 105 },
  { time: '14:00', download: 445, upload: 98 },
  { time: '15:00', download: 380, upload: 82 },
  { time: '16:00', download: 410, upload: 90 },
  { time: '17:00', download: 470, upload: 102 },
  { time: '18:00', download: 490, upload: 108 },
  { time: '19:00', download: 510, upload: 115 },
  { time: '20:00', download: 480, upload: 105 },
  { time: '21:00', download: 420, upload: 88 },
  { time: '22:00', download: 310, upload: 65 },
  { time: '23:00', download: 180, upload: 40 },
]

export interface GuestDevice {
  id: string
  name: string
  ip: string
  connectedTime: string
}

export const guestDevices: GuestDevice[] = [
  { id: 'g1', name: "Visitor's iPhone", ip: '192.168.2.101', connectedTime: '2h 15m' },
  { id: 'g2', name: 'Guest Laptop', ip: '192.168.2.102', connectedTime: '45m' },
]

export interface FamilyMember {
  id: string
  name: string
  avatar: string
  devices: string[]
  paused: boolean
  safeSearch: boolean
  blockedSites: string[]
  schedule: Record<string, { start: string; end: string } | null>
}

export const familyMembers: FamilyMember[] = [
  {
    id: 'f1',
    name: 'Jake',
    avatar: '👦',
    devices: ['5'],
    paused: false,
    safeSearch: true,
    blockedSites: ['youtube.com', 'tiktok.com'],
    schedule: {
      Mon: { start: '15:00', end: '21:00' },
      Tue: { start: '15:00', end: '21:00' },
      Wed: { start: '15:00', end: '21:00' },
      Thu: { start: '15:00', end: '21:00' },
      Fri: { start: '15:00', end: '22:00' },
      Sat: { start: '09:00', end: '22:00' },
      Sun: { start: '09:00', end: '21:00' },
    },
  },
  {
    id: 'f2',
    name: 'Sarah',
    avatar: '👧',
    devices: ['1'],
    paused: false,
    safeSearch: false,
    blockedSites: ['gambling.com'],
    schedule: {
      Mon: { start: '07:00', end: '23:00' },
      Tue: { start: '07:00', end: '23:00' },
      Wed: { start: '07:00', end: '23:00' },
      Thu: { start: '07:00', end: '23:00' },
      Fri: { start: '07:00', end: '23:59' },
      Sat: null,
      Sun: null,
    },
  },
]
