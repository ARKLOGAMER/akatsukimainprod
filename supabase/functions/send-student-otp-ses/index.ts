import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.645.0";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: dbError } = await supabase
      .from('student_otps')
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via AWS SES
    const sesClient = new SESClient({
      region: Deno.env.get('AWS_REGION') || 'ap-south-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 AKATSUKI Student Portal</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 15px 15px; border: 2px solid #e5e7eb;">
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 30px;">Your Login Code</h2>
          
          <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">
            <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; text-align: center; margin-top: 30px;">
            This code will expire in <strong style="color: #DC2626;">10 minutes</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const command = new SendEmailCommand({
      Source: Deno.env.get('FROM_EMAIL') || 'noreply@scify-tech.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: `Your AKATSUKI Login Code: ${otpCode}` },
        Body: {
          Html: { Data: emailHtml },
          Text: { Data: `Your AKATSUKI login code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.` }
        },
      },
    });

    await sesClient.send(command);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent to your email'
      }),
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
