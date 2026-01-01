import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function EventLandingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    college: '',
    department: '',
    reason: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [slug])

  const loadEvent = async () => {
    try {
      const data = await api.getEventBySlug(slug)
      if (!data) {
        navigate('/')
        return
      }
      setEvent(data)
    } catch (err) {
      console.error('Failed to load event:', err)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

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

    setSubmitting(true)

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
              
              alert('✅ Registration successful!')
              navigate('/')
            } else {
              throw new Error('Registration verification failed')
            }
          } catch (err) {
            console.error('Registration verification error:', err)
            setError('Registration verification failed. Please contact support.')
            setSubmitting(false)
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
            setSubmitting(false)
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
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!event) return null

  const currentPrice = api.getCurrentPrice(event)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Event Poster */}
          <div className="sticky top-8">
            <img
              src={event.poster_url}
              alt={event.title}
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold mb-6">Register for {event.title}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone (WhatsApp) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Age *</label>
                    <input
                      type="number"
                      name="age"
                      required
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">College *</label>
                    <input
                      type="text"
                      name="college"
                      required
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="Your College Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Department *</label>
                    <input
                      type="text"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Why do you want to join? *</label>
                  <textarea
                    name="reason"
                    required
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-akatsuki-red"
                    placeholder="Tell us why you're interested..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Promo Code Section */}
                {api.getCurrentPrice(event).amount > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-semibold mb-2">🎟️ Have a Promo Code?</label>
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
                  disabled={submitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition disabled:opacity-50"
                >
                  {submitting ? 'PROCESSING...' : calculateFinalPrice() > 0 ? `PAY ₹${calculateFinalPrice()} & REGISTER` : 'COMPLETE FREE REGISTRATION'}
                </button>
                
                <p className="text-gray-500 text-xs text-center">
                  🔒 Secure registration powered by Razorpay
                </p>
              </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventLandingPage
