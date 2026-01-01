import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function EnhancedStudentDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [student, setStudent] = useState(null)
  const [points, setPoints] = useState([])
  const [badges, setBadges] = useState([])
  const [allBadges, setAllBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [referralStats, setReferralStats] = useState([])
  const [bookmarkedEvents, setBookmarkedEvents] = useState([])
  const [eventHistory, setEventHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('student_token')
    if (!token) {
      navigate('/student/login')
      return
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const profile = await api.getStudentProfile(localStorage.getItem('student_token'))
      setStudent(profile)

      // Load points history
      const pointsData = await api.getStudentPoints(profile.id)
      setPoints(pointsData)

      // Load badges
      const badgesData = await api.getStudentBadges(profile.id)
      setBadges(badgesData)

      const allBadgesData = await api.getBadges()
      setAllBadges(allBadgesData)

      // Load leaderboard
      const leaderboardData = await api.getLeaderboard(10)
      setLeaderboard(leaderboardData)

      // Load referral stats
      const referralData = await api.getReferralStats(profile.id)
      setReferralStats(referralData)

      // Load bookmarked events
      const bookmarksData = await api.getBookmarkedEvents(profile.id)
      setBookmarkedEvents(bookmarksData)

      // Load event history (RSVPs)
      const historyData = await api.getStudentRSVPs(profile.id)
      setEventHistory(historyData)

      setLoading(false)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('student_token')
    navigate('/student/login')
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(student.referral_code)
    alert('✅ Referral code copied!')
  }

  const shareReferral = () => {
    const text = `Join AKATSUKI events with my referral code: ${student.referral_code} and get exclusive benefits!`
    const url = `${window.location.origin}?ref=${student.referral_code}`
    
    if (navigator.share) {
      navigator.share({ title: 'Join AKATSUKI', text, url })
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`)
      alert('✅ Referral link copied!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const myRank = leaderboard.findIndex(s => s.id === student?.id) + 1
  const earnedBadgeIds = badges.map(b => b.badge_id)
  const nextLevel = (student?.level || 1) + 1
  const pointsToNextLevel = (nextLevel * 100) - (student?.total_points || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-akatsuki-red to-red-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {student?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{student?.email}</h1>
                <p className="text-sm text-gray-400">Level {student?.level || 1} • {student?.total_points || 0} points</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold">{student?.total_points || 0}</div>
            <div className="text-sm text-blue-200">Total Points</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold">Level {student?.level || 1}</div>
            <div className="text-sm text-purple-200">{pointsToNextLevel} to next level</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
            <div className="text-3xl mb-2">🎖️</div>
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-sm text-green-200">Badges Earned</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold">{referralStats.filter(r => r.status === 'completed').length}</div>
            <div className="text-sm text-orange-200">Successful Referrals</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-gray-800 mb-8">
          <div className="flex border-b border-gray-800 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'events', label: 'My Events', icon: '🎫' },
              { id: 'badges', label: 'Achievements', icon: '🏅' },
              { id: 'referrals', label: 'Referrals', icon: '🤝' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'text-akatsuki-red border-b-2 border-akatsuki-red'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {points.slice(0, 5).map(point => (
                      <div key={point.id} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{point.reason}</p>
                          <p className="text-sm text-gray-400">{new Date(point.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-green-400 font-bold">+{point.points}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Progress to Next Level</h2>
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <div className="flex justify-between mb-2">
                      <span>Level {student?.level || 1}</span>
                      <span>Level {nextLevel}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-akatsuki-red to-orange-500 h-4 rounded-full transition-all"
                        style={{ width: `${((student?.total_points || 0) % 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{pointsToNextLevel} points to go!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                  <div className="grid gap-4">
                    {eventHistory.filter(e => new Date(e.events?.start_date) > new Date()).map(rsvp => (
                      <div key={rsvp.id} className="bg-gray-800/50 rounded-lg p-4 flex gap-4">
                        <img
                          src={rsvp.events?.poster_url}
                          alt={rsvp.events?.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{rsvp.events?.title}</h3>
                          <p className="text-sm text-gray-400">{new Date(rsvp.events?.start_date).toLocaleDateString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                            rsvp.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {rsvp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                  <div className="grid gap-4">
                    {eventHistory.filter(e => new Date(e.events?.start_date) <= new Date()).map(rsvp => (
                      <div key={rsvp.id} className="bg-gray-800/50 rounded-lg p-4 flex gap-4">
                        <img
                          src={rsvp.events?.poster_url}
                          alt={rsvp.events?.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{rsvp.events?.title}</h3>
                          <p className="text-sm text-gray-400">{new Date(rsvp.events?.start_date).toLocaleDateString()}</p>
                          {rsvp.certificate_url && (
                            <a
                              href={rsvp.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-akatsuki-red rounded-lg text-sm mt-2"
                            >
                              📜 View Certificate
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Bookmarked Events</h2>
                  <div className="grid gap-4">
                    {bookmarkedEvents.map(bookmark => (
                      <div key={bookmark.id} className="bg-gray-800/50 rounded-lg p-4 flex gap-4">
                        <img
                          src={bookmark.events?.poster_url}
                          alt={bookmark.events?.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{bookmark.events?.title}</h3>
                          <p className="text-sm text-gray-400">{new Date(bookmark.events?.start_date).toLocaleDateString()}</p>
                          <button
                            onClick={() => navigate(`/event/${bookmark.events?.slug || bookmark.events?.id}`)}
                            className="inline-block px-4 py-2 bg-blue-600 rounded-lg text-sm mt-2"
                          >
                            View Event
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allBadges.map(badge => {
                    const earned = earnedBadgeIds.includes(badge.id)
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-xl p-6 text-center transition ${
                          earned
                            ? 'bg-gradient-to-br from-yellow-600 to-orange-600'
                            : 'bg-gray-800/50 opacity-50'
                        }`}
                      >
                        <div className="text-5xl mb-3">{badge.icon}</div>
                        <h3 className="font-bold mb-1">{badge.name}</h3>
                        <p className="text-xs text-gray-300">{badge.description}</p>
                        {!earned && (
                          <p className="text-xs text-gray-400 mt-2">{badge.points_required} points required</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-mono font-bold text-center tracking-wider">{student?.referral_code}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={copyReferralCode}
                      className="flex-1 px-4 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={shareReferral}
                      className="flex-1 px-4 py-3 bg-purple-900 rounded-lg font-semibold hover:bg-purple-950 transition"
                    >
                      📤 Share
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Referral Stats</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{referralStats.length}</div>
                      <div className="text-sm text-gray-400">Total Referrals</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{referralStats.filter(r => r.status === 'completed').length}</div>
                      <div className="text-sm text-gray-400">Completed</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{referralStats.filter(r => r.status === 'pending').length}</div>
                      <div className="text-sm text-gray-400">Pending</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">Referral History</h3>
                  <div className="space-y-3">
                    {referralStats.map(ref => (
                      <div key={ref.id} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{ref.students?.email}</p>
                          <p className="text-sm text-gray-400">{new Date(ref.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                            ref.status === 'completed' ? 'bg-green-600' :
                            ref.status === 'rewarded' ? 'bg-purple-600' :
                            'bg-yellow-600'
                          }`}>
                            {ref.status}
                          </span>
                          {ref.reward_promo_code && (
                            <p className="text-xs text-gray-400 mt-1">Reward: {ref.reward_promo_code}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Top Students</h2>
                {myRank > 0 && (
                  <div className="bg-gradient-to-r from-akatsuki-red to-orange-600 rounded-lg p-4 mb-6">
                    <p className="text-center">
                      <span className="text-2xl font-bold">#{myRank}</span>
                      <span className="ml-2">Your Rank</span>
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {leaderboard.map((student, index) => (
                    <div
                      key={student.id}
                      className={`rounded-lg p-4 flex items-center gap-4 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                        'bg-gray-800/50'
                      }`}
                    >
                      <div className="text-3xl font-bold w-12 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{student.email}</p>
                        <p className="text-sm text-gray-300">Level {student.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{student.total_points}</p>
                        <p className="text-xs text-gray-300">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedStudentDashboard
