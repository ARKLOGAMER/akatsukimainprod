import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function OverviewTab({ eventId, token }) {
  const [rsvps, setRsvps] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    topColleges: []
  })

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    try {
      const data = await api.getRSVPs(eventId, token)
      if (Array.isArray(data)) {
        setRsvps(data)
        calculateStats(data)
      } else {
        console.error('Invalid data format:', data)
        setRsvps([])
      }
    } catch (error) {
      console.error('Failed to load RSVPs:', error)
      setRsvps([])
    }
  }

  const calculateStats = (data) => {
    if (!Array.isArray(data)) return
    
    const today = new Date().toDateString()
    const todayCount = data.filter(r => new Date(r.created_at).toDateString() === today).length
    
    const collegeCount = {}
    data.forEach(r => {
      collegeCount[r.college] = (collegeCount[r.college] || 0) + 1
    })
    
    const topColleges = Object.entries(collegeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    setStats({
      total: data.length,
      today: todayCount,
      topColleges
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Enrolled</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Registrations Today</h3>
          <p className="text-4xl font-bold text-green-600">{stats.today}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Latest Registration</h3>
          <p className="text-sm text-gray-900">
            {rsvps[0] ? new Date(rsvps[0].created_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Top Colleges</h3>
        <div className="space-y-3">
          {stats.topColleges.map((college, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-700">{college.name}</span>
              <span className="font-semibold text-gray-900">{college.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Latest 10 RSVPs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-left py-2 px-4">College</th>
                <th className="text-left py-2 px-4">Registered</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(rsvps) && rsvps.slice(0, 10).map(rsvp => (
                <tr key={rsvp.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{rsvp.full_name}</td>
                  <td className="py-2 px-4">{rsvp.college}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {new Date(rsvp.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
