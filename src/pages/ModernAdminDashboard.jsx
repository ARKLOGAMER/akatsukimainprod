import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import OverviewTab from '../components/admin/OverviewTab'
import GuestsTab from '../components/admin/GuestsTab'
import StudentsTab from '../components/admin/StudentsTab'
import CertificatesTab from '../components/admin/CertificatesTab'
import FormBuilderTab from '../components/admin/FormBuilderTab'
import ModernSettingsTab from '../components/admin/ModernSettingsTab'
import PromoCodesTab from '../components/admin/PromoCodesTab'
import AnalyticsTab from '../components/admin/AnalyticsTab'

function ModernAdminDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [token, setToken] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      navigate('/admin')
      return
    }
    setToken(adminToken)
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    const data = await api.getEvent(id)
    setEvent(data)
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'guests', icon: '👥', label: 'Guests' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'certificates', icon: '📜', label: 'Certificates' },
    { id: 'promo-codes', icon: '🎟️', label: 'Promo Codes' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'form', icon: '📝', label: 'Form Builder' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black/40 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-akatsuki-red rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-akatsuki-red/50">
              A
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">AKATSUKI</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => navigate('/admin/events')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-900 rounded-xl transition-all group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {sidebarOpen && <span className="font-semibold">Back to Events</span>}
          </button>

          <div className="pt-4 pb-2">
            {sidebarOpen && <p className="px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Event Menu</p>}
          </div>

          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-akatsuki-red text-white shadow-lg shadow-akatsuki-red/50'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span className="font-semibold">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {sidebarOpen && <span className="font-semibold">Collapse</span>}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('admin_token')
              navigate('/admin')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-akatsuki-red hover:bg-red-900/20 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={event.poster_url || 'https://via.placeholder.com/80'}
                  alt={event.title}
                  className="w-16 h-20 object-cover rounded-xl border-2 border-gray-700 shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{event.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      event.status === 'LIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                      event.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      📅 {new Date(event.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug || event.id}`)
                  alert('✅ Event link copied!')
                }}
                className="px-6 py-3 bg-akatsuki-red hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-akatsuki-red/50 transition-all"
              >
                📋 Copy Event Link
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab eventId={id} token={token} />}
          {activeTab === 'guests' && <GuestsTab eventId={id} token={token} />}
          {activeTab === 'students' && <StudentsTab token={token} />}
          {activeTab === 'certificates' && <CertificatesTab eventId={id} token={token} />}
          {activeTab === 'promo-codes' && <PromoCodesTab eventId={id} token={token} />}
          {activeTab === 'analytics' && <AnalyticsTab eventId={id} token={token} />}
          {activeTab === 'form' && <FormBuilderTab eventId={id} token={token} />}
          {activeTab === 'settings' && (
            <ModernSettingsTab 
              event={event} 
              token={token} 
              onUpdate={loadEvent}
              onDelete={() => navigate('/admin/events')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default ModernAdminDashboard
