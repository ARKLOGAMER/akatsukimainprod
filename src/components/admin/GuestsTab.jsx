import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function GuestsTab({ eventId, token }) {
  const [rsvps, setRsvps] = useState([])
  const [filteredRsvps, setFilteredRsvps] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [event, setEvent] = useState(null)
  const [sendingEmail, setSendingEmail] = useState({})
  const [deleteLoading, setDeleteLoading] = useState({})
  const [selectedRsvps, setSelectedRsvps] = useState([])
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  useEffect(() => {
    loadRsvps()
    loadEvent()
  }, [eventId])

  useEffect(() => {
    filterRsvps()
  }, [rsvps, statusFilter, searchTerm])

  const loadRsvps = async () => {
    try {
      const data = await api.getRSVPs(eventId, token)
      // Ensure data is an array
      setRsvps(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load RSVPs:', error)
      setRsvps([])
    }
  }

  const loadEvent = async () => {
    try {
      const data = await api.getEvent(eventId)
      setEvent(data)
    } catch (error) {
      console.error('Failed to load event:', error)
    }
  }

  const resendConfirmationEmail = async (rsvp) => {
    if (!event) {
      alert('Event data not loaded')
      return
    }

    setSendingEmail({ ...sendingEmail, [rsvp.id]: true })

    try {
      await api.sendRSVPEmail({
        email: rsvp.email,
        name: rsvp.full_name,
        eventTitle: event.title,
        eventDate: new Date(event.start_date).toLocaleDateString(),
        eventVenue: event.venue_or_link
      })

      alert(`✅ Confirmation email sent to ${rsvp.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      alert(`❌ Failed to send email: ${error.message}`)
    } finally {
      setSendingEmail({ ...sendingEmail, [rsvp.id]: false })
    }
  }

  const handleDeleteRegistration = async (rsvpId, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}'s registration? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(prev => ({ ...prev, [rsvpId]: true }))
    
    try {
      const success = await api.deleteStudentRegistration(rsvpId, token)
      if (success) {
        setRsvps(prev => prev.filter(rsvp => rsvp.id !== rsvpId))
        alert('Registration deleted successfully')
      } else {
        alert('Failed to delete registration')
      }
    } catch (error) {
      console.error('Failed to delete registration:', error)
      alert('Failed to delete registration')
    } finally {
      setDeleteLoading(prev => ({ ...prev, [rsvpId]: false }))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRsvps.length === 0) {
      alert('Please select registrations to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedRsvps.length} selected registrations? This action cannot be undone.`)) {
      return
    }

    setBulkDeleteLoading(true)
    
    try {
      const deletePromises = selectedRsvps.map(rsvpId => 
        api.deleteStudentRegistration(rsvpId, token)
      )
      
      await Promise.all(deletePromises)
      
      setRsvps(prev => prev.filter(rsvp => !selectedRsvps.includes(rsvp.id)))
      setSelectedRsvps([])
      alert(`${selectedRsvps.length} registrations deleted successfully`)
    } catch (error) {
      console.error('Failed to delete registrations:', error)
      alert('Failed to delete some registrations')
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedRsvps.length === filteredRsvps.length) {
      setSelectedRsvps([])
    } else {
      setSelectedRsvps(filteredRsvps.map(rsvp => rsvp.id))
    }
  }

  const toggleSelectRsvp = (rsvpId) => {
    setSelectedRsvps(prev => 
      prev.includes(rsvpId) 
        ? prev.filter(id => id !== rsvpId)
        : [...prev, rsvpId]
    )
  }

  const filterRsvps = () => {
    // Ensure rsvps is an array before filtering
    let filtered = Array.isArray(rsvps) ? rsvps : []

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.full_name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.includes(term)
      )
    }

    setFilteredRsvps(filtered)
  }

  const updateStatus = async (id, status) => {
    await api.updateRSVPStatus(id, status, token)
    loadRsvps()
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'College', 'Department', 'Status', 'Registered']
    const rows = filteredRsvps.map(r => [
      r.full_name,
      r.email,
      r.phone,
      r.college,
      r.department,
      r.status,
      new Date(r.created_at).toLocaleString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${eventId}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status ({rsvps.length})</option>
            <option value="applied">Applied ({rsvps.filter(r => r.status === 'applied').length})</option>
            <option value="accepted">Accepted ({rsvps.filter(r => r.status === 'accepted').length})</option>
            <option value="rejected">Rejected ({rsvps.filter(r => r.status === 'rejected').length})</option>
            <option value="errored">⚠️ Errored ({rsvps.filter(r => r.status === 'errored').length})</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>

          {selectedRsvps.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting {selectedRsvps.length}...
                </>
              ) : (
                <>
                  🗑️ Delete Selected ({selectedRsvps.length})
                </>
              )}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedRsvps.length === filteredRsvps.length && filteredRsvps.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">College</th>
                <th className="text-left py-3 px-4">Department</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRsvps.map(rsvp => (
                <tr key={rsvp.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRsvps.includes(rsvp.id)}
                      onChange={() => toggleSelectRsvp(rsvp.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4">{rsvp.full_name}</td>
                  <td className="py-3 px-4">{rsvp.email}</td>
                  <td className="py-3 px-4">{rsvp.phone}</td>
                  <td className="py-3 px-4">{rsvp.college}</td>
                  <td className="py-3 px-4">{rsvp.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      rsvp.status === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                      rsvp.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      rsvp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      rsvp.status === 'errored' ? 'bg-orange-100 text-orange-800 border-2 border-orange-400' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rsvp.status === 'errored' ? '⚠️ ERRORED' : rsvp.status}
                    </span>
                    {rsvp.status === 'errored' && rsvp.notes && (
                      <div className="text-xs text-orange-600 mt-1 max-w-xs truncate" title={rsvp.notes}>
                        {rsvp.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {rsvp.status !== 'accepted' && (
                        <button
                          onClick={() => updateStatus(rsvp.id, 'accepted')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                          title="Accept"
                        >
                          ✓ Accept
                        </button>
                      )}
                      {rsvp.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(rsvp.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                          title="Reject"
                        >
                          ✗ Reject
                        </button>
                      )}
                      {rsvp.status !== 'applied' && (
                        <button
                          onClick={() => updateStatus(rsvp.id, 'applied')}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium"
                          title="Reset to Applied"
                        >
                          ↺ Reset
                        </button>
                      )}
                      <button
                        onClick={() => resendConfirmationEmail(rsvp)}
                        disabled={sendingEmail[rsvp.id]}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resend Confirmation Email"
                      >
                        {sendingEmail[rsvp.id] ? '⏳ Sending...' : '📧 Resend Email'}
                      </button>
                      <button
                        onClick={() => handleDeleteRegistration(rsvp.id, rsvp.full_name)}
                        disabled={deleteLoading[rsvp.id]}
                        className="px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        title="Delete Registration"
                      >
                        {deleteLoading[rsvp.id] ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            🗑️ Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRsvps.length === 0 && (
          <p className="text-center text-gray-500 py-8">No RSVPs found</p>
        )}
      </div>
    </div>
  )
}

export default GuestsTab
