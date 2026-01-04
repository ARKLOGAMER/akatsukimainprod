import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Analytics from './components/Analytics'
import AnalyticsDebug from './components/AnalyticsDebug'
import PublicPage from './pages/PublicPage'
import AdminLogin from './pages/AdminLogin'
import ModernAdminEventsList from './pages/ModernAdminEventsList'
import ModernAdminDashboard from './pages/ModernAdminDashboard'
import EventRSVPPage from './pages/EventRSVPPage'
import EventLandingPage from './pages/EventLandingPage'
import StudentLogin from './pages/StudentLogin'
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard'
import AuthCallback from './pages/AuthCallback'
// DISABLED FOR LOCAL TESTING - Uncomment for production
// import TermsAndConditions from './pages/TermsAndConditions'
// import PrivacyPolicy from './pages/PrivacyPolicy'
// import RefundPolicy from './pages/RefundPolicy'
// import DeliveryPolicy from './pages/DeliveryPolicy'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Analytics />
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/event/:slug" element={<EventLandingPage />} />
          <Route path="/event/:id/rsvp" element={<EventRSVPPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/events" element={<ModernAdminEventsList />} />
          <Route path="/admin/events/:id" element={<ModernAdminDashboard />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/auth/callback" element={<AuthCallback />} />
          <Route path="/student/dashboard" element={<EnhancedStudentDashboard />} />
          {/* DISABLED FOR LOCAL TESTING - Uncomment for production
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/delivery" element={<DeliveryPolicy />} />
          */}
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
