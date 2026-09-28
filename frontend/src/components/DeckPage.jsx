import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import AddCardForm from './AddCardForm'
import CardView from './CardView'

const MIN_CARDS = 6

function DeckPage({ user }) {
  const [cards, setCards] = useState([])
  const [status, setStatus] = useState('Loading the deck...')

  useEffect(() => {
    async function loadCards() {
      try {
        const data = await apiFetch('/api/cards')
        setCards(data)
        setStatus('')
      } catch (err) {
        setStatus(err.message)
      }
    }
    loadCards()
  }, [])

  function handleAdded(newCard) {
    setCards([...cards, newCard])
  }

  let deckNote = `${cards.length} cards in the deck. Ready to play.`
  if (cards.length < MIN_CARDS) {
    deckNote = `${cards.length} cards in the deck. Add ${MIN_CARDS - cards.length} more to play.`
  }

  return (
    <div className="deck-page">
      <section>
        <p className="eyebrow">The deck</p>
        <h1>{deckNote}</h1>
        {status && <p className="status">{status}</p>}
        <div className="card-grid">
          {cards.map((card) => (
            <CardView key={card.id} card={card} />
          ))}
        </div>
      </section>
      <AddCardForm user={user} onAdded={handleAdded} />
    </div>
  )
}

export default DeckPage
