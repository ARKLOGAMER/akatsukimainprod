# Akatsuki Series Platform

A fast, single-page event platform for the Akatsuki Series where students can view events, register instantly, and admins can manage RSVPs through a clean dashboard.

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Supabase (PostgREST + GoTrue + Storage)
- **Routing**: React Router DOM

## Features

### Public Side
- Hero section with live enrollment counter
- About section
- Event list with tabs (Live/Upcoming/Closed)
- Event detail modal
- RSVP form with validation
- Real-time enrollment updates

### Admin Side
- Secure admin login
- Event dashboard with tabs:
  - **Overview**: KPIs, stats, latest registrations
  - **Guests**: Full RSVP list with filters, search, and CSV export
  - **Form Builder**: Customize registration form fields
  - **Settings**: Update event details

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL in `supabase-setup.sql` in your Supabase SQL Editor
3. Create an admin user in Supabase Authentication
4. Copy your project URL and anon key

### 3. Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The build output is in the `dist` folder after running `npm run build`.

## Database Schema

### events
- id, title, poster_url, description
- start_date, end_date, status
- fee, seats, venue_or_link
- created_at

### rsvps
- id, event_id, full_name, email, phone
- age, college, department, reason
- payment_screenshot_url, status
- created_at

### form_schema
- event_id, schema_json, updated_at

### admins
- id, email, name, created_at

## API Endpoints

All endpoints use Supabase REST API:

- `GET /rest/v1/events` - List all events
- `GET /rest/v1/events?id=eq.<ID>` - Get event details
- `POST /rest/v1/rsvps` - Create RSVP
- `GET /rest/v1/rsvps?event_id=eq.<ID>` - List RSVPs (admin)
- `PATCH /rest/v1/rsvps?id=eq.<ID>` - Update RSVP status (admin)
- `PATCH /rest/v1/events?id=eq.<ID>` - Update event (admin)
- `POST /auth/v1/token` - Admin login

## Security

- Row Level Security (RLS) enabled on all tables
- Public can only read events and insert RSVPs
- Admins have full access with JWT authentication
- All admin routes protected with token validation

## License

MIT
