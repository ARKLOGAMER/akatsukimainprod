import { useState } from 'react'
import { api } from '../services/api'

function RSVPModal({ event, onClose, onSuccess }) {
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

    // Validate form
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
              
              onSuccess()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (err) {
            console.error('Payment verification error:', err)
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 text-sm"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Register for {event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Pricing Tiers Display */}
          {(() => {
            const currentPrice = api.getCurrentPrice(event)
            const hasTieredPricing = event.pre_early_bird_fee || event.early_bird_fee
            
            if (currentPrice.amount > 0 && hasTieredPricing) {
              return (
                <div className="bg-gradient-to-r from-akatsuki-red/10 to-red-100 border-2 border-akatsuki-red/30 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3">💰 Pricing Tiers</h3>
                  <div className="space-y-2">
                    {event.pre_early_bird_fee > 0 && (
                      <div className={`flex justify-between items-center p-2 rounded ${currentPrice.tier === 'Pre-Early Bird' ? 'bg-green-100 border-2 border-green-500' : 'opacity-50'}`}>
                        <div>
                          <span className="font-semibold">Pre-Early Bird</span>
                          {event.pre_early_bird_deadline && (
                            <span className="text-xs text-gray-600 ml-2">
                              (Until {new Date(event.pre_early_bird_deadline).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-akatsuki-red">₹{event.pre_early_bird_fee}</span>
                      </div>
                    )}
                    {event.early_bird_fee > 0 && (
                      <div className={`flex justify-between items-center p-2 rounded ${currentPrice.tier === 'Early Bird' ? 'bg-green-100 border-2 border-green-500' : 'opacity-50'}`}>
                        <div>
                          <span className="font-semibold">Early Bird</span>
                          {event.early_bird_deadline && (
                            <span className="text-xs text-gray-600 ml-2">
                              (Until {new Date(event.early_bird_deadline).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-akatsuki-red">₹{event.early_bird_fee}</span>
                      </div>
                    )}
                    {event.final_fee > 0 && (
                      <div className={`flex justify-between items-center p-2 rounded ${currentPrice.tier === 'Final Rate' ? 'bg-green-100 border-2 border-green-500' : 'opacity-50'}`}>
                        <div>
                          <span className="font-semibold">Final Rate</span>
                        </div>
                        <span className="font-bold text-akatsuki-red">₹{event.final_fee}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-akatsuki-red/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Current Price:</span>
                      <span className="text-xl font-bold text-green-600">₹{currentPrice.amount} ({currentPrice.tier})</span>
                    </div>
                    {currentPrice.deadline && (
                      <p className="text-xs text-gray-600 mt-1 text-right">
                        ⏰ Offer ends in {Math.ceil((currentPrice.deadline - new Date()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    )}
                  </div>
                </div>
              )
            }
            return null
          })()}
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (WhatsApp) *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                placeholder="20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">College *</label>
              <input
                type="text"
                name="college"
                required
                value={formData.college}
                onChange={handleChange}
                placeholder="Your College Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want to join? *</label>
            <textarea
              name="reason"
              required
              rows="4"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Tell us why you're interested in this event..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-akatsuki-red focus:border-transparent transition resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Promo Code Section */}
          {api.getCurrentPrice(event).amount > 0 && (
            <div className="border-t border-gray-200 pt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🎟️ Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  disabled={appliedPromo}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {!appliedPromo ? (
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={applyingPromo || !promoCode.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
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
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
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
                  <p className="text-green-700 font-bold text-lg">
                    🎉 {appliedPromo.discount_type === 'percentage' 
                      ? `${appliedPromo.discount_value}% OFF` 
                      : `₹${appliedPromo.discount_value} OFF`} Applied!
                  </p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="line-through text-gray-500">₹{api.getCurrentPrice(event).amount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
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
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 shadow-lg"
          >
            {loading ? 'PROCESSING...' : calculateFinalPrice() > 0 ? `PAY ₹${calculateFinalPrice()} & REGISTER` : 'COMPLETE FREE REGISTRATION'}
          </button>
          
          <p className="text-gray-500 text-xs text-center">
            🔒 Secure registration powered by Razorpay
          </p>
        </form>
      </div>
    </div>
  )
}

export default RSVPModal
