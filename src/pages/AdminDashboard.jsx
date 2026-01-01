import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import OverviewTab from '../components/admin/OverviewTab'
import GuestsTab from '../components/admin/GuestsTab'
import StudentsTab from '../components/admin/StudentsTab'
import CertificatesTab from '../components/admin/CertificatesTab'
import PromoCodesTab from '../components/admin/PromoCodesTab'
// import DoubtsTab from '../components/admin/DoubtsTab'
import FormBuilderTab from '../components/admin/FormBuilderTab'
import ModernSettingsTab from '../components/admin/ModernSettingsTab'

function AdminDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [token, setToken] = useState('')

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Modern Header with Glassmorphism */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/admin/events')}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-105"
              title="Back to Events"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Event Poster with Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-akatsuki-red/20 blur-xl group-hover:bg-akatsuki-red/30 transition-all"></div>
              <img
                src={event.poster_url || 'https://via.placeholder.com/100'}
                alt={event.title}
                className="relative w-16 h-20 object-cover rounded-lg border-2 border-gray-700 group-hover:border-akatsuki-red transition-all"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === 'LIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  event.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {event.status}
                </span>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug || event.id}`)
                alert('✅ RSVP link copied!')
              }}
              className="px-4 py-2 bg-akatsuki-red/20 hover:bg-akatsuki-red/30 text-akatsuki-red border border-akatsuki-red/30 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            >
              📋 Copy Link
            </button>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('admin_token')
                navigate('/admin')
              }}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Modern Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-8 bg-black/40 backdrop-blur-xl p-2 rounded-xl border border-gray-700/50 overflow-x-auto">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'guests', icon: '👥', label: 'Guests' },
            { id: 'students', icon: '🎓', label: 'Students' },
            { id: 'certificates', icon: '📜', label: 'Certificates' },
            { id: 'promos', icon: '🎟️', label: 'Promo Codes' },
            { id: 'doubts', icon: '❓', label: 'Doubts' },
            { id: 'form', icon: '📝', label: 'Form' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-akatsuki-red text-white shadow-lg shadow-akatsuki-red/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab eventId={id} token={token} />}
        {activeTab === 'guests' && <GuestsTab eventId={id} token={token} />}
        {activeTab === 'students' && <StudentsTab token={token} />}
        {activeTab === 'certificates' && <CertificatesTab eventId={id} token={token} />}
        {activeTab === 'promos' && <PromoCodesTab eventId={id} token={token} />}
        {activeTab === 'doubts' && <div className="text-white text-center py-8">Doubts tab coming soon...</div>}
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
    </div>
  )
}

export default AdminDashboard
