import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function PromoCodesTab({ eventId, token }) {
  const [promoCodes, setPromoCodes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    valid_until: ''
  })

  useEffect(() => {
    loadPromoCodes()
  }, [eventId])

  const loadPromoCodes = async () => {
    try {
      const data = await api.getPromoCodes(eventId, token)
      setPromoCodes(data || [])
    } catch (err) {
      console.error('Failed to load promo codes:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createPromoCode(eventId, formData, token)
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', valid_until: '' })
      setShowForm(false)
      loadPromoCodes()
      alert('✅ Promo code created!')
    } catch (err) {
      alert('❌ Failed to create promo code: ' + err.message)
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      await api.updatePromoCode(id, { is_active: !isActive }, token)
      loadPromoCodes()
    } catch (err) {
      alert('❌ Failed to update promo code')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">🎟️ Promo Codes</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-akatsuki-red hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            {showForm ? 'Cancel' : '+ Create Promo Code'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Type *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  required
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Max Uses (Optional)</label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Valid Until (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
            >
              Create Promo Code
            </button>
          </form>
        )}

        {/* Promo Codes List */}
        <div className="space-y-3">
          {promoCodes.map(promo => (
            <div key={promo.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-akatsuki-red">{promo.code}</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `₹${promo.discount_value} OFF`}
                  </span>
                  {!promo.is_active && (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">Inactive</span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Used: {promo.used_count} {promo.max_uses ? `/ ${promo.max_uses}` : ''}
                  {promo.valid_until && ` • Expires: ${new Date(promo.valid_until).toLocaleDateString()}`}
                </div>
              </div>
              <button
                onClick={() => toggleActive(promo.id, promo.is_active)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  promo.is_active
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {promo.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}

          {promoCodes.length === 0 && !showForm && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎟️</div>
              <p className="text-gray-400">No promo codes yet. Create one to offer discounts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromoCodesTab
