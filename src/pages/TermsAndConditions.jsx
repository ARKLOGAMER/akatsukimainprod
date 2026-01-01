import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the AKATSUKI platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Event Registration</h2>
            <p className="mb-2">When you register for an event through AKATSUKI:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to attend the event or notify us in advance if you cannot attend</li>
              <li>Registration fees, if applicable, are non-refundable unless otherwise stated</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the platform for any unlawful purpose</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the platform or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>
              All content on the AKATSUKI platform, including text, graphics, logos, and software, is the property of Scify Technologies and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Event Cancellation</h2>
            <p>
              AKATSUKI reserves the right to cancel or reschedule events. In case of cancellation, registered participants will be notified via email and may be eligible for a refund as per our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              AKATSUKI and Scify Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
            <p>
              For questions about these Terms and Conditions, please contact us at:<br />
              Email: support@scifytech.com<br />
              Website: www.scifytech.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link to="/" className="text-akatsuki-red hover:text-red-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TermsAndConditions
