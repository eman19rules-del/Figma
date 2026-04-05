import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import GuestNetwork from './pages/GuestNetwork'
import ParentalControls from './pages/ParentalControls'
import Security from './pages/Security'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="guest-network" element={<GuestNetwork />} />
          <Route path="parental-controls" element={<ParentalControls />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
