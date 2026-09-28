import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

function Leaderboard() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await apiFetch('/api/leaderboard')
        setRows(data)
        setStatus(data.length === 0 ? 'No wins yet. Be the first.' : '')
      } catch (err) {
        setStatus(err.message)
      }
    }
    loadLeaderboard()
  }, [])

  return (
    <section className="leaderboard">
      <p className="eyebrow">Top 10</p>
      <h1>Leaderboard</h1>
      {status && <p className="status">{status}</p>}
      <ol>
        {rows.map((row, index) => (
          <li key={index}>
            <span>{row.player_name}</span>
            <b>{row.wins} {row.wins === 1 ? 'win' : 'wins'}</b>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Leaderboard
