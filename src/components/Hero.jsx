function Hero({ totalEnrolled }) {
  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative bg-black pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="inline-block px-4 py-2 bg-akatsuki-red/20 text-akatsuki-red rounded-full text-sm font-semibold mb-6">
                🔥 Building the Future, One Sprint at a Time
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
              Build your
              <span className="block text-akatsuki-red">dream project</span>
              in 7 days.
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
              Unlock success with our handpicked community of innovators. 
              Join now for unparalleled execution sprints.
            </p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToEvents}
                className="group bg-akatsuki-red text-white px-8 py-4 rounded-full font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
              >
                Join Next Chapter
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-gray-800"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-800"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-gray-800"></div>
                <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white">
                  +{totalEnrolled}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bento Grid */}
          <div className="grid grid-cols-2 gap-4 animate-scale-in">
            {/* Card 1 - Featured */}
            <div className="col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 relative overflow-hidden border border-gray-700">
              <div className="absolute top-4 right-4 w-32 h-32 bg-akatsuki-red/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gray-700 rounded-2xl mb-4 flex items-center justify-center text-4xl">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">7-Day Sprints</h3>
                <p className="text-gray-300">Ship your MVP in one week with focused execution</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-3xl p-6 border border-green-700/30">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-white mb-2">Fast Launch</h3>
              <p className="text-sm text-gray-300">From idea to production in days</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-3xl p-6 border border-purple-700/30">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-bold text-white mb-2">Community</h3>
              <p className="text-sm text-gray-300">{totalEnrolled}+ innovators building together</p>
            </div>

            {/* Card 4 */}
            <div className="col-span-2 bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-3xl p-6 border border-orange-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1">No Hassle</h3>
                  <p className="text-sm text-gray-300">Focus on building, we handle the rest</p>
                </div>
                <div className="text-5xl">✨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Trusted By */}
       {/* <div className="mt-20 text-center">
          <p className="text-sm text-gray-400 mb-6">Trusted by innovators from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <span className="text-2xl font-bold text-gray-500">IEDC</span>
            <span className="text-2xl font-bold text-gray-500">TinkerHub</span>
            <span className="text-2xl font-bold text-gray-500">KSUM</span>
            <span className="text-2xl font-bold text-gray-500">Startup Mission</span>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Hero
