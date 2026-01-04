# 📊 Google Analytics Setup Guide for AKATSUKI

## 🎯 **Quick Setup Checklist**

### **1. Get Your Google Analytics ID**
- [ ] Go to [analytics.google.com](https://analytics.google.com)
- [ ] Create account: "AKATSUKI Platform"
- [ ] Create property: "AKATSUKI - Tech Events Platform"
- [ ] Set timezone: India Standard Time (GMT+05:30)
- [ ] Set currency: Indian Rupee (₹)
- [ ] Create web data stream for your domain
- [ ] Copy Measurement ID (format: G-XXXXXXXXXX)

### **2. Update Your Code**
```javascript
// In src/components/Analytics.jsx, replace this line:
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'

// With your actual ID:
const GA_MEASUREMENT_ID = 'G-ABC123DEF4'  // Your real ID
```

### **3. Test Your Setup**

#### **Visual Verification:**
1. **Run your app**: `npm run dev`
2. **Look for debug indicator**: Green box in bottom-right corner
3. **Status should show**: "loaded" with your Measurement ID

#### **Browser Console Test:**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Type**: `window.gtag` and press Enter
4. **Should show**: `function gtag() { ... }`
5. **Type**: `window.dataLayer` and press Enter
6. **Should show**: Array with your config data

#### **Real-time Reports:**
1. **Go to Google Analytics**
2. **Navigate to**: Reports → Realtime
3. **Visit your website**
4. **Should see**: Active users count increase

## 🔧 **Advanced Configuration**

### **Custom Events Setup**
Your platform automatically tracks these events:

```javascript
// Event Registration
trackEventRegistration(eventId, eventTitle, amount)

// Student Login
trackStudentLogin('email')

// Promo Code Usage
trackPromoCodeUsage(promoCode, discountAmount)

// Referral Clicks
trackReferralClick(referralCode)
```

### **Conversion Goals Setup**
1. **Go to Google Analytics**
2. **Navigate to**: Admin → Goals (GA Universal) or Conversions (GA4)
3. **Create these goals**:
   - Event Registration (event: 'event_registration')
   - Student Signup (event: 'sign_up')
   - Payment Completion (event: 'purchase')

## 📈 **What You'll Track**

### **Automatic Tracking:**
- ✅ Page views on all routes
- ✅ User sessions and engagement
- ✅ Traffic sources (organic, direct, referral)
- ✅ Device and browser information
- ✅ Geographic location of users

### **Custom Event Tracking:**
- ✅ Event registrations with revenue
- ✅ Student login attempts
- ✅ Promo code usage and discounts
- ✅ Referral link clicks
- ✅ Form submissions and errors

### **E-commerce Tracking:**
- ✅ Event registration revenue
- ✅ Promo code discount amounts
- ✅ Payment method preferences
- ✅ Registration funnel analysis

## 🚨 **Troubleshooting**

### **Debug Indicator Shows "not-loaded":**
1. **Check Measurement ID**: Ensure it starts with 'G-'
2. **Check Internet**: Analytics needs internet connection
3. **Check Ad Blockers**: Disable for testing
4. **Check Console**: Look for JavaScript errors

### **No Data in Google Analytics:**
1. **Wait 24-48 hours**: Data can take time to appear
2. **Check Real-time Reports**: Should show immediate data
3. **Verify Domain**: Ensure domain matches in GA settings
4. **Check Filters**: Ensure no filters are blocking data

### **Events Not Tracking:**
1. **Check Console**: Look for gtag errors
2. **Test Manually**: Use browser console to fire test events
3. **Verify Event Names**: Ensure they match GA4 requirements

## 🎯 **Key Metrics to Monitor**

### **Traffic Metrics:**
- **Users**: Total unique visitors
- **Sessions**: Total visits to your site
- **Page Views**: Total pages viewed
- **Bounce Rate**: Single-page sessions
- **Session Duration**: Time spent on site

### **Event Metrics:**
- **Event Registrations**: Total and by event type
- **Registration Rate**: Visitors who register
- **Revenue per User**: Average spending
- **Promo Code Usage**: Discount effectiveness
- **Referral Success**: Viral growth tracking

### **User Behavior:**
- **Top Pages**: Most visited content
- **User Flow**: How users navigate
- **Exit Pages**: Where users leave
- **Search Terms**: What brings users (organic)

## 📊 **Custom Dashboards**

### **Create These Reports:**
1. **Event Performance Dashboard**
   - Event registrations by type
   - Revenue by event
   - Registration funnel

2. **Marketing Dashboard**
   - Traffic sources
   - Promo code performance
   - Referral tracking

3. **User Engagement Dashboard**
   - User retention
   - Session quality
   - Content performance

## 🔒 **Privacy & Compliance**

### **GDPR Compliance:**
- Analytics respects user privacy settings
- No personal data is tracked without consent
- Users can opt-out via browser settings

### **Data Retention:**
- Set appropriate data retention periods
- Regular data cleanup and anonymization
- Comply with local privacy laws

## 🚀 **Next Steps After Setup**

1. **Set up Google Search Console** and link to Analytics
2. **Create custom audiences** for remarketing
3. **Set up goal funnels** to track user journey
4. **Configure enhanced e-commerce** for detailed revenue tracking
5. **Set up automated reports** for regular monitoring

## 📞 **Support**

If you need help with Analytics setup:
1. **Check Google Analytics Help Center**
2. **Use the debug component** for immediate feedback
3. **Monitor browser console** for error messages
4. **Test in incognito mode** to avoid cache issues

Remember: Remove the AnalyticsDebug component before production deployment!