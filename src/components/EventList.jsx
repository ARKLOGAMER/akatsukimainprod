import { useState, useRef } from 'react'
import EventCard from './EventCard'

function EventList({ events, onEventClick }) {
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, status
  const [filterStatus, setFilterStatus] = useState('all') // all, LIVE, UPCOMING, CLOSED
  const scrollContainerRef = useRef(null)

  // Filter events
  let filteredEvents = filterStatus === 'all' 
    ? events 
    : events.filter(event => event.status === filterStatus)

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date)
      case 'oldest':
        return new Date(a.created_at || a.start_date) - new Date(b.created_at || b.start_date)
      case 'status':
        const statusOrder = { LIVE: 0, UPCOMING: 1, CLOSED: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      default:
        return 0
    }
  })

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340 // card width (320) + gap (20)
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div id="events" className="py-12 md:py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="mb-6">
            <h2 className="text-3xl md:text-5xl font-black mb-3 md:mb-4 text-white">
              ALL <span className="text-akatsuki-red">CHAPTERS</span>
            </h2>
            <div className="w-20 md:w-24 h-1 bg-akatsuki-red rounded-full"></div>
            <p className="text-gray-400 mt-4 text-sm md:text-base">
              Showing {sortedEvents.length} of {events.length} events
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {[
              { value: 'all', label: 'All', count: events.length },
              { value: 'LIVE', label: 'Live', count: events.filter(e => e.status === 'LIVE').length },
              { value: 'UPCOMING', label: 'Upcoming', count: events.filter(e => e.status === 'UPCOMING').length },
              { value: 'CLOSED', label: 'Closed', count: events.filter(e => e.status === 'CLOSED').length }
            ].map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition whitespace-nowrap flex-shrink-0 ${
                  filterStatus === value
                    ? 'bg-akatsuki-red text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {sortedEvents.length > 0 ? (
          <div className="relative">
            {/* Desktop Arrow Buttons - Hidden on mobile */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-akatsuki-red/90 hover:bg-akatsuki-red text-white p-3 md:p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-6"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => scroll('right')}
              className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-akatsuki-red/90 hover:bg-akatsuki-red text-white p-3 md:p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-6"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Carousel Container - Touch-friendly */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
              }}
            >
              <div className="flex gap-4 md:gap-6 pb-4">
                {sortedEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex-shrink-0 w-72 md:w-80"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <EventCard
                      event={event}
                      onClick={() => onEventClick(event)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint - Different text for mobile */}
            <div className="text-center mt-4 md:mt-6">
              <p className="text-gray-500 text-xs md:text-sm">
                <span className="md:hidden">← Swipe to see more →</span>
                <span className="hidden md:inline">Use arrows or scroll to see more events</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-base md:text-lg py-8 md:py-12">
            {filterStatus === 'all' ? 'No events yet' : `No ${filterStatus.toLowerCase()} events`}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventList
