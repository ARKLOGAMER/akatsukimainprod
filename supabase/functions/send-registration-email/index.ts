import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.645.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, eventName, eventDate, eventTime, eventLocation } = await req.json();

    const sesClient = new SESClient({
      region: Deno.env.get('AWS_REGION') || 'ap-south-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Registration Confirmed! 🎉</h2>
        <p>Thank you for registering for <strong>${eventName}</strong>!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details:</h3>
          <p><strong>📅 Date:</strong> ${eventDate}</p>
          <p><strong>🕐 Time:</strong> ${eventTime}</p>
          <p><strong>📍 Location:</strong> ${eventLocation}</p>
        </div>
        
        <p>We look forward to seeing you there!</p>
        <p style="color: #6b7280; font-size: 14px;">If you have any questions, please reply to this email.</p>
      </div>
    `;

    const command = new SendEmailCommand({
      Source: Deno.env.get('FROM_EMAIL') || 'noreply@scify-tech.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: `Registration Confirmed: ${eventName}` },
        Body: {
          Html: { Data: emailHtml },
          Text: { Data: `Registration confirmed for ${eventName} on ${eventDate} at ${eventTime}. Location: ${eventLocation}` }
        },
      },
    });

    await sesClient.send(command);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
