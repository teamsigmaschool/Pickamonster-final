import { supabase } from './supabaseClient'

// Every call to our Express backend goes through here.
// It attaches the current session token, sends JSON, and turns an error
// response into a thrown Error carrying the backend's own message.
export async function apiFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session ? data.session.access_token : ''

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Something went wrong.')
  return result
}
