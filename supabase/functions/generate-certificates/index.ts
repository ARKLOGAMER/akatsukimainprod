import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_id } = await req.json()

    // Get event details and template
    const { data: event } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    const { data: template } = await supabaseClient
      .from('certificate_templates')
      .select('*')
      .eq('event_id', event_id)
      .single()

    if (!template) {
      throw new Error('No certificate template found for this event')
    }

    // Get all approved RSVPs for this event
    const { data: rsvps } = await supabaseClient
      .from('rsvps')
      .select('*')
      .eq('event_id', event_id)
      .eq('status', 'approved')

    if (!rsvps || rsvps.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No approved RSVPs found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const certificates = []
    const mappings = template.mappings || []

    for (const rsvp of rsvps) {
      // Check if certificate already exists
      const { data: existing } = await supabaseClient
        .from('issued_certificates')
        .select('id')
        .eq('rsvp_id', rsvp.id)
        .single()

      if (existing) {
        continue // Skip if already issued
      }

      // Generate certificate data with mappings
      const certificateData = {
        template_url: template.template_url,
        student_name: rsvp.full_name || rsvp.name,
        event_title: event.title,
        event_date: new Date(event.start_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        mappings: mappings
      }

      // In production, you would generate actual certificate images here
      // For now, we'll store the template URL with metadata
      const certificateUrl = `${template.template_url}?name=${encodeURIComponent(certificateData.student_name)}&event=${encodeURIComponent(certificateData.event_title)}&date=${encodeURIComponent(certificateData.event_date)}`

      // Create certificate record
      const { data: cert, error } = await supabaseClient
        .from('issued_certificates')
        .insert({
          rsvp_id: rsvp.id,
          event_id: event_id,
          student_email: rsvp.email,
          student_name: certificateData.student_name,
          certificate_url: certificateUrl,
          certificate_data: certificateData,
          email_sent: false
        })
        .select()
        .single()

      if (!error && cert) {
        certificates.push(cert)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${certificates.length} certificates`,
        count: certificates.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Certificate generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
