import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function DoubtsTab({ token }) {
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDoubts()
  }, [])

  const loadDoubts = async () => {
    try {
      const data = await api.getAllDoubts(token)
      setDoubts(data)
    } catch (error) {
      console.error('Failed to load doubts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-white py-8">Loading doubts...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Student Doubts</h2>
      
      {doubts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <p className="text-gray-400 text-lg">No doubts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <div key={doubt.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">{doubt.topic}</h3>
              <p className="text-gray-300 mb-4">{doubt.message}</p>
              <div className="text-sm text-gray-400">
                <span>From: {doubt.student?.name} ({doubt.student?.email})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoubtsTab
