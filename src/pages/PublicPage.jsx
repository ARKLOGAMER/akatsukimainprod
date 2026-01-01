import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Testimonials from '../components/Testimonials'
import EventList from '../components/EventList'
import EventModal from '../components/EventModal'
import Footer from '../components/Footer'
import { api } from '../services/api'

function PublicPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [totalEnrolled, setTotalEnrolled] = useState(0)

  useEffect(() => {
    // Check if there's an auth token in the URL (from magic link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (accessToken) {
      // Store token and redirect to student dashboard
      localStorage.setItem('student_token', accessToken)
      window.location.href = '/student/dashboard'
      return
    }
    
    loadEvents()
    loadTotalEnrolled()
  }, [])

  const loadEvents = async () => {
    const data = await api.getEvents()
    setEvents(data)
  }

  const loadTotalEnrolled = async () => {
    // Get total count across all events (pass null for all events)
    const count = await api.getRSVPCount(null)
    setTotalEnrolled(count)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleRSVPSuccess = () => {
    setSelectedEvent(null)
    loadTotalEnrolled()
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div id="hero">
        <Hero totalEnrolled={totalEnrolled} />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="events">
        <EventList events={events} onEventClick={handleEventClick} />
      </div>
      <Testimonials />
      <Footer />
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRSVPSuccess}
        />
      )}
    </div>
  )
}

export default PublicPage
