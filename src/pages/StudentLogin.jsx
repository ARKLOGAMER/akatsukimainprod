import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { api } from '../services/api'

function StudentLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugOtp, setDebugOtp] = useState('') // For showing OTP when email fails

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email')
      }

      const result = await api.sendStudentOTP(email)
      setStep('otp')
      if (result.debug_otp) {
        setDebugOtp(result.debug_otp)
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!otp || otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit code')
      }

      const result = await api.verifyStudentOTP(email, otp)
      
      localStorage.setItem('student_token', result.token)
      localStorage.setItem('student_email', result.student.email)
      
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <SEO 
        title="Student Login - AKATSUKI Series by Scify Tech | UKF College Portal"
        description="Access your AKATSUKI Series student dashboard by Scify Tech. Login to view your registered events, track your progress, and manage your profile. Exclusive for UKF College students and Kerala tech enthusiasts."
        keywords="student login, AKATSUKI dashboard, student portal, event registration, tech events, scify tech, ukfcet login, ukf college portal, kerala student events"
        url="/student/login"
        type="website"
      />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AKATSUKI<span className="text-akatsuki-red">.</span>
          </h1>
          <p className="text-gray-400">Student Portal</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Student Login</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email to access your dashboard
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-akatsuki-red focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send Login Code'}
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:border-akatsuki-red focus:outline-none font-mono"
                />
                <p className="text-gray-400 text-xs mt-2">
                  Code sent to {email}
                </p>
              </div>

              {debugOtp && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm font-semibold mb-2">
                    ⚠️ Email delivery issue - Your code:
                  </p>
                  <p className="text-yellow-300 text-2xl font-mono font-bold text-center tracking-widest">
                    {debugOtp}
                  </p>
                  <p className="text-yellow-400 text-xs mt-2 text-center">
                    (Email system will be configured soon)
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError('')
                }}
                className="w-full px-6 py-2 text-gray-400 hover:text-white transition-all"
              >
                ← Use different email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-400 hover:text-white text-sm">
              Back to Home
            </a>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs text-center">
              {step === 'email' 
                ? '🔐 Secure login with OTP - No password needed!' 
                : '📧 Check your email for the 6-digit code'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
