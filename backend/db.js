const { Pool } = require('pg')

// One pool for the whole app, same as before: the Session pooler
// connection string from Supabase, over SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// If the database drops a connection the pool is holding (a restart, a
// timeout), log it. Without this line, that error crashes the whole server.
pool.on('error', (err) => console.error('Database connection dropped:', err.message))

module.exports = pool
