// Everything about how a game of Pickamonster is played, and nothing else.
// No Express, no database. That keeps the rules in one place.

const STATS = ['power', 'speed', 'charm']
const MIN_CARDS = 6
const MAX_ROUNDS = 20

// Fisher-Yates shuffle: walk from the back, swap each card with a random
// card at or before it. Every order is equally likely.
function shuffle(cards) {
  const deck = [...cards]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }
  return deck
}

function newGame(cards, playerId, playerName) {
  const deck = shuffle(cards)
  const half = Math.floor(deck.length / 2)
  return {
    playerId,
    playerName,
    player: deck.slice(0, half),
    cpu: deck.slice(half, half * 2), // an odd card left over sits this game out
    round: 0,
    picker: 'player',
    over: false,
    result: null,
  }
}

// The computer always picks its best stat on the card it is holding.
function cpuPick(card) {
  let best = STATS[0]
  for (let i = 1; i < STATS.length; i++) {
    if (card[STATS[i]] > card[best]) best = STATS[i]
  }
  return best
}

function playRound(game, stat) {
  // Take the top card off each pile.
  const playerCard = game.player[0]
  const cpuCard = game.cpu[0]
  game.player = game.player.slice(1)
  game.cpu = game.cpu.slice(1)

  let winner = 'tie'
  if (playerCard[stat] > cpuCard[stat]) winner = 'player'
  if (cpuCard[stat] > playerCard[stat]) winner = 'cpu'

  // Winner takes both cards to the bottom of their pile.
  // A tie: each side keeps its own card, also to the bottom.
  if (winner === 'player') {
    game.player.push(playerCard, cpuCard)
  } else if (winner === 'cpu') {
    game.cpu.push(cpuCard, playerCard)
  } else {
    game.player.push(playerCard)
    game.cpu.push(cpuCard)
  }

  game.round = game.round + 1
  if (winner !== 'tie') game.picker = winner

  if (game.player.length === 0 || game.cpu.length === 0 || game.round === MAX_ROUNDS) {
    game.over = true
    if (game.player.length > game.cpu.length) game.result = 'win'
    else if (game.player.length < game.cpu.length) game.result = 'lose'
    else game.result = 'draw'
  }

  return { stat, playerCard, cpuCard, winner }
}

// What the browser is allowed to see. Never the computer's pile.
function publicView(game) {
  return {
    round: game.round,
    maxRounds: MAX_ROUNDS,
    playerCount: game.player.length,
    cpuCount: game.cpu.length,
    topCard: game.over ? null : game.player[0], // the card on top of your pile
    picker: game.picker,
    over: game.over,
    result: game.result,
  }
}

module.exports = { STATS, MIN_CARDS, newGame, cpuPick, playRound, publicView }
