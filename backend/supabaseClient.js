const { createClient } = require('@supabase/supabase-js')

// Only used to ask Supabase "who does this token belong to?".
// Publishable key, never the secret one.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

module.exports = supabase
