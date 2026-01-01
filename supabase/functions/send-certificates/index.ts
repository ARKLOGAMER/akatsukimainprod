import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.645.0"

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

    // Get event details
    const { data: event } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    // Get all certificates that haven't been emailed yet
    const { data: certificates } = await supabaseClient
      .from('issued_certificates')
      .select('*')
      .eq('event_id', event_id)
      .eq('email_sent', false)

    if (!certificates || certificates.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending certificates to send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let sentCount = 0

    // Initialize AWS SES
    const sesClient = new SESClient({
      region: Deno.env.get('AWS_REGION') || 'ap-south-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    })

    for (const cert of certificates) {
      try {
        const portalUrl = Deno.env.get('PORTAL_URL') || 'https://your-domain.com'
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); border-radius: 15px 15px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Congratulations!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 15px 15px; border: 2px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${cert.student_name},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Congratulations on successfully completing <strong style="color: #DC2626;">${event.title}</strong>!
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your certificate is ready! Login to your student portal to download it:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}/student/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                  📥 Download Your Certificate
                </a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
                  💡 <strong>Tip:</strong> Login with your email to access your certificate in the Certificates tab
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
                  Thank you for being part of AKATSUKI! 🎉
                </p>
              </div>
            </div>
          </div>
        `

        const command = new SendEmailCommand({
          Source: Deno.env.get('FROM_EMAIL') || 'noreply@scify-tech.com',
          Destination: { ToAddresses: [cert.student_email] },
          Message: {
            Subject: { Data: `🎓 Your Certificate for ${event.title}` },
            Body: {
              Html: { Data: emailHtml },
              Text: { Data: `Congratulations ${cert.student_name}! Your certificate for ${event.title} is ready. Download it here: ${cert.certificate_url}` }
            },
          },
        })

        await sesClient.send(command)

        // Mark as sent
        await supabaseClient
          .from('issued_certificates')
          .update({ 
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', cert.id)

        sentCount++
      } catch (emailError) {
        console.error(`Failed to send to ${cert.student_email}:`, emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${sentCount} certificates`,
        count: sentCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
