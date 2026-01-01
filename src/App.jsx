import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicPage from './pages/PublicPage'
import AdminLogin from './pages/AdminLogin'
import ModernAdminEventsList from './pages/ModernAdminEventsList'
import ModernAdminDashboard from './pages/ModernAdminDashboard'
import EventRSVPPage from './pages/EventRSVPPage'
import EventLandingPage from './pages/EventLandingPage'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import AuthCallback from './pages/AuthCallback'
// PRODUCTION: Uncomment these imports before deploying to production
// import TermsAndConditions from './pages/TermsAndConditions'
// import PrivacyPolicy from './pages/PrivacyPolicy'
// import RefundPolicy from './pages/RefundPolicy'
// import DeliveryPolicy from './pages/DeliveryPolicy'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/event/:id" element={<EventRSVPPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/events" element={<ModernAdminEventsList />} />
        <Route path="/admin/events/:id" element={<ModernAdminDashboard />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/auth/callback" element={<AuthCallback />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        {/* PRODUCTION: Uncomment these routes before deploying to production
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/delivery" element={<DeliveryPolicy />} />
        */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
