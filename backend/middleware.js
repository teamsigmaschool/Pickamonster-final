const supabase = require('./supabaseClient')

// Protects a route. The frontend sends its Supabase session token in the
// Authorization header, Supabase tells us who it belongs to, and the rest of
// the route can read req.user.id.
async function verifySession(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Missing Authorization header.' })

  const token = header.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Your session has expired. Refresh the page.' })

  req.user = { id: data.user.id }
  next()
}

module.exports = { verifySession }
