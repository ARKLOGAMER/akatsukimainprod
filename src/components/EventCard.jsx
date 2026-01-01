import { useState, useEffect } from 'react'
import { api } from '../services/api'

function EventCard({ event, onClick }) {
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(null)

  useEffect(() => {
    loadEnrolledCount()
    // Get current active price tier
    const priceInfo = api.getCurrentPrice(event)
    setCurrentPrice(priceInfo)
  }, [event.id])

  const loadEnrolledCount = async () => {
    const count = await api.getRSVPCount(event.id)
    setEnrolledCount(count)
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-black cursor-pointer transition-all transform active:scale-95 md:hover:scale-105"
    >
      {/* Event Poster - 4:5 ratio (Instagram Post) */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img
          src={event.poster_url || 'https://via.placeholder.com/1080x1350'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>
      
      {/* Bottom Info Section */}
      <div className="bg-black pt-3 md:pt-4 pb-2">
        <div className="flex items-center justify-between text-xs mb-2 md:mb-3">
          <span className="text-akatsuki-red font-mono tracking-wider">
            {new Date(event.start_date).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
          <span className={`uppercase tracking-wider font-bold text-xs ${
            event.status === 'LIVE' ? 'text-akatsuki-red' :
            event.status === 'UPCOMING' ? 'text-blue-400' :
            'text-gray-500'
          }`}>
            {event.status === 'LIVE' ? 'OPEN NOW' : event.status}
          </span>
        </div>
        
        <h3 className="text-white text-lg md:text-xl font-light leading-tight group-hover:text-akatsuki-red transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        {/* Price Tier Badge */}
        {currentPrice && currentPrice.amount > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-akatsuki-red text-xl font-bold">₹{currentPrice.amount}</div>
              <div className="text-xs text-gray-400">{currentPrice.tier}</div>
            </div>
            {currentPrice.deadline && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Ends in</div>
                <div className="text-xs text-yellow-400 font-semibold">
                  {Math.ceil((currentPrice.deadline - new Date()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            )}
          </div>
        )}
        {currentPrice && currentPrice.amount === 0 && (
          <div className="mt-3">
            <span className="text-green-400 text-lg font-bold">FREE</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
