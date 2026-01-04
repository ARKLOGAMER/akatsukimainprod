import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = 'G-G-1HCWGDJJMV' // 🔥 REPLACE THIS WITH YOUR ACTUAL GA4 MEASUREMENT ID

// 📋 INSTRUCTIONS TO GET YOUR GA4 ID:
// 1. Go to https://analytics.google.com
// 2. Create account → Property → Web Data Stream
// 3. Copy the Measurement ID (starts with G-)
// 4. Replace 'G-XXXXXXXXXX' above with your actual ID
// 5. Example: 'G-ABC123DEF4' or 'G-1234567890'

function Analytics() {
  const location = useLocation()

  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      })
    }
  }, [location])

  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: false
      });
    `
    document.head.appendChild(script2)

    // Set gtag function globally
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [])

  return null
}

// Custom event tracking functions
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label,
      value: parameters.value,
      ...parameters
    })
  }
}

export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle
    })
  }
}

export const trackConversion = (eventName, value, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'conversion',
      value: value,
      currency: currency
    })
  }
}

// Event tracking for AKATSUKI platform
export const trackEventRegistration = (eventId, eventTitle, amount) => {
  trackEvent('event_registration', {
    category: 'events',
    label: eventTitle,
    value: amount,
    event_id: eventId
  })
}

export const trackStudentLogin = (method = 'email') => {
  trackEvent('login', {
    category: 'authentication',
    method: method
  })
}

export const trackPromoCodeUsage = (promoCode, discountAmount) => {
  trackEvent('promo_code_used', {
    category: 'marketing',
    label: promoCode,
    value: discountAmount
  })
}

export const trackReferralClick = (referralCode) => {
  trackEvent('referral_click', {
    category: 'referral',
    label: referralCode
  })
}

export default Analytics