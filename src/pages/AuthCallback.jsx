import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()
  const [debug, setDebug] = useState('')

  useEffect(() => {
    // Debug: Log the full URL
    console.log('Full URL:', window.location.href)
    console.log('Hash:', window.location.hash)
    console.log('Search:', window.location.search)
    
    // Try to get token from hash (format: #access_token=xxx)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    let accessToken = hashParams.get('access_token')
    let refreshToken = hashParams.get('refresh_token')
    
    // If not in hash, try query params (format: ?access_token=xxx)
    if (!accessToken) {
      const queryParams = new URLSearchParams(window.location.search)
      accessToken = queryParams.get('access_token')
      refreshToken = queryParams.get('refresh_token')
    }

    setDebug(`Token found: ${accessToken ? 'Yes' : 'No'}`)

    if (accessToken) {
      console.log('Token found, storing and redirecting...')
      localStorage.setItem('student_token', accessToken)
      if (refreshToken) {
        localStorage.setItem('student_refresh_token', refreshToken)
      }
      
      // Small delay to ensure storage completes
      setTimeout(() => {
        navigate('/student/dashboard')
      }, 500)
    } else {
      console.log('No token found, redirecting to login')
      setTimeout(() => {
        navigate('/student/login')
      }, 2000)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-white mb-2">Logging you in...</h2>
        <p className="text-gray-400">Please wait</p>
        <p className="text-gray-500 text-xs mt-4">{debug}</p>
      </div>
    </div>
  )
}

export default AuthCallback
