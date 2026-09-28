const { STATS } = require('./game')

// Returns a message saying what is wrong, or null when the card is fine.
function checkCard(card) {
  if (typeof card.name !== 'string' || card.name.trim() === '') {
    return 'Give the card a name.'
  }
  if (card.name.trim().length > 30) return 'Keep the name to 30 characters or fewer.'

  for (let i = 0; i < STATS.length; i++) {
    const value = card[STATS[i]]
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      return `${STATS[i]} must be a whole number from 1 to 100.`
    }
  }

  if (typeof card.image_url !== 'string' || typeof card.image_path !== 'string') {
    return 'Every card needs its art.'
  }
  return null
}

function checkPlayerName(name) {
  if (typeof name !== 'string' || name.trim() === '') return 'Type a name for the leaderboard.'
  if (name.trim().length > 20) return 'Keep your name to 20 characters or fewer.'
  return null
}

module.exports = { checkCard, checkPlayerName }
