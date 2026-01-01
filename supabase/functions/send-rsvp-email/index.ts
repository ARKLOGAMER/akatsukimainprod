// Supabase Edge Function to send RSVP confirmation email via AWS SES
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SESClient, SendEmailCommand } from 'https://esm.sh/@aws-sdk/client-ses@3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AWS SES Configuration
const AWS_REGION = Deno.env.get('AWS_REGION') || 'ap-south-1'
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID')
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@scify-tech.com'

// Initialize SES Client
const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, eventTitle, eventDate, eventVenue, customMessage, certificateUrl } = await req.json()

    if (!email || !name || !eventTitle) {
      throw new Error('Email, name, and event title are required')
    }

    // Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1a0000 0%, #DC2626 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 36px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details ul { list-style: none; padding: 0; margin: 0; }
            .details li { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .details li:last-child { border-bottom: none; }
            .details strong { color: #DC2626; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f9f9f9; padding: 30px 20px; text-align: center; color: #666; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 AKATSUKI</h1>
              <p>Registration Confirmed!</p>
            </div>
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              
              ${customMessage ? `<p>${customMessage}</p>` : `<p>Thank you for registering for <strong>${eventTitle}</strong>!</p>`}
              
              <div class="details">
                <h3 style="margin-top: 0; color: #DC2626;">📅 Event Details</h3>
                <ul>
                  <li><strong>Event:</strong> ${eventTitle}</li>
                  ${eventDate ? `<li><strong>Date:</strong> ${eventDate}</li>` : ''}
                  ${eventVenue ? `<li><strong>Venue:</strong> ${eventVenue}</li>` : ''}
                </ul>
              </div>
              
              ${!customMessage ? `
              <p><strong>What's Next?</strong></p>
              <ul style="line-height: 2;">
                <li>✅ Check your email for further updates</li>
                <li>✅ Join our WhatsApp group (link will be shared soon)</li>
                <li>✅ Prepare to ship something amazing!</li>
              </ul>
              ` : ''}
              
              ${certificateUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${certificateUrl}" class="button">📜 Download Certificate</a>
              </div>
              ` : ''}
              
              <p>If you have any questions, reach out at <a href="mailto:hello@scify-tech.com" style="color: #DC2626;">hello@scify-tech.com</a></p>
              
              <p style="margin-top: 30px;">
                <strong>Team AKATSUKI</strong><br>
                Scify Technologies Pvt Ltd
              </p>
            </div>
            <div class="footer">
              <p><strong>© ${new Date().getFullYear()} AKATSUKI - Scify Technologies</strong></p>
              <p>7-Day Execution Sprints for Next-Gen Innovators</p>
              <p style="margin-top: 15px; font-size: 11px; color: #999;">
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via AWS SES SDK
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: certificateUrl 
            ? `Certificate: ${eventTitle}` 
            : `Registration Confirmed: ${eventTitle}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: emailHtml,
            Charset: 'UTF-8',
          },
        },
      },
    })

    const result = await sesClient.send(command)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via AWS SES',
        messageId: result.MessageId
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    )
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    )
  }
})
