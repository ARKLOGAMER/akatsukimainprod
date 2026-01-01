import { useState } from 'react'
import { api } from '../../services/api'

function ModernSettingsTab({ event, token, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    title: event.title,
    slug: event.slug || '',
    description: event.description,
    poster_url: event.poster_url,
    start_date: event.start_date,
    end_date: event.end_date,
    venue_or_link: event.venue_or_link,
    fee: event.fee,
    seats: event.seats,
    status: event.status,
    registration_enabled: event.registration_enabled !== false,
    is_listable: event.is_listable !== false,
    whatsapp_group_link: event.whatsapp_group_link || '',
    // Tiered pricing
    pre_early_bird_fee: event.pre_early_bird_fee || 0,
    pre_early_bird_deadline: event.pre_early_bird_deadline ? event.pre_early_bird_deadline.slice(0, 16) : '',
    early_bird_fee: event.early_bird_fee || 0,
    early_bird_deadline: event.early_bird_deadline ? event.early_bird_deadline.slice(0, 16) : '',
    final_fee: event.final_fee || event.fee || 0
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState(event.poster_url)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
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
      alert('✅ Image uploaded successfully!')
    } catch (err) {
      alert('❌ Failed to upload image: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const updates = {
      ...formData,
      fee: parseInt(formData.fee),
      seats: parseInt(formData.seats),
      pre_early_bird_fee: parseInt(formData.pre_early_bird_fee) || 0,
      pre_early_bird_deadline: formData.pre_early_bird_deadline || null,
      early_bird_fee: parseInt(formData.early_bird_fee) || 0,
      early_bird_deadline: formData.early_bird_deadline || null,
      final_fee: parseInt(formData.final_fee) || parseInt(formData.fee) || 0
    }
    
    await api.updateEvent(event.id, updates, token)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
    onUpdate()
  }

  const handleDelete = async () => {
    if (!confirm('⚠️ Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    
    try {
      await api.deleteEvent(event.id, token)
      onDelete()
    } catch (err) {
      alert('Failed to delete event')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your event details and configuration</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'basic', label: 'Basic Info', icon: '📝' },
            { id: 'pricing', label: 'Pricing', icon: '💰' },
            { id: 'advanced', label: 'Advanced', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Event Poster */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="relative group">
                    {posterPreview ? (
                      <img
                        src={posterPreview}
                        alt="Event poster"
                        className="w-32 h-40 object-cover rounded-2xl border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <label htmlFor="poster-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input
                      type="file"
                      id="poster-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {uploading && (
                    <p className="text-xs text-indigo-600 mt-2 font-semibold">Uploading...</p>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Custom URL (Slug)</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        // Auto-format slug
                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')
                        setFormData({ ...formData, slug })
                      }}
                      placeholder="akatsuki-chapter-1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      🔗 {window.location.origin}/event/<span className="font-semibold text-indigo-600">{formData.slug || event.id}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Venue / Link</label>
                <input
                  type="text"
                  name="venue_or_link"
                  value={formData.venue_or_link}
                  onChange={handleChange}
                  placeholder="Online via Zoom / Physical Location"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Seats</label>
                  <input
                    type="number"
                    name="seats"
                    value={formData.seats}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">💰 Tiered Pricing</h3>
                <p className="text-sm text-gray-600 mb-6">Set up early bird discounts to encourage early registrations</p>
                
                {/* Pre-Early Bird */}
                <div className="bg-white rounded-xl p-5 mb-4 border-2 border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">1</span>
                    Pre-Early Bird (Optional)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Fee (₹)</label>
                      <input
                        type="number"
                        name="pre_early_bird_fee"
                        placeholder="299"
                        value={formData.pre_early_bird_fee}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                      <input
                        type="datetime-local"
                        name="pre_early_bird_deadline"
                        value={formData.pre_early_bird_deadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Early Bird */}
                <div className="bg-white rounded-xl p-5 mb-4 border-2 border-green-200 shadow-sm">
                  <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">2</span>
                    Early Bird (Optional)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Fee (₹)</label>
                      <input
                        type="number"
                        name="early_bird_fee"
                        placeholder="399"
                        value={formData.early_bird_fee}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                      <input
                        type="datetime-local"
                        name="early_bird_deadline"
                        value={formData.early_bird_deadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Rate */}
                <div className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-sm">
                  <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm">3</span>
                    Final Rate (Required)
                  </h4>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fee (₹)</label>
                    <input
                      type="number"
                      name="final_fee"
                      placeholder="499"
                      value={formData.final_fee}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">Regular price (no deadline)</p>
                  </div>
                </div>

                {/* Current Price Preview */}
                {(() => {
                  const previewEvent = {
                    pre_early_bird_fee: parseInt(formData.pre_early_bird_fee) || 0,
                    pre_early_bird_deadline: formData.pre_early_bird_deadline,
                    early_bird_fee: parseInt(formData.early_bird_fee) || 0,
                    early_bird_deadline: formData.early_bird_deadline,
                    final_fee: parseInt(formData.final_fee) || 0,
                    fee: parseInt(formData.fee) || 0
                  }
                  const currentPrice = api.getCurrentPrice(previewEvent)
                  
                  return (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-5 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-700">Current Active Price</p>
                          <p className="text-xs text-gray-600 mt-1">This is what users see right now</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">₹{currentPrice.amount}</p>
                          <p className="text-sm text-gray-600 font-semibold">{currentPrice.tier}</p>
                          {currentPrice.deadline && (
                            <p className="text-xs text-yellow-700 mt-1">
                              Ends in {Math.ceil((currentPrice.deadline - new Date()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">Registration Enabled</p>
                      <p className="text-sm text-gray-500">Allow users to register for this event</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="registration_enabled"
                        checked={formData.registration_enabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">Show on Homepage</p>
                      <p className="text-sm text-gray-500">Display this event on the public homepage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_listable"
                        checked={formData.is_listable}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Group Link</label>
                    <input
                      type="url"
                      name="whatsapp_group_link"
                      value={formData.whatsapp_group_link}
                      onChange={handleChange}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">Once you delete an event, there is no going back. Please be certain.</p>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete Event
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
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

export default ModernSettingsTab
