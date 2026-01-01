import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import CreateEventWizard from '../components/admin/CreateEventWizard'

function ModernAdminEventsList() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [token, setToken] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      navigate('/admin')
      return
    }
    setToken(adminToken)
    loadEvents(adminToken)
  }, [])

  const loadEvents = async (adminToken) => {
    const data = await api.getAllEventsAdmin(adminToken || token)
    setEvents(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: events.length,
    live: events.filter(e => e.status === 'LIVE').length,
    upcoming: events.filter(e => e.status === 'UPCOMING').length,
    closed: events.filter(e => e.status === 'CLOSED').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-xl border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-akatsuki-red rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-akatsuki-red/50">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AKATSUKI</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 bg-akatsuki-red text-white rounded-xl shadow-lg shadow-akatsuki-red/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Events</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-semibold">Analytics</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold">Students</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-akatsuki-red hover:bg-red-900/20 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Events Dashboard</h1>
          <p className="text-gray-400">Manage all your events in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-akatsuki-red/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-akatsuki-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-sm text-gray-400">Total Events</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.live}</p>
            <p className="text-sm text-gray-400">Live Events</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.upcoming}</p>
            <p className="text-sm text-gray-400">Upcoming</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.closed}</p>
            <p className="text-sm text-gray-400">Closed</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-akatsuki-red focus:border-akatsuki-red transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 bg-gray-900/50 border-2 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-akatsuki-red focus:border-akatsuki-red transition-all font-semibold"
            >
              <option value="all">All Status</option>
              <option value="LIVE">Live</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CLOSED">Closed</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-akatsuki-red hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-akatsuki-red/50 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/admin/events/${event.id}`)}
                className="bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800 hover:border-akatsuki-red/50 hover:shadow-2xl hover:shadow-akatsuki-red/20 transition-all cursor-pointer group"
              >
                {/* Poster */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.poster_url || 'https://via.placeholder.com/400x500'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      event.status === 'LIVE' ? 'bg-green-500 text-white' :
                      event.status === 'UPCOMING' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-akatsuki-red transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.seats} seats
                      </span>
                      <span className="text-akatsuki-red font-bold">₹{event.fee}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-gray-200">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first event to get started'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  + Create Your First Event
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventWizard
          token={token}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadEvents(token)
          }}
        />
      )}
    </div>
  )
}

export default ModernAdminEventsList
