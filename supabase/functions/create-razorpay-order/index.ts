import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, event_id, customer_details, is_free_event } = await req.json()

    if (!event_id) {
      throw new Error('Event ID is required')
    }

    // For free events, create a mock order
    if (is_free_event && amount <= 1) {
      const mockOrderId = `free_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Store free order in database
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabaseClient
        .from('payments')
        .insert({
          razorpay_order_id: mockOrderId,
          event_id,
          amount: 0,
          currency: 'INR',
          status: 'free'
        })

      return new Response(
        JSON.stringify({
          success: true,
          order_id: mockOrderId,
          amount: 100, // ₹1 in paise (minimum for Razorpay UI)
          currency: 'INR',
          is_free: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For paid events, create actual Razorpay order
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required for paid events')
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          event_id,
          customer_name: customer_details?.name,
          customer_email: customer_details?.email
        }
      })
    })

    if (!orderResponse.ok) {
      const error = await orderResponse.json()
      throw new Error(error.error?.description || 'Failed to create order')
    }

    const order = await orderResponse.json()

    // Store order in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient
      .from('payments')
      .insert({
        razorpay_order_id: order.id,
        event_id,
        amount: amount,
        currency: 'INR',
        status: 'pending'
      })

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        is_free: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Order creation error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
