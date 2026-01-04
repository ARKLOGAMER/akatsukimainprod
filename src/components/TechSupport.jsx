import { useState } from 'react'

function TechSupport({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('faq')
  const [supportRequest, setSupportRequest] = useState({
    name: '',
    email: '',
    issue: '',
    description: '',
    urgency: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const commonIssues = [
    {
      id: 1,
      question: "Can't join the online event",
      answer: "1. Check your internet connection\n2. Try refreshing the page\n3. Clear browser cache\n4. Try a different browser\n5. Contact support if issue persists",
      category: "connection"
    },
    {
      id: 2,
      question: "Audio/Video not working",
      answer: "1. Check browser permissions for camera/microphone\n2. Close other applications using camera/mic\n3. Try different browser\n4. Restart your device\n5. Use mobile app as backup",
      category: "media"
    },
    {
      id: 3,
      question: "Registration payment failed",
      answer: "1. Check your internet connection\n2. Verify card details\n3. Try different payment method\n4. Contact your bank\n5. Use UPI or net banking\n6. Contact support with transaction ID",
      category: "payment"
    },
    {
      id: 4,
      question: "Can't access event materials",
      answer: "1. Login to your student dashboard\n2. Go to 'My Events' tab\n3. Click on the event\n4. Materials will be available 1 hour before event\n5. Contact support if not visible",
      category: "materials"
    },
    {
      id: 5,
      question: "Certificate not received",
      answer: "1. Certificates are issued 24-48 hours after event\n2. Check your email (including spam folder)\n3. Login to dashboard and check 'Certificates' tab\n4. Ensure you attended the full event\n5. Contact support with event details",
      category: "certificate"
    },
    {
      id: 6,
      question: "Slow internet during event",
      answer: "1. Close unnecessary browser tabs\n2. Pause downloads/uploads\n3. Use ethernet instead of WiFi\n4. Lower video quality in settings\n5. Use mobile data as backup\n6. Download mobile app for better performance",
      category: "performance"
    }
  ]

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit support request
      const response = await fetch('/api/support/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...supportRequest,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })

      if (response.ok) {
        alert('✅ Support request submitted! We\'ll get back to you within 2 hours.')
        setSupportRequest({
          name: '',
          email: '',
          issue: '',
          description: '',
          urgency: 'medium'
        })
        setActiveSection('faq')
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      console.error('Support request failed:', error)
      alert('❌ Failed to submit request. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      // Create a simple screen sharing session
      const videoElement = document.createElement('video')
      videoElement.srcObject = stream
      videoElement.autoplay = true
      videoElement.style.width = '100%'
      videoElement.style.maxHeight = '400px'
      videoElement.style.borderRadius = '8px'
      
      const container = document.getElementById('screen-share-container')
      container.innerHTML = ''
      container.appendChild(videoElement)
      
      alert('✅ Screen sharing started! Our support team can now see your screen.')
      
      stream.getVideoTracks()[0].onended = () => {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Screen sharing ended</p>'
      }
    } catch (error) {
      console.error('Screen sharing failed:', error)
      alert('❌ Screen sharing not supported or permission denied')
    }
  }

  const runConnectivityTest = () => {
    const testResults = {
      internetSpeed: 'Testing...',
      browserCompatibility: 'Testing...',
      cameraAccess: 'Testing...',
      microphoneAccess: 'Testing...'
    }

    // Test internet speed (simplified)
    const startTime = Date.now()
    fetch('https://www.google.com/favicon.ico?' + Math.random())
      .then(() => {
        const duration = Date.now() - startTime
        testResults.internetSpeed = duration < 100 ? '✅ Fast' : duration < 300 ? '⚠️ Moderate' : '❌ Slow'
        updateTestResults(testResults)
      })
      .catch(() => {
        testResults.internetSpeed = '❌ Connection Failed'
        updateTestResults(testResults)
      })

    // Test browser compatibility
    testResults.browserCompatibility = navigator.mediaDevices ? '✅ Compatible' : '❌ Not Compatible'

    // Test camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        testResults.cameraAccess = '✅ Available'
        stream.getTracks().forEach(track => track.stop())
        updateTestResults(testResults)
      })
      .catch(() => {
        testResults.cameraAccess = '❌ Not Available'
        updateTestResults(testResults)
      })

    // Test microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        testResults.microphoneAccess = '✅ Available'
        stream.getTracks().forEach(track => track.stop())
        updateTestResults(testResults)
      })
      .catch(() => {
        testResults.microphoneAccess = '❌ Not Available'
        updateTestResults(testResults)
      })

    function updateTestResults(results) {
      const container = document.getElementById('test-results')
      container.innerHTML = `
        <div class="space-y-2">
          <div class="flex justify-between"><span>Internet Speed:</span><span>${results.internetSpeed}</span></div>
          <div class="flex justify-between"><span>Browser:</span><span>${results.browserCompatibility}</span></div>
          <div class="flex justify-between"><span>Camera:</span><span>${results.cameraAccess}</span></div>
          <div class="flex justify-between"><span>Microphone:</span><span>${results.microphoneAccess}</span></div>
        </div>
      `
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🛠️ Tech Support</h2>
              <p className="text-blue-100">We're here to help you with any technical issues</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'faq', label: '❓ FAQ', desc: 'Common Issues' },
            { id: 'tools', label: '🔧 Tools', desc: 'Diagnostic Tools' },
            { id: 'contact', label: '📞 Contact', desc: 'Get Help' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 p-4 text-left transition-colors ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="font-semibold">{tab.label}</div>
              <div className="text-sm opacity-75">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
              {commonIssues.map(issue => (
                <div key={issue.id} className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{issue.question}</h4>
                  <div className="text-gray-300 text-sm whitespace-pre-line">
                    {issue.answer}
                  </div>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    {issue.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tools Section */}
          {activeSection === 'tools' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Diagnostic Tools</h3>
              
              {/* Connectivity Test */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3">🌐 Connectivity Test</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Test your internet connection, browser compatibility, and device permissions.
                </p>
                <button
                  onClick={runConnectivityTest}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  Run Test
                </button>
                <div id="test-results" className="text-sm text-gray-300">
                  Click "Run Test" to check your system
                </div>
              </div>

              {/* Screen Share */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3">🖥️ Screen Sharing</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Share your screen with our support team for better assistance.
                </p>
                <button
                  onClick={startScreenShare}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-4"
                >
                  Start Screen Share
                </button>
                <div id="screen-share-container" className="mt-4">
                  <p className="text-gray-400 text-center py-8">Screen sharing not active</p>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3">💻 System Information</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div><strong>Browser:</strong> {navigator.userAgent.split(' ').pop()}</div>
                  <div><strong>Platform:</strong> {navigator.platform}</div>
                  <div><strong>Language:</strong> {navigator.language}</div>
                  <div><strong>Screen:</strong> {screen.width}x{screen.height}</div>
                  <div><strong>Connection:</strong> {navigator.onLine ? '✅ Online' : '❌ Offline'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Contact Support</h3>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={supportRequest.name}
                      onChange={(e) => setSupportRequest({...supportRequest, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={supportRequest.email}
                      onChange={(e) => setSupportRequest({...supportRequest, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Issue Type</label>
                  <select
                    value={supportRequest.issue}
                    onChange={(e) => setSupportRequest({...supportRequest, issue: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select an issue</option>
                    <option value="connection">Connection Problems</option>
                    <option value="audio-video">Audio/Video Issues</option>
                    <option value="payment">Payment Problems</option>
                    <option value="registration">Registration Issues</option>
                    <option value="materials">Event Materials</option>
                    <option value="certificate">Certificate Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Urgency</label>
                  <select
                    value={supportRequest.urgency}
                    onChange={(e) => setSupportRequest({...supportRequest, urgency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">🟢 Low - General question</option>
                    <option value="medium">🟡 Medium - Need help soon</option>
                    <option value="high">🔴 High - Event starting soon</option>
                    <option value="critical">🚨 Critical - Can't access event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={supportRequest.description}
                    onChange={(e) => setSupportRequest({...supportRequest, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '⏳ Submitting...' : '📤 Submit Support Request'}
                </button>
              </form>

              {/* Quick Contact Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-600 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-sm opacity-75">+91-XXXXXXXXXX</div>
                </div>
                <div className="bg-blue-600 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📧</div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm opacity-75">support@scify-tech.com</div>
                </div>
                <div className="bg-purple-600 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-semibold">Live Chat</div>
                  <div className="text-sm opacity-75">Available 9 AM - 9 PM</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TechSupport