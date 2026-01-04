import { useState } from 'react'
import SEO from '../components/SEO'
import TechSupport from '../components/TechSupport'

function TestPage() {
  const [showTechSupport, setShowTechSupport] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <SEO 
        title="Test Page - AKATSUKI Series"
        description="Testing the enhanced features of AKATSUKI platform"
        keywords="test, akatsuki, scify tech, features"
        url="/test"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">🚀 AKATSUKI Features Test</h1>
          <p className="text-xl text-gray-300 mb-12">Testing all the new enhancements</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Feature Cards */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Enhanced Dashboard</h3>
              <p className="text-blue-200 text-sm">10 comprehensive tabs with certificates, networking, and skill tracking</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">Tech Support</h3>
              <p className="text-green-200 text-sm">One-click help with screen sharing and diagnostics</p>
              <button
                onClick={() => setShowTechSupport(true)}
                className="mt-4 bg-white text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition-colors"
              >
                Test Support
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Smart Registration</h3>
              <p className="text-purple-200 text-sm">Multi-step flow with skill assessment and timezone conversion</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">📜</div>
              <h3 className="text-xl font-bold mb-2">Certificates</h3>
              <p className="text-yellow-200 text-sm">PDF download functionality with professional branding</p>
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Networking</h3>
              <p className="text-pink-200 text-sm">Track connections made at events and build your network</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Skill Progress</h3>
              <p className="text-indigo-200 text-sm">Visual progress tracking with achievements and milestones</p>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">✅ Console Fixes Applied</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">✅ React Router Warnings</h3>
                <p className="text-sm text-gray-300">Added v7 future flags</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">✅ PWA Meta Tags</h3>
                <p className="text-sm text-gray-300">Updated to modern standards</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">✅ Icon Errors</h3>
                <p className="text-sm text-gray-300">Removed invalid icon references</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">✅ API Error Handling</h3>
                <p className="text-sm text-gray-300">Graceful fallbacks for missing features</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a 
              href="/"
              className="inline-block bg-akatsuki-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Tech Support Modal */}
      <TechSupport 
        isOpen={showTechSupport}
        onClose={() => setShowTechSupport(false)}
      />
    </div>
  )
}

export default TestPage