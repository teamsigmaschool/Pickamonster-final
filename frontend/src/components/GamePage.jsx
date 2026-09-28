import { useState } from 'react'
import { apiFetch } from '../api'
import CardView from './CardView'

const WINNER_TEXT = { player: 'You take the round.', cpu: 'The computer takes it.', tie: 'A tie. Both cards go back.' }
const RESULT_TEXT = { win: 'You win!', lose: 'The computer wins.', draw: 'A draw.' }

function GamePage() {
  const [playerName, setPlayerName] = useState('')
  const [game, setGame] = useState(null)
  const [reveal, setReveal] = useState(null)
  const [status, setStatus] = useState('')

  async function startGame(event) {
    event.preventDefault()
    setStatus('')
    try {
      const data = await apiFetch('/api/games', { method: 'POST', body: { playerName } })
      setGame(data)
      setReveal(null)
    } catch (err) {
      setStatus(err.message)
    }
  }

  // stat is empty when it is the computer's turn to pick.
  async function playRound(stat) {
    setStatus('')
    try {
      const data = await apiFetch(`/api/games/${game.id}/rounds`, {
        method: 'POST',
        body: { stat },
      })
      setReveal({
        playerCard: data.playerCard,
        cpuCard: data.cpuCard,
        stat: data.stat,
        winner: data.winner,
      })
      setGame({ ...data, id: game.id })
    } catch (err) {
      setStatus(err.message)
    }
  }

  if (!game) {
    return (
      <form className="start" onSubmit={startGame}>
        <p className="eyebrow">New game</p>
        <h1>You against the computer</h1>
        <label htmlFor="playerName">Your name for the leaderboard</label>
        <input id="playerName" value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
        <button type="submit">Deal the cards</button>
        {status && <p className="status">{status}</p>}
      </form>
    )
  }

  const cpuTurn = game.picker === 'cpu'

  return (
    <div className="table">
      <p className="scoreline">
        Round {game.round} of {game.maxRounds} · Your pile {game.playerCount} · Computer's pile {game.cpuCount}
      </p>

      <div className="duel">
        <div>
          <p className="eyebrow">Your card</p>
          {reveal && <CardView card={reveal.playerCard} chosenStat={reveal.stat} />}
          {!reveal && <CardView card={game.topCard} onPick={cpuTurn ? null : playRound} />}
        </div>
        <div>
          <p className="eyebrow">Computer</p>
          {reveal && <CardView card={reveal.cpuCard} chosenStat={reveal.stat} />}
          {!reveal && <CardView faceDown />}
        </div>
      </div>

      <div className="call">
        {!reveal && !cpuTurn && <p>Pick a stat on your card.</p>}
        {!reveal && cpuTurn && (
          <>
            <p>The computer won the last round, so it picks.</p>
            <button onClick={() => playRound('')}>Let the computer pick</button>
          </>
        )}
        {reveal && !game.over && (
          <>
            <p>{reveal.stat}: {reveal.playerCard[reveal.stat]} against {reveal.cpuCard[reveal.stat]}. {WINNER_TEXT[reveal.winner]}</p>
            <button onClick={() => setReveal(null)}>Next round</button>
          </>
        )}
        {game.over && (
          <>
            <h2>{RESULT_TEXT[game.result]}</h2>
            <p>Saved to the leaderboard as {playerName}.</p>
            <button onClick={() => setGame(null)}>Play again</button>
          </>
        )}
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  )
}

export default GamePage
