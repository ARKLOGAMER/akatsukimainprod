const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }
}

export const getAuthHeaders = (token) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
})
