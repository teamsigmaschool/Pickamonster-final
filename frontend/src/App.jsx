import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import DeckPage from './components/DeckPage'
import GamePage from './components/GamePage'
import Leaderboard from './components/Leaderboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('deck')

  // No login form: every visitor gets a quiet anonymous session,
  // the same way the dish photos worked.
  useEffect(() => {
    async function ensureSession() {
      const { data } = await supabase.auth.getSession()
      if (data.session) return setUser(data.session.user)

      const { data: anon, error } = await supabase.auth.signInAnonymously()
      if (!error) setUser(anon.user)
    }
    ensureSession()
  }, [])

  return (
    <>
      <header className="site-header">
        <p className="wordmark">Pickamonster</p>
        <nav>
          <button className={page === 'deck' ? 'active' : ''} onClick={() => setPage('deck')}>Deck</button>
          <button className={page === 'play' ? 'active' : ''} onClick={() => setPage('play')}>Play</button>
          <button className={page === 'leaderboard' ? 'active' : ''} onClick={() => setPage('leaderboard')}>Leaderboard</button>
        </nav>
      </header>

      <main>
        {!user && <p className="status">Getting your seat at the table...</p>}
        {user && page === 'deck' && <DeckPage user={user} />}
        {user && page === 'play' && <GamePage />}
        {user && page === 'leaderboard' && <Leaderboard />}
      </main>
    </>
  )
}

export default App
