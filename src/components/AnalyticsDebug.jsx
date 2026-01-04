import { useEffect, useState } from 'react'

function AnalyticsDebug() {
  const [analyticsStatus, setAnalyticsStatus] = useState('checking')
  const [measurementId, setMeasurementId] = useState('')

  useEffect(() => {
    // Check if Google Analytics is loaded
    const checkAnalytics = () => {
      if (typeof window !== 'undefined') {
        if (window.gtag && window.dataLayer) {
          setAnalyticsStatus('loaded')
          // Try to extract measurement ID from dataLayer
          const config = window.dataLayer.find(item => 
            Array.isArray(item) && item[0] === 'config'
          )
          if (config && config[1]) {
            setMeasurementId(config[1])
          }
        } else {
          setAnalyticsStatus('not-loaded')
        }
      }
    }

    // Check immediately and after a delay
    checkAnalytics()
    const timer = setTimeout(checkAnalytics, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: analyticsStatus === 'loaded' ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div>
        <strong>📊 Analytics Status:</strong> {analyticsStatus}
      </div>
      {measurementId && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          <strong>ID:</strong> {measurementId}
        </div>
      )}
      {analyticsStatus === 'not-loaded' && (
        <div style={{ marginTop: '4px', fontSize: '12px' }}>
          ⚠️ Check your Measurement ID
        </div>
      )}
    </div>
  )
}

export default AnalyticsDebug