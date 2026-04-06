const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function fetchInfo() {
  const res = await fetch(`${API_BASE}/info`)
  if (!res.ok) throw new Error('Failed to load model info')
  return res.json()
}

export async function predictImage(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: form })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || 'Prediction failed')
  }
  return res.json()
}
