import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function StudentsTab({ token }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await api.getAllStudents(token)
      setStudents(data)
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.college?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center text-white py-8">Loading students...</div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Student Directory</h2>
        <div className="text-sm text-gray-400">
          Total: {students.length} students
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or college..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-akatsuki-red focus:outline-none"
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Phone</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">College</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} className="border-b border-gray-800 hover:bg-white/5">
                <td className="py-3 px-4 text-white font-medium">{student.name}</td>
                <td className="py-3 px-4 text-gray-300">{student.email}</td>
                <td className="py-3 px-4 text-gray-300">{student.phone || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-300">{student.college || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {new Date(student.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'No students found matching your search.' : 'No students yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default StudentsTab
