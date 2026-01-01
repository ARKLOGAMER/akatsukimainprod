import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. General Policy</h2>
            <p>
              At AKATSUKI, we strive to provide high-quality events and experiences. This Refund Policy outlines the circumstances under which refunds may be issued for event registrations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility for Refunds</h2>
            <p className="mb-2">Refunds may be issued in the following cases:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Event Cancellation:</strong> Full refund if the event is cancelled by AKATSUKI</li>
              <li><strong>Early Cancellation:</strong> 80% refund if cancelled 7+ days before the event</li>
              <li><strong>Late Cancellation:</strong> 50% refund if cancelled 3-6 days before the event</li>
              <li><strong>Last Minute:</strong> No refund if cancelled less than 3 days before the event</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Non-Refundable Situations</h2>
            <p className="mb-2">Refunds will NOT be issued in the following cases:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No-show without prior cancellation</li>
              <li>Partial attendance of multi-day events</li>
              <li>Change of mind after the event has started</li>
              <li>Technical issues on the participant's end (for online events)</li>
              <li>Dissatisfaction with event content (unless misrepresented)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Free Events</h2>
            <p>
              For free events, no refund is applicable. However, you may cancel your registration at any time before the event.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. How to Request a Refund</h2>
            <p className="mb-2">To request a refund:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Email us at refunds@scifytech.com</li>
              <li>Include your registration details and reason for cancellation</li>
              <li>Provide your payment transaction ID</li>
              <li>Allow 7-10 business days for processing</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Refund Processing</h2>
            <p>
              Approved refunds will be processed within 7-10 business days. The refund will be credited to the original payment method used during registration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Event Rescheduling</h2>
            <p>
              If an event is rescheduled, you may choose to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Attend the rescheduled event (no additional charge)</li>
              <li>Transfer your registration to another participant</li>
              <li>Request a full refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Special Circumstances</h2>
            <p>
              In case of medical emergencies or other exceptional circumstances, please contact us directly. We will review your case and may offer a refund or credit for future events at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Processing Fees</h2>
            <p>
              Payment gateway processing fees (typically 2-3% of the transaction amount) are non-refundable and will be deducted from any refund amount.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
            <p>
              For refund requests or questions about this policy, contact us at:<br />
              Email: refunds@scifytech.com<br />
              Phone: +91 XXXXX XXXXX<br />
              Response time: Within 24-48 hours
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

export default RefundPolicy
