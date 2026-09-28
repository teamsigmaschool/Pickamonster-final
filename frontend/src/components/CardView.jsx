const STATS = ['power', 'speed', 'charm']

// One card. Face down shows only the back.
// Pass onPick to turn the three stats into buttons.
function CardView({ card, faceDown, onPick, chosenStat }) {
  if (faceDown) {
    return (
      <article className="card card-back" aria-label="Face-down card">
        <span>?</span>
      </article>
    )
  }

  return (
    <article className="card">
      <img src={card.image_url} alt={card.name} />
      <h3>{card.name}</h3>
      <ul>
        {STATS.map((stat) => (
          <li key={stat} className={stat === chosenStat ? 'chosen' : ''}>
            {onPick ? (
              <button onClick={() => onPick(stat)}>
                <span>{stat}</span>
                <b>{card[stat]}</b>
              </button>
            ) : (
              <>
                <span>{stat}</span>
                <b>{card[stat]}</b>
              </>
            )}
            <i style={{ width: `${card[stat]}%` }}></i>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default CardView
