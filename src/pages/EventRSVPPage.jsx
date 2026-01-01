import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import RSVPModal from '../components/RSVPModal'

function EventRSVPPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [showRSVP, setShowRSVP] = useState(false)
  const [enrolledCount, setEnrolledCount] = useState(0)

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    // Try to load by slug first, fallback to ID
    let data = await api.getEventBySlug(id)
    if (!data) {
      data = await api.getEvent(id)
    }
    setEvent(data)
    if (data) {
      loadEnrolledCount(data.id)
    }
  }

  const loadEnrolledCount = async (eventId) => {
    const count = await api.getRSVPCount(eventId || event?.id)
    setEnrolledCount(count)
  }

  const handleRSVPSuccess = () => {
    setShowRSVP(false)
    loadEnrolledCount(event.id)
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-akatsuki-dark to-akatsuki-red text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
          <p className="text-xl text-gray-200 mb-6">
            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
          </p>
          <div className="flex justify-center gap-8 text-lg">
            <div>
              <span className="font-semibold">{enrolledCount}</span> enrolled
            </div>
            <div>
              <span className="font-semibold">{event.seats}</span> seats
            </div>
            <div>
              <span className="font-semibold">₹{event.fee}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {event.poster_url && (
            <img
              src={event.poster_url}
              alt={event.title}
              className="w-full h-96 object-cover"
            />
          )}
          
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">About This Chapter</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{event.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Venue</h3>
                <p className="text-gray-600">{event.venue_or_link}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                  event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>

            {event.status !== 'CLOSED' && (
              <button
                onClick={() => setShowRSVP(true)}
                className="w-full bg-akatsuki-red text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-800 transition"
              >
                REGISTER NOW
              </button>
            )}

            {event.status === 'CLOSED' && (
              <div className="bg-gray-100 text-gray-600 py-4 rounded-lg text-center font-semibold">
                Registration Closed
              </div>
            )}
          </div>
        </div>
      </div>

      {showRSVP && (
        <RSVPModal
          event={event}
          onClose={() => setShowRSVP(false)}
          onSuccess={handleRSVPSuccess}
        />
      )}
    </div>
  )
}

export default EventRSVPPage
