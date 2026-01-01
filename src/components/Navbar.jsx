import { useState } from 'react'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">
              AKATSUKI<span className="text-akatsuki-red">.</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('events')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Events
            </button>
            <a
              href="/student/login"
              className="px-4 py-2 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              Student Portal
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('events')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
            >
              Events
            </button>
            <a
              href="/student/login"
              className="block px-3 py-2 text-white bg-akatsuki-red hover:bg-red-700 rounded-md font-semibold"
            >
              Student Portal
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
