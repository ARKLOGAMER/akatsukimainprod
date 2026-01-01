import { useState, useEffect } from 'react'
import { api } from '../services/api'

function Leaderboard({ limit = 10, showTitle = true }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard(limit)
      setLeaderboard(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
      {showTitle && (
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span>🏆</span>
          Top Students
        </h2>
      )}
      
      <div className="space-y-3">
        {leaderboard.map((student, index) => (
          <div
            key={student.id}
            className={`rounded-xl p-4 flex items-center gap-4 transition hover:scale-105 ${
              index === 0 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg shadow-yellow-600/50' :
              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50' :
              index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg shadow-orange-600/50' :
              'bg-gray-800/50 hover:bg-gray-800'
            }`}
          >
            <div className="text-3xl font-bold w-12 text-center">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{student.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-300">Level {student.level}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{student.total_points}</p>
              <p className="text-xs text-gray-300">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard
