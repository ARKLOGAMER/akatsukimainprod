import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function DeliveryPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Delivery & Access Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Event Access Delivery</h2>
            <p className="mb-2">
              AKATSUKI provides digital event access and materials. Upon successful registration and payment (if applicable), you will receive:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Confirmation email within 24 hours of registration</li>
              <li>Event access details via email 48 hours before the event</li>
              <li>WhatsApp group invitation (if applicable)</li>
              <li>Event materials and resources digitally</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Digital Delivery Timeline</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Immediate Delivery:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Registration confirmation email</li>
                  <li>Payment receipt (for paid events)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Within 48 Hours Before Event:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Event joining link (for online events)</li>
                  <li>Venue details and directions (for offline events)</li>
                  <li>Pre-event materials and instructions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">During Event:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Live session access</li>
                  <li>Real-time support via WhatsApp group</li>
                  <li>Event resources and materials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">After Event Completion:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Certificates of completion (within 7 days)</li>
                  <li>Recorded sessions (if applicable)</li>
                  <li>Additional resources and materials</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Certificate Delivery</h2>
            <p>
              Certificates of completion are issued digitally:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Available in your student dashboard within 7 days of event completion</li>
              <li>Sent via email as a downloadable PDF</li>
              <li>Accessible anytime from your AKATSUKI account</li>
              <li>No physical certificates are provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Communication Channels</h2>
            <p className="mb-2">We deliver event information through:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Email:</strong> Primary communication for confirmations and updates</li>
              <li><strong>WhatsApp:</strong> Event-specific groups for real-time updates</li>
              <li><strong>Student Dashboard:</strong> Access all your event details and materials</li>
              <li><strong>SMS:</strong> Critical reminders and notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Access Issues</h2>
            <p className="mb-2">If you don't receive event access details:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Check your spam/junk folder</li>
              <li>Verify your email address in your account settings</li>
              <li>Login to your student dashboard for event details</li>
              <li>Contact support at hello@scify-tech.com</li>
              <li>WhatsApp us at +91 9495479176</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Technical Requirements</h2>
            <p className="mb-2">For online events, ensure you have:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Stable internet connection (minimum 2 Mbps)</li>
              <li>Updated web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Working microphone and camera (if participation required)</li>
              <li>Zoom/Google Meet installed (platform will be specified)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Physical Materials (If Applicable)</h2>
            <p>
              For events that include physical materials or merchandise:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Delivery timeline will be communicated separately</li>
              <li>Shipping charges may apply (if not included in registration fee)</li>
              <li>Delivery only within India</li>
              <li>Tracking information will be provided via email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. No-Show Policy</h2>
            <p>
              If you miss the event:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Recorded sessions may be available (not guaranteed)</li>
              <li>Certificates will not be issued for non-attendance</li>
              <li>No refunds for no-shows (see Refund Policy)</li>
              <li>Materials may still be accessible in your dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Support & Assistance</h2>
            <p>
              For any delivery or access issues, contact us:
            </p>
            <div className="mt-2 space-y-1">
              <p><strong>Email:</strong> hello@scify-tech.com</p>
              <p><strong>Phone:</strong> +91 9495479176</p>
              <p><strong>Support Hours:</strong> Monday - Saturday, 9 AM - 6 PM IST</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this Delivery & Access Policy at any time. Changes will be effective immediately upon posting on this page. Your continued participation in AKATSUKI events constitutes acceptance of any changes.
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

export default DeliveryPolicy
