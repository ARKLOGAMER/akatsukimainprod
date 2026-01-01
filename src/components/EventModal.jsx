import { useState } from 'react'
import { api } from '../services/api'

function EventModal({ event, onClose, onRegister }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    college: '',
    department: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }
    
    setApplyingPromo(true)
    setPromoError('')
    
    try {
      const promo = await api.validatePromoCode(event.id, promoCode)
      if (!promo) {
        setPromoError('Invalid or expired promo code')
        setAppliedPromo(null)
        return
      }
      
      setAppliedPromo(promo)
      setPromoError('')
    } catch (err) {
      setPromoError('Failed to validate promo code')
      setAppliedPromo(null)
    } finally {
      setApplyingPromo(false)
    }
  }

  const calculateFinalPrice = () => {
    const currentPrice = api.getCurrentPrice(event)
    if (!appliedPromo) return currentPrice.amount
    
    let discount = 0
    if (appliedPromo.discount_type === 'percentage') {
      discount = currentPrice.amount * (appliedPromo.discount_value / 100)
    } else {
      discount = appliedPromo.discount_value
    }
    
    return Math.max(0, currentPrice.amount - discount)
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.full_name || !formData.email || !formData.phone) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const currentPrice = api.getCurrentPrice(event)
      const finalPrice = calculateFinalPrice()
      
      // ALWAYS USE PAYMENT GATEWAY - Even for ₹0 events
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Create Razorpay order (even for ₹0)
      const orderData = await api.createRazorpayOrder({
        amount: Math.max(finalPrice, 1), // Minimum ₹1 for Razorpay (will be handled as free)
        event_id: event.id,
        customer_details: {
          name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        },
        is_free_event: finalPrice === 0
      })

      // Razorpay payment options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AKATSUKI',
        description: finalPrice === 0 ? `${event.title} - Free Registration` : event.title,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment and create RSVP
            const verifyResult = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rsvp_data: {
                event_id: event.id,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                age: parseInt(formData.age),
                college: formData.college,
                department: formData.department,
                reason: formData.reason,
                promo_code_used: appliedPromo?.code || null,
                discount_amount: appliedPromo ? (currentPrice.amount - finalPrice) : 0,
                final_amount: finalPrice,
                payment_status: finalPrice === 0 ? 'free' : 'paid'
              },
              event_id: event.id,
              is_free_event: finalPrice === 0
            })

            if (verifyResult.success) {
              // Award points for registration
              if (verifyResult.rsvp?.student_id) {
                await api.awardPoints(verifyResult.rsvp.student_id, 50, 'Event registration', event.id)
              }

              // Send confirmation email
              try {
                await api.sendRSVPEmail({
                  email: formData.email,
                  eventTitle: event.title,
                  eventDate: new Date(event.start_date).toLocaleDateString(),
                  eventTime: event.start_time || 'TBA',
                  eventVenue: event.venue_or_link || 'TBA'
                })
              } catch (emailErr) {
                console.error('Email send failed:', emailErr)
              }
              
              setSuccess(true)
              setTimeout(() => {
                onClose()
                onRegister()
              }, 2000)
            } else {
              throw new Error('Registration verification failed')
            }
          } catch (err) {
            console.error('Registration verification error:', err)
            setError('Registration verification failed. Please contact support.')
            setLoading(false)
          }
        },
        prefill: {
          name: formData.full_name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#DC2626'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            setError('Registration cancelled')
          }
        },
        notes: {
          event_id: event.id,
          is_free: finalPrice === 0 ? 'true' : 'false'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to process registration')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-10 text-gray-400 hover:text-gray-900 transition bg-white rounded-full p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Poster - 4:5 ratio */}
          <div className="md:w-2/5 bg-black flex-shrink-0">
            <img
              src={event.poster_url || 'https://via.placeholder.com/1080x1350'}
              alt={event.title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          {/* Right: Details or Form */}
          <div className="md:w-3/5 p-6 md:p-12 overflow-y-auto flex-1">
            {!showForm ? (
              /* Event Details */
              <>
                <h1 className="text-3xl md:text-4xl font-light mb-6 text-gray-900 leading-tight pr-12">
                  {event.title}
                </h1>

                <div className="prose prose-lg mb-8">
                  <p className="text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 w-24">Date:</span>
                    <span className="text-gray-600">
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 w-24">Venue:</span>
                    <span className="text-gray-600">{event.venue_or_link}</span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 w-24">Fee:</span>
                    <span className="text-gray-600">₹{api.getCurrentPrice(event).amount} ({api.getCurrentPrice(event).tier})</span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 w-24">Seats:</span>
                    <span className="text-gray-600">{event.seats} available</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {event.status !== 'CLOSED' && event.registration_enabled !== false ? (
                    <>
                      <button
                        onClick={onClose}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-gray-400 transition"
                      >
                        CLOSE
                      </button>
                      <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition shadow-lg"
                      >
                        REGISTER NOW
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full px-8 py-3 bg-gray-300 text-gray-600 rounded-full font-semibold cursor-not-allowed"
                      disabled
                    >
                      {event.status === 'CLOSED' ? 'REGISTRATION CLOSED' : 'REGISTRATION DISABLED'}
                    </button>
                  )}
                </div>
              </>
            ) : success ? (
              /* Success Message */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Registration Successful!</h2>
                <p className="text-gray-600">Check your email for confirmation.</p>
              </div>
            ) : (
              /* Registration Form */
              <>
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-900 mr-4"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Register for {event.title}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="Full Name *"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Phone (WhatsApp) *"
                      value={formData.phone}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <input
                      type="number"
                      name="age"
                      required
                      placeholder="Age *"
                      value={formData.age}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <input
                      type="text"
                      name="college"
                      required
                      placeholder="College *"
                      value={formData.college}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <input
                      type="text"
                      name="department"
                      required
                      placeholder="Department *"
                      value={formData.department}
                      onChange={handleChange}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <textarea
                    name="reason"
                    required
                    rows="3"
                    placeholder="Why do you want to join? *"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Promo Code Section */}
                  {api.getCurrentPrice(event).amount > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🎟️ Have a Promo Code?</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="SAVE20"
                          disabled={appliedPromo}
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        {!appliedPromo ? (
                          <button
                            type="button"
                            onClick={applyPromoCode}
                            disabled={applyingPromo || !promoCode.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                          >
                            {applyingPromo ? 'Checking...' : 'Apply'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedPromo(null)
                              setPromoCode('')
                            }}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {promoError && (
                        <p className="text-red-600 text-sm mt-2">❌ {promoError}</p>
                      )}
                      
                      {appliedPromo && (
                        <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                          <p className="text-green-700 font-bold">
                            🎉 {appliedPromo.discount_type === 'percentage' 
                              ? `${appliedPromo.discount_value}% OFF` 
                              : `₹${appliedPromo.discount_value} OFF`} Applied!
                          </p>
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="line-through text-gray-500">₹{api.getCurrentPrice(event).amount}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-900">Final Price:</span>
                            <span className="text-green-600">₹{calculateFinalPrice()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-4 rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50 shadow-lg"
                  >
                    {loading ? 'PROCESSING...' : calculateFinalPrice() > 0 ? `PAY ₹${calculateFinalPrice()} & REGISTER` : 'COMPLETE FREE REGISTRATION'}
                  </button>
                  
                  <p className="text-gray-500 text-xs text-center">
                    🔒 Secure registration powered by Razorpay
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
