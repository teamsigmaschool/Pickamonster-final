require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./db')
const { verifySession } = require('./middleware')
const { checkCard, checkPlayerName } = require('./validation')
const { STATS, MIN_CARDS, newGame, cpuPick, playRound, publicView } = require('./game')

const app = express()
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.use(express.json())

// Games in progress live in memory, keyed by id. A finished game is saved
// to the games table. If the server restarts, unfinished games are lost.
const games = {}
let nextGameId = 1

// ---- Cards ----

app.get('/api/cards', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, power, speed, charm, image_url FROM cards ORDER BY id',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not load the cards.' })
  }
})

app.post('/api/cards', verifySession, async (req, res) => {
  const problem = checkCard(req.body)
  if (problem) return res.status(400).json({ error: problem })

  const { name, power, speed, charm, image_url, image_path } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO cards (name, power, speed, charm, image_url, image_path, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, power, speed, charm, image_url`,
      [name.trim(), power, speed, charm, image_url, image_path, req.user.id],
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not save the card.' })
  }
})

// ---- Games ----

app.post('/api/games', verifySession, async (req, res) => {
  const problem = checkPlayerName(req.body.playerName)
  if (problem) return res.status(400).json({ error: problem })

  try {
    const result = await pool.query(
      'SELECT id, name, power, speed, charm, image_url FROM cards',
    )
    const cards = result.rows
    if (cards.length < MIN_CARDS) {
      const missing = MIN_CARDS - cards.length
      return res.status(400).json({
        error: `You need at least ${MIN_CARDS} cards to play. Add ${missing} more.`,
      })
    }

    const id = nextGameId
    nextGameId = nextGameId + 1
    games[id] = newGame(cards, req.user.id, req.body.playerName.trim())
    res.status(201).json({ id, ...publicView(games[id]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not start a game.' })
  }
})

app.post('/api/games/:id/rounds', verifySession, async (req, res) => {
  const game = games[req.params.id]
  if (!game || game.playerId !== req.user.id) {
    return res.status(404).json({ error: 'Game not found. Start a new one.' })
  }

  // Whoever won the last round picks. The computer picks its best stat.
  let stat = req.body.stat
  if (game.picker === 'cpu') {
    stat = cpuPick(game.cpu[0])
  } else if (!STATS.includes(stat)) {
    return res.status(400).json({ error: `Pick one of: ${STATS.join(', ')}.` })
  }

  const round = playRound(game, stat)

  if (game.over) {
    try {
      await pool.query(
        `INSERT INTO games (player_id, player_name, result, rounds, cards_left)
         VALUES ($1, $2, $3, $4, $5)`,
        [game.playerId, game.playerName, game.result, game.round, game.player.length],
      )
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'The game ended but the result was not saved.' })
    }
    games[req.params.id] = null // finished, so it cannot be played again
  }

  res.json({ ...round, ...publicView(game) })
})

// ---- Leaderboard ----

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT player_name, COUNT(*)::int AS wins
       FROM games
       WHERE result = 'win'
       GROUP BY player_id, player_name
       ORDER BY wins DESC, player_name
       LIMIT 10`,
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not load the leaderboard.' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Pickamonster backend running on http://localhost:${port}`))
