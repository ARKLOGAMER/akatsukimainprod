import { useState, useEffect } from 'react'
import { api } from '../../services/api'

function AnalyticsTab({ eventId, token }) {
  const [dateRange, setDateRange] = useState('month')
  const [analytics, setAnalytics] = useState(null)
  const [revenueStats, setRevenueStats] = useState([])
  const [promoAnalytics, setPromoAnalytics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalyticsDashboard(dateRange, token)
      setAnalytics(data)

      const revenue = await api.getRevenueStats(dateRange, token)
      setRevenueStats(revenue)

      const promos = await api.getPromoCodeAnalytics(token)
      setPromoAnalytics(promos)

      setLoading(false)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    )
  }

  // Group revenue by date
  const revenueByDate = {}
  revenueStats.forEach(rsvp => {
    const date = new Date(rsvp.created_at).toLocaleDateString()
    if (!revenueByDate[date]) {
      revenueByDate[date] = 0
    }
    revenueByDate[date] += rsvp.final_amount || 0
  })

  // Group revenue by event
  const revenueByEvent = {}
  revenueStats.forEach(rsvp => {
    const eventName = rsvp.events?.title || 'Unknown'
    if (!revenueByEvent[eventName]) {
      revenueByEvent[eventName] = 0
    }
    revenueByEvent[eventName] += rsvp.final_amount || 0
  })

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-3xl font-bold text-white">₹{analytics.revenue.toLocaleString()}</div>
          <div className="text-sm text-green-200">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
          <div className="text-3xl mb-2">🎫</div>
          <div className="text-3xl font-bold text-white">{analytics.registrations}</div>
          <div className="text-sm text-blue-200">Registrations</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
          <div className="text-3xl mb-2">👁️</div>
          <div className="text-3xl font-bold text-white">{analytics.views}</div>
          <div className="text-sm text-purple-200">Page Views</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white">{analytics.conversionRate}%</div>
          <div className="text-sm text-orange-200">Conversion Rate</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Revenue Over Time</h3>
        <div className="space-y-2">
          {Object.entries(revenueByDate).map(([date, amount]) => (
            <div key={date} className="flex items-center gap-4">
              <div className="w-32 text-sm text-gray-400">{date}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center px-4 text-white font-semibold"
                  style={{ width: `${(amount / Math.max(...Object.values(revenueByDate))) * 100}%` }}
                >
                  ₹{amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Event */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Revenue by Event</h3>
        <div className="space-y-3">
          {Object.entries(revenueByEvent)
            .sort((a, b) => b[1] - a[1])
            .map(([event, amount]) => (
              <div key={event} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                <span className="text-white font-semibold">{event}</span>
                <span className="text-green-400 font-bold">₹{amount.toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Promo Code Performance */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Promo Code Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Code</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Usage</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Total Discount</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {promoAnalytics.map(promo => (
                <tr key={promo.code} className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-white font-mono">{promo.code}</td>
                  <td className="py-3 px-4 text-right text-white">{promo.usageCount}</td>
                  <td className="py-3 px-4 text-right text-red-400">-₹{promo.totalDiscount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-400">₹{promo.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { stage: 'Page Views', count: analytics.views, color: 'blue' },
            { stage: 'Click Register', count: Math.floor(analytics.views * 0.6), color: 'purple' },
            { stage: 'Form Fill', count: Math.floor(analytics.views * 0.4), color: 'orange' },
            { stage: 'Payment Initiated', count: Math.floor(analytics.views * 0.25), color: 'yellow' },
            { stage: 'Payment Completed', count: analytics.registrations, color: 'green' }
          ].map((step, index) => (
            <div key={step.stage}>
              <div className="flex justify-between mb-2">
                <span className="text-white font-semibold">{step.stage}</span>
                <span className="text-gray-400">{step.count} ({((step.count / analytics.views) * 100).toFixed(1)}%)</span>
              </div>
              <div className="bg-gray-700 rounded-full h-10 relative overflow-hidden">
                <div
                  className={`bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 h-full flex items-center px-4 text-white font-semibold transition-all`}
                  style={{ width: `${(step.count / analytics.views) * 100}%` }}
                >
                  {step.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            const csv = [
              ['Date', 'Revenue'],
              ...Object.entries(revenueByDate).map(([date, amount]) => [date, amount])
            ].map(row => row.join(',')).join('\n')
            
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `revenue-${dateRange}.csv`
            a.click()
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          📊 Export Revenue Data
        </button>
        
        <button
          onClick={() => {
            const csv = [
              ['Promo Code', 'Usage', 'Total Discount', 'Revenue'],
              ...promoAnalytics.map(p => [p.code, p.usageCount, p.totalDiscount, p.totalRevenue])
            ].map(row => row.join(',')).join('\n')
            
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `promo-analytics-${dateRange}.csv`
            a.click()
          }}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
        >
          🎟️ Export Promo Data
        </button>
      </div>
    </div>
  )
}

export default AnalyticsTab
