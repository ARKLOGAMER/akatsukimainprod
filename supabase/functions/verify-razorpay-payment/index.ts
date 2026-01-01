import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      rsvp_data,
      event_id,
      is_free_event
    } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle free events (no signature verification needed)
    if (is_free_event || razorpay_order_id.startsWith('free_')) {
      // Update payment status for free event
      const { data: payment } = await supabaseClient
        .from('payments')
        .update({
          razorpay_payment_id: razorpay_payment_id || 'free_payment',
          status: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .select()
        .single()

      // Create RSVP for free event
      const { data: rsvp, error: rsvpError } = await supabaseClient
        .from('rsvps')
        .insert({
          ...rsvp_data,
          event_id,
          status: 'approved',
          payment_status: 'free',
          payment_id: payment?.id || null
        })
        .select()
        .single()

      if (rsvpError) {
        throw rsvpError
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Free registration completed successfully',
          rsvp
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle paid events - verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = createHmac('sha256', RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Update payment status
    const { data: payment } = await supabaseClient
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single()

    if (!payment) {
      throw new Error('Payment record not found')
    }

    // Create RSVP
    const { data: rsvp, error: rsvpError } = await supabaseClient
      .from('rsvps')
      .insert({
        ...rsvp_data,
        event_id,
        status: 'approved',
        payment_status: 'paid',
        payment_id: payment.id
      })
      .select()
      .single()

    if (rsvpError) {
      throw rsvpError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        rsvp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
