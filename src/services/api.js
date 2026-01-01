import { supabaseConfig, getAuthHeaders } from '../config/supabase'

const BASE_URL = supabaseConfig.url

export const api = {
  // Events - Public (only listable events)
  async getEvents() {
    const res = await fetch(`${BASE_URL}/rest/v1/events?select=*&is_listable=eq.true&order=created_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // Events - Admin (all events regardless of listable status)
  async getAllEventsAdmin(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/events?select=*&order=created_at.desc`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  async getEvent(id) {
    const res = await fetch(`${BASE_URL}/rest/v1/events?id=eq.${id}&select=*`, {
      headers: supabaseConfig.headers
    })
    const data = await res.json()
    return data[0]
  },

  async getEventBySlug(slug) {
    const res = await fetch(`${BASE_URL}/rest/v1/events?slug=eq.${slug}&select=*`, {
      headers: supabaseConfig.headers
    })
    const data = await res.json()
    return data[0]
  },

  async createEvent(eventData, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(eventData)
    })
    return res.json()
  },

  // Get current active price for an event based on deadlines
  getCurrentPrice(event) {
    const now = new Date()
    
    // Check Pre-Early Bird
    if (event.pre_early_bird_fee && event.pre_early_bird_deadline) {
      const preEarlyDeadline = new Date(event.pre_early_bird_deadline)
      if (now <= preEarlyDeadline) {
        return {
          amount: event.pre_early_bird_fee,
          tier: 'Pre-Early Bird',
          deadline: preEarlyDeadline
        }
      }
    }
    
    // Check Early Bird
    if (event.early_bird_fee && event.early_bird_deadline) {
      const earlyDeadline = new Date(event.early_bird_deadline)
      if (now <= earlyDeadline) {
        return {
          amount: event.early_bird_fee,
          tier: 'Early Bird',
          deadline: earlyDeadline
        }
      }
    }
    
    // Final Rate
    return {
      amount: event.final_fee || event.fee || 0,
      tier: 'Final Rate',
      deadline: null
    }
  },

  async updateEvent(id, updates, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates)
    })
    return res.ok
  },

  async deleteEvent(id, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    })
    return res.ok
  },

  // RSVPs
  async createRSVP(rsvpData) {
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps`, {
      method: 'POST',
      headers: {
        ...supabaseConfig.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(rsvpData)
    })
    
    if (!res.ok) {
      const error = await res.json()
      console.error('RSVP API error:', error)
      throw new Error(error.message || 'Failed to create RSVP')
    }
    
    return res.json()
  },

  async getRSVPs(eventId, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps?event_id=eq.${eventId}&order=created_at.desc&select=*`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  async getRSVPCount(eventId) {
    const url = eventId 
      ? `${BASE_URL}/rest/v1/rsvps?event_id=eq.${eventId}&select=count`
      : `${BASE_URL}/rest/v1/rsvps?select=count`
    
    const res = await fetch(url, {
      headers: {
        ...supabaseConfig.headers,
        'Prefer': 'count=exact'
      }
    })
    
    // Get count from response header
    const count = res.headers.get('content-range')
    if (count) {
      const total = count.split('/')[1]
      return parseInt(total) || 0
    }
    
    return 0
  },

  async updateRSVPStatus(id, status, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps?id=eq.${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status })
    })
    return res.ok
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseConfig.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        password 
      })
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Login failed')
    }
    
    return res.json()
  },

  // Form Schema
  async getFormSchema(eventId, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/form_schema?event_id=eq.${eventId}&select=*`, {
      headers: getAuthHeaders(token)
    })
    const data = await res.json()
    return data[0]
  },

  async updateFormSchema(eventId, schema, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/form_schema?event_id=eq.${eventId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ schema_json: schema })
    })
    return res.ok
  },

  // Email - Using AWS SES SDK
  async sendRSVPEmail(emailData) {
    try {
      const res = await fetch(`${BASE_URL}/functions/v1/send-registration-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        },
        body: JSON.stringify({
          to: emailData.email || emailData.to,
          eventName: emailData.eventTitle,
          eventDate: emailData.eventDate,
          eventTime: emailData.eventTime || 'TBA',
          eventLocation: emailData.eventVenue || 'TBA'
        })
      })
      
      if (!res.ok) {
        const error = await res.json()
        console.error('Email sending failed:', error)
        throw new Error(error.error || 'Failed to send email')
      }
      
      return res.json()
    } catch (err) {
      console.error('Email API error:', err)
      // Don't throw - allow registration to succeed even if email fails
      return { success: false, error: err.message }
    }
  },

  // Storage - Upload image to Supabase Storage
  async uploadImage(file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Use ONLY anon key (never expires)
      const res = await fetch(`${BASE_URL}/storage/v1/object/event-posters/${filePath}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': file.type,
          'x-upsert': 'false'
        },
        body: file
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = 'Failed to upload image'
        
        try {
          const error = JSON.parse(errorText)
          errorMessage = error.message || error.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        // Check for specific errors
        if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket')) {
          throw new Error('Storage bucket not set up. Run setup-storage.sql in Supabase!')
        }
        if (errorMessage.includes('policy')) {
          throw new Error('Storage policies not set up. Run setup-storage.sql in Supabase!')
        }
        
        throw new Error(errorMessage)
      }

      // Return the public URL
      return `${BASE_URL}/storage/v1/object/public/event-posters/${filePath}`
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  },

  // Storage - Delete image from Supabase Storage
  async deleteImage(imageUrl, token) {
    // Extract file path from URL
    const urlParts = imageUrl.split('/event-posters/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const res = await fetch(`${BASE_URL}/storage/v1/object/event-posters/${filePath}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseConfig.anonKey
      }
    })

    return res.ok
  },

  // Student Profile
  async getStudentProfile(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/students?select=*&limit=1`, {
      headers: getAuthHeaders(token)
    })
    const data = await res.json()
    return data[0]
  },

  // Student Profile by Email
  async getStudentProfileByEmail(email) {
    const res = await fetch(`${BASE_URL}/rest/v1/students?email=eq.${email}&select=*&limit=1`, {
      headers: supabaseConfig.headers
    })
    const data = await res.json()
    return data[0]
  },

  // Student Courses
  async getStudentCourses(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/student_courses?select=*,event:events(*)&order=joined_at.desc`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  // Student Courses by Email
  async getStudentCoursesByEmail(email) {
    const res = await fetch(`${BASE_URL}/rest/v1/student_courses?select=*,event:events(*)&order=joined_at.desc`, {
      headers: supabaseConfig.headers
    })
    const allCourses = await res.json()
    
    // Get student ID from email
    const studentRes = await fetch(`${BASE_URL}/rest/v1/students?email=eq.${email}&select=id`, {
      headers: supabaseConfig.headers
    })
    const students = await studentRes.json()
    
    if (students.length === 0) return []
    
    // Filter courses for this student
    return allCourses.filter(course => course.student_id === students[0].id)
  },

  // Create Doubt
  async createDoubt(doubtData, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/doubts`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(doubtData)
    })
    
    if (!res.ok) {
      throw new Error('Failed to create doubt')
    }
    
    return res.json()
  },

  // Get Student Doubts
  async getStudentDoubts(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/doubts?select=*,event:events(title)&order=created_at.desc`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  // Admin - Get All Students
  async getAllStudents(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/students?select=*&order=created_at.desc`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  // Admin - Get All Doubts
  async getAllDoubts(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/doubts?select=*,student:students(name,email),event:events(title)&order=created_at.desc`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  // Admin - Update Doubt
  async updateDoubt(doubtId, updateData, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/doubts?id=eq.${doubtId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updateData)
    })
    return res.ok
  },

  // Admin - Get Student Course Count
  async getStudentCourseCount(studentId, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/student_courses?student_id=eq.${studentId}&select=count`, {
      headers: {
        ...getAuthHeaders(token),
        'Prefer': 'count=exact'
      }
    })
    const count = res.headers.get('content-range')
    if (count) {
      const total = count.split('/')[1]
      return parseInt(total) || 0
    }
    return 0
  },

  // Certificate Templates
  async getCertificateTemplate(eventId, token) {
    try {
      const res = await fetch(`${BASE_URL}/rest/v1/certificate_templates?event_id=eq.${eventId}&select=*&limit=1`, {
        headers: getAuthHeaders(token)
      })
      
      if (!res.ok) {
        console.warn('Certificate template table may not exist yet')
        return null
      }
      
      const data = await res.json()
      return data[0] || null
    } catch (err) {
      console.error('Error fetching certificate template:', err)
      return null
    }
  },

  async createCertificateTemplate(eventId, templateData, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/certificate_templates`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ event_id: eventId, ...templateData })
    })
    return res.json()
  },

  async updateCertificateTemplate(eventId, updates, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/certificate_templates?event_id=eq.${eventId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates)
    })
    return res.ok
  },

  // Issued Certificates
  async getIssuedCertificates(eventId, token) {
    try {
      const res = await fetch(`${BASE_URL}/rest/v1/issued_certificates?event_id=eq.${eventId}&select=*&order=issued_at.desc`, {
        headers: getAuthHeaders(token)
      })
      
      if (!res.ok) {
        console.warn('Issued certificates table may not exist yet')
        return []
      }
      
      return res.json()
    } catch (err) {
      console.error('Error fetching issued certificates:', err)
      return []
    }
  },

  async generateCertificates(eventId, token) {
    // Get template
    const template = await this.getCertificateTemplate(eventId, token)
    if (!template) {
      throw new Error('No certificate template found')
    }

    // Get all approved RSVPs
    const rsvps = await this.getRSVPs(eventId, token)
    const approvedRsvps = rsvps.filter(r => r.status === 'approved')

    if (approvedRsvps.length === 0) {
      throw new Error('No approved RSVPs found')
    }

    // Create certificate records for each RSVP
    const certificates = []
    for (const rsvp of approvedRsvps) {
      // Check if already exists
      const existingRes = await fetch(`${BASE_URL}/rest/v1/issued_certificates?rsvp_id=eq.${rsvp.id}&select=id`, {
        headers: getAuthHeaders(token)
      })
      const existing = await existingRes.json()
      
      if (existing.length > 0) continue

      // Create new certificate
      const res = await fetch(`${BASE_URL}/rest/v1/issued_certificates`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          rsvp_id: rsvp.id,
          event_id: eventId,
          student_email: rsvp.email,
          student_name: rsvp.full_name || rsvp.name,
          certificate_url: template.template_url,
          certificate_data: {
            template_url: template.template_url,
            student_name: rsvp.full_name || rsvp.name,
            mappings: template.mappings || []
          },
          email_sent: false
        })
      })

      if (res.ok) {
        const cert = await res.json()
        certificates.push(cert[0] || cert)
      } else {
        const error = await res.json()
        console.error('Failed to create certificate:', error)
      }
    }

    return { success: true, count: certificates.length }
  },

  async sendCertificateEmails(eventId, token) {
    // Call the send-certificates edge function
    const res = await fetch(`${BASE_URL}/functions/v1/send-certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseConfig.anonKey}`
      },
      body: JSON.stringify({ event_id: eventId })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to send certificates')
    }

    return res.json()
  },

  // Student - Get My Certificates
  async getMyCertificates(email) {
    const res = await fetch(`${BASE_URL}/rest/v1/issued_certificates?student_email=eq.${email}&select=*,event:events(title)&order=issued_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // Razorpay Payment
  async createRazorpayOrder(orderData) {
    const res = await fetch(`${BASE_URL}/functions/v1/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseConfig.anonKey}`
      },
      body: JSON.stringify(orderData)
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create order')
    }

    return res.json()
  },

  async verifyRazorpayPayment(paymentData) {
    const res = await fetch(`${BASE_URL}/functions/v1/verify-razorpay-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseConfig.anonKey}`
      },
      body: JSON.stringify(paymentData)
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Payment verification failed')
    }

    return res.json()
  },

  // Promo Codes
  async getPromoCodes(eventId, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/promo_codes?event_id=eq.${eventId}&order=created_at.desc&select=*`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  async createPromoCode(eventId, promoData, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/promo_codes`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        event_id: eventId,
        ...promoData,
        max_uses: promoData.max_uses || null,
        valid_until: promoData.valid_until || null
      })
    })
    return res.json()
  },

  async updatePromoCode(id, updates, token) {
    const res = await fetch(`${BASE_URL}/rest/v1/promo_codes?id=eq.${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates)
    })
    return res.ok
  },

  async validatePromoCode(eventId, code) {
    const res = await fetch(`${BASE_URL}/rest/v1/promo_codes?event_id=eq.${eventId}&code=eq.${code.toUpperCase()}&is_active=eq.true&select=*`, {
      headers: supabaseConfig.headers
    })
    const data = await res.json()
    if (data.length === 0) return null
    
    const promo = data[0]
    // Check if expired
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) return null
    // Check if max uses reached
    if (promo.max_uses && promo.used_count >= promo.max_uses) return null
    
    return promo
  },

  // Student OTP Authentication (With AWS SES SDK)
  async sendStudentOTP(email) {
    try {
      const res = await fetch(`${BASE_URL}/functions/v1/send-student-otp-ses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send OTP')
      }

      return await res.json()
    } catch (err) {
      console.error('OTP sending error:', err)
      throw new Error(err.message || 'Failed to send OTP. Please try again.')
    }
  },

  async verifyStudentOTP(email, otp_code) {
    // Find valid OTP
    const res = await fetch(
      `${BASE_URL}/rest/v1/student_otps?email=eq.${email.toLowerCase()}&otp_code=eq.${otp_code}&verified=eq.false&expires_at=gt.${new Date().toISOString()}&order=created_at.desc&limit=1`,
      {
        headers: supabaseConfig.headers
      }
    )

    const otps = await res.json()
    
    if (!otps || otps.length === 0) {
      throw new Error('Invalid or expired OTP code')
    }

    const otpRecord = otps[0]

    // Mark as verified
    await fetch(`${BASE_URL}/rest/v1/student_otps?id=eq.${otpRecord.id}`, {
      method: 'PATCH',
      headers: supabaseConfig.headers,
      body: JSON.stringify({
        verified: true,
        verified_at: new Date().toISOString()
      })
    })

    // Get or create student
    let studentRes = await fetch(`${BASE_URL}/rest/v1/students?email=eq.${email.toLowerCase()}&select=*&limit=1`, {
      headers: supabaseConfig.headers
    })
    let students = await studentRes.json()
    let student = students[0]

    if (!student) {
      // Create new student
      const createRes = await fetch(`${BASE_URL}/rest/v1/students`, {
        method: 'POST',
        headers: {
          ...supabaseConfig.headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: email.split('@')[0]
        })
      })
      const newStudents = await createRes.json()
      student = newStudents[0]
    }

    // Generate session token
    const token = btoa(JSON.stringify({
      email: student.email,
      id: student.id,
      timestamp: Date.now()
    }))

    return {
      success: true,
      token,
      student: {
        id: student.id,
        email: student.email,
        name: student.name
      }
    }
  },

  // ============================================
  // GAMIFICATION SYSTEM
  // ============================================

  // Award points to a student
  async awardPoints(studentId, points, reason, eventId = null) {
    const res = await fetch(`${BASE_URL}/rest/v1/rpc/award_points`, {
      method: 'POST',
      headers: supabaseConfig.headers,
      body: JSON.stringify({
        p_student_id: studentId,
        p_points: points,
        p_reason: reason,
        p_event_id: eventId
      })
    })
    return res.ok
  },

  // Get student's points history
  async getStudentPoints(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/student_points?student_id=eq.${studentId}&order=created_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const res = await fetch(`${BASE_URL}/rest/v1/students?select=id,email,total_points,level&order=total_points.desc&limit=${limit}`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // Get all available badges
  async getBadges() {
    const res = await fetch(`${BASE_URL}/rest/v1/badges?select=*&order=points_required.asc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // Get student's earned badges
  async getStudentBadges(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/student_badges?student_id=eq.${studentId}&select=*,badges(*)&order=earned_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // ============================================
  // REFERRAL SYSTEM
  // ============================================

  // Get student's referral code
  async getReferralCode(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/students?id=eq.${studentId}&select=referral_code`, {
      headers: supabaseConfig.headers
    })
    const data = await res.json()
    return data[0]?.referral_code
  },

  // Get referral stats
  async getReferralStats(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/referrals?referrer_id=eq.${studentId}&select=*,students!referrals_referred_id_fkey(email)&order=created_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // ============================================
  // BOOKMARKS
  // ============================================

  // Bookmark an event
  async bookmarkEvent(studentId, eventId) {
    const res = await fetch(`${BASE_URL}/rest/v1/event_bookmarks`, {
      method: 'POST',
      headers: supabaseConfig.headers,
      body: JSON.stringify({
        student_id: studentId,
        event_id: eventId
      })
    })
    return res.ok
  },

  // Get bookmarked events
  async getBookmarkedEvents(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/event_bookmarks?student_id=eq.${studentId}&select=*,events(*)&order=created_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  },

  // ============================================
  // ANALYTICS
  // ============================================

  // Get analytics dashboard data
  async getAnalyticsDashboard(dateRange = 'month', token) {
    const startDate = new Date()
    if (dateRange === 'week') startDate.setDate(startDate.getDate() - 7)
    else if (dateRange === 'month') startDate.setMonth(startDate.getMonth() - 1)
    else if (dateRange === 'year') startDate.setFullYear(startDate.getFullYear() - 1)
    
    const startDateStr = startDate.toISOString()
    
    // Get revenue
    const revenueRes = await fetch(`${BASE_URL}/rest/v1/rsvps?payment_status=eq.paid&created_at=gte.${startDateStr}&select=final_amount`, {
      headers: getAuthHeaders(token)
    })
    const rsvps = await revenueRes.json()
    const totalRevenue = rsvps.reduce((sum, r) => sum + (r.final_amount || 0), 0)
    
    // Get registrations count
    const registrationsRes = await fetch(`${BASE_URL}/rest/v1/rsvps?created_at=gte.${startDateStr}&select=count`, {
      headers: {
        ...getAuthHeaders(token),
        'Prefer': 'count=exact'
      }
    })
    const registrations = parseInt(registrationsRes.headers.get('content-range')?.split('/')[1] || 0)
    
    // Get views count (fallback to 1000 if table doesn't exist yet)
    let views = 1000
    try {
      const viewsRes = await fetch(`${BASE_URL}/rest/v1/event_views?created_at=gte.${startDateStr}&select=count`, {
        headers: {
          ...getAuthHeaders(token),
          'Prefer': 'count=exact'
        }
      })
      views = parseInt(viewsRes.headers.get('content-range')?.split('/')[1] || 1000)
    } catch (err) {
      console.log('Views table not available yet')
    }
    
    return {
      revenue: totalRevenue,
      registrations,
      views,
      conversionRate: views > 0 ? ((registrations / views) * 100).toFixed(2) : 0
    }
  },

  // Get revenue stats
  async getRevenueStats(dateRange = 'month', token) {
    const startDate = new Date()
    if (dateRange === 'week') startDate.setDate(startDate.getDate() - 7)
    else if (dateRange === 'month') startDate.setMonth(startDate.getMonth() - 1)
    else if (dateRange === 'year') startDate.setFullYear(startDate.getFullYear() - 1)
    
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps?payment_status=eq.paid&created_at=gte.${startDate.toISOString()}&select=final_amount,created_at,event_id,events(title)`, {
      headers: getAuthHeaders(token)
    })
    return res.json()
  },

  // Get promo code analytics
  async getPromoCodeAnalytics(token) {
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps?promo_code_used=not.is.null&select=promo_code_used,discount_amount,final_amount`, {
      headers: getAuthHeaders(token)
    })
    const data = await res.json()
    
    // Group by promo code
    const analytics = {}
    data.forEach(rsvp => {
      const code = rsvp.promo_code_used
      if (!analytics[code]) {
        analytics[code] = {
          code,
          usageCount: 0,
          totalDiscount: 0,
          totalRevenue: 0
        }
      }
      analytics[code].usageCount++
      analytics[code].totalDiscount += rsvp.discount_amount || 0
      analytics[code].totalRevenue += rsvp.final_amount || 0
    })
    
    return Object.values(analytics)
  },

  // Get student RSVPs for dashboard
  async getStudentRSVPs(studentId) {
    const res = await fetch(`${BASE_URL}/rest/v1/rsvps?student_id=eq.${studentId}&select=*,events(*)&order=created_at.desc`, {
      headers: supabaseConfig.headers
    })
    return res.json()
  }
}
