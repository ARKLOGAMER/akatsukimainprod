import { useState } from 'react'
import { api } from '../../services/api'

function CreateEventWizard({ token, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    poster_url: '',
    start_date: '',
    end_date: '',
    venue_or_link: '',
    seats: '50',
    status: 'LIVE',
    // Tiered pricing
    pre_early_bird_fee: '',
    pre_early_bird_deadline: '',
    early_bird_fee: '',
    early_bird_deadline: '',
    final_fee: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData({ ...formData, title: value, slug })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const imageUrl = await api.uploadImage(file)
      setPosterPreview(imageUrl)
      setFormData({ ...formData, poster_url: imageUrl })
    } catch (err) {
      // Fallback to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterPreview(reader.result)
        setFormData({ ...formData, poster_url: reader.result })
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      alert('Please fill in title and description')
      return
    }
    if (step === 2 && !formData.poster_url) {
      alert('Please upload a poster')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => setStep(step - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        ...formData,
        seats: parseInt(formData.seats) || 50,
        pre_early_bird_fee: parseInt(formData.pre_early_bird_fee) || 0,
        pre_early_bird_deadline: formData.pre_early_bird_deadline || null,
        early_bird_fee: parseInt(formData.early_bird_fee) || 0,
        early_bird_deadline: formData.early_bird_deadline || null,
        final_fee: parseInt(formData.final_fee) || 0,
        fee: parseInt(formData.final_fee) || 0 // Backward compatibility
      }
      await api.createEvent(eventData, token)
      onSuccess()
    } catch (err) {
      alert('Failed to create event: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Create Event</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new event</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl hover:bg-gray-100 w-12 h-12 rounded-full transition-all"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 pt-8">
          <div className="flex items-center justify-between mb-10">
            {[
              { num: 1, label: 'Basic Details' },
              { num: 2, label: 'Event Poster' },
              { num: 3, label: 'Pricing & Schedule' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step >= s.num 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-sm mt-3 font-semibold ${
                    step >= s.num ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1.5 mx-6 rounded-full transition-all ${
                    step > s.num ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Akatsuki Chapter 2: Rise of Builders"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  placeholder="auto-generated-from-title"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-2">
                  🔗 {window.location.origin}/event/{formData.slug || 'your-event-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  placeholder="Describe what participants will learn and build in this event..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Event Poster */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-4">
                  <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Event Poster</h3>
                <p className="text-sm text-gray-500">Recommended: 1080x1350px (4:5 ratio)</p>
              </div>

              {posterPreview ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={posterPreview} 
                    alt="Poster preview" 
                    className="w-64 aspect-[4/5] object-cover rounded-2xl border-4 border-orange-200 shadow-xl mb-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPosterPreview('')
                      setFormData({ ...formData, poster_url: '' })
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove & Upload New
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-orange-500 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label htmlFor="poster-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                  {uploading && (
                    <p className="text-sm text-orange-600 mt-4 font-semibold">Uploading...</p>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-semibold">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Paste Image URL</label>
                <input
                  type="url"
                  name="poster_url"
                  placeholder="https://example.com/poster.jpg"
                  value={formData.poster_url}
                  onChange={(e) => {
                    handleChange(e)
                    setPosterPreview(e.target.value)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Schedule */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Event Dates */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Event Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Venue / Link *</label>
                  <input
                    type="text"
                    name="venue_or_link"
                    required
                    placeholder="Online via Zoom / Physical Location"
                    value={formData.venue_or_link}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Seats *</label>
                  <input
                    type="number"
                    name="seats"
                    required
                    value={formData.seats}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Tiered Pricing */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">💰 Tiered Pricing</h3>
                <p className="text-sm text-gray-600 mb-4">Set up early bird discounts to encourage early registrations</p>
                
                {/* Pre-Early Bird */}
                <div className="bg-white rounded-xl p-4 mb-3 border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3">🎯 Pre-Early Bird (Optional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Fee (₹)</label>
                      <input
                        type="number"
                        name="pre_early_bird_fee"
                        placeholder="299"
                        value={formData.pre_early_bird_fee}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Deadline</label>
                      <input
                        type="datetime-local"
                        name="pre_early_bird_deadline"
                        value={formData.pre_early_bird_deadline}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Early Bird */}
                <div className="bg-white rounded-xl p-4 mb-3 border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3">🎯 Early Bird (Optional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Fee (₹)</label>
                      <input
                        type="number"
                        name="early_bird_fee"
                        placeholder="399"
                        value={formData.early_bird_fee}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Deadline</label>
                      <input
                        type="datetime-local"
                        name="early_bird_deadline"
                        value={formData.early_bird_deadline}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Rate */}
                <div className="bg-white rounded-xl p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-900 mb-3">🎯 Final Rate *</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fee (₹)</label>
                    <input
                      type="number"
                      name="final_fee"
                      required
                      placeholder="499"
                      value={formData.final_fee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Regular price (no deadline)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-500 hover:text-gray-700 font-semibold"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✓ Create Event'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CreateEventWizard
