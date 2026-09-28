import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { apiFetch } from '../api'

function AddCardForm({ user, onAdded }) {
  const [form, setForm] = useState({ name: '', power: '', speed: '', charm: '' })
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      setStatus('Pick the card art first.')
      return
    }

    // 1. The art goes to Storage, into this user's own folder.
    setStatus('Uploading the art...')
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('card-art')
      .upload(path, file)
    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`)
      return
    }
    const { data: urlData } = supabase.storage.from('card-art').getPublicUrl(path)

    // 2. The card goes to our backend, which checks the stats before saving.
    try {
      const newCard = await apiFetch('/api/cards', {
        method: 'POST',
        body: {
          name: form.name,
          power: Number(form.power),
          speed: Number(form.speed),
          charm: Number(form.charm),
          image_url: urlData.publicUrl,
          image_path: path,
        },
      })
      onAdded(newCard)
      setForm({ name: '', power: '', speed: '', charm: '' })
      setFile(null)
      event.target.reset() // also clears the file picker, which state cannot do
      setStatus(`${newCard.name} joined the deck.`)
    } catch (err) {
      setStatus(err.message)
    }
  }

  return (
    <aside className="add-card">
      <p className="eyebrow">New card</p>
      <h2>Add a card</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Example: Kappa" />

        <div className="stat-inputs">
          <label htmlFor="power">Power<input id="power" name="power" type="number" value={form.power} onChange={handleChange} /></label>
          <label htmlFor="speed">Speed<input id="speed" name="speed" type="number" value={form.speed} onChange={handleChange} /></label>
          <label htmlFor="charm">Charm<input id="charm" name="charm" type="number" value={form.charm} onChange={handleChange} /></label>
        </div>

        <label htmlFor="art">Card art</label>
        <input id="art" type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])} />

        <button type="submit">Add to deck</button>
      </form>
      {status && <p className="status">{status}</p>}
    </aside>
  )
}

export default AddCardForm
