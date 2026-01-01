-- Create function to trigger email on RSVP insert
CREATE OR REPLACE FUNCTION send_rsvp_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
BEGIN
  -- Get event details
  SELECT * INTO event_record FROM events WHERE id = NEW.event_id;
  
  -- Call edge function to send email (using pg_net extension)
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-rsvp-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', NEW.full_name,
        'eventTitle', event_record.title,
        'eventDate', event_record.start_date::text,
        'eventVenue', event_record.venue_or_link
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS rsvp_email_trigger ON rsvps;
CREATE TRIGGER rsvp_email_trigger
  AFTER INSERT ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION send_rsvp_confirmation_email();
