import { useEffect, useState } from 'react'
import { DatabaseZap, PlugZap, ShieldCheck, TriangleAlert } from 'lucide-react'
import { API_BASE_URL } from '../config/apiConfig.js'
import { getBackendHealth } from '../services/healthApi.js'
import '../styles/backendStatusBanner.css'

function BackendStatusBanner({ label = 'Backend connection status', compact = false }) {
  const [status, setStatus] = useState({ state: 'checking', message: 'Checking Flask API connection...' })

  useEffect(() => {
    let isMounted = true

    async function checkBackend() {
      try {
        const data = await getBackendHealth()
        if (isMounted) {
          setStatus({ state: 'online', message: `${data.service || 'TrustBridge API'} is online.` })
        }
      } catch (error) {
        if (isMounted) {
          setStatus({ state: 'offline', message: error.message || 'Backend is not reachable. Demo fallback may show on some pages.' })
        }
      }
    }

    checkBackend()

    return () => {
      isMounted = false
    }
  }, [])

  const online = status.state === 'online'
  const Icon = online ? PlugZap : TriangleAlert

  return (
    <aside className={`backend-status-banner backend-status-${status.state} ${compact ? 'backend-status-compact' : ''}`}>
      <div className="backend-status-icon">
        <Icon size={18} />
      </div>
      <div>
        <strong>{label}</strong>
        <p>{status.message} API base: <span>{API_BASE_URL}</span></p>
      </div>
      <div className="backend-status-tags">
        <span><DatabaseZap size={14} /> {online ? 'API online' : 'Check API'}</span>
        <span><ShieldCheck size={14} /> JWT headers</span>
      </div>
    </aside>
  )
}

export default BackendStatusBanner
