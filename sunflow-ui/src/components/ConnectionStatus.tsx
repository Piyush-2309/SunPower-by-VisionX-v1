import { useState, useCallback } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { checkHealth } from '../services/api'

type ConnectionState = 'idle' | 'checking' | 'connected' | 'unavailable'

export default function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('idle')
  const [appName, setAppName] = useState<string | null>(null)

  const handleCheck = useCallback(async () => {
    setState('checking')
    setAppName(null)
    try {
      const data = await checkHealth()
      if (data.status === 'UP') {
        setState('connected')
        setAppName(data.application)
      } else {
        setState('unavailable')
      }
    } catch {
      setState('unavailable')
    }
  }, [])

  const indicatorClass =
    state === 'checking'
      ? 'checking'
      : state === 'connected'
        ? 'connected'
        : state === 'unavailable'
          ? 'unavailable'
          : ''

  const statusLabel =
    state === 'checking'
      ? 'Checking connection…'
      : state === 'connected'
        ? `Connected to ${appName ?? 'backend'}`
        : state === 'unavailable'
          ? 'Backend unavailable'
          : 'Backend connection not checked'

  const StatusIcon =
    state === 'connected' ? Wifi : state === 'unavailable' ? WifiOff : null

  return (
    <div className="connection-card">
      <div className="connection-info">
        {state !== 'idle' && (
          <div className={`connection-indicator ${indicatorClass}`} />
        )}
        <div>
          <div className="connection-label">
            {StatusIcon && <StatusIcon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />}
            {statusLabel}
          </div>
          {state === 'connected' && (
            <div className="connection-sublabel">API responding on /api/health</div>
          )}
          {state === 'unavailable' && (
            <div className="connection-sublabel">
              Ensure the Spring Boot server is running on port 8080
            </div>
          )}
        </div>
      </div>
      <button
        className="connection-btn"
        onClick={handleCheck}
        disabled={state === 'checking'}
        id="check-connection-btn"
      >
        <RefreshCw size={14} className={state === 'checking' ? 'spin' : ''} />
        {state === 'idle' ? 'Check Connection' : 'Retry'}
      </button>
    </div>
  )
}
