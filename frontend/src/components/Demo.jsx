import { useState } from 'react'
import { predictImage } from '../api'

export default function Demo() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [dragging, setDragging] = useState(false)

  function onFile(f) {
    if (!f) return
    setFile(f)
    setResults(null)
    setError('')
    setPreview(URL.createObjectURL(f))
  }

  async function onPredict() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await predictImage(file)
      setResults(data.predictions)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="demo" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink/10">
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">Live demo</h2>
      <p className="text-ink/70 mb-10">Drop in a painting and see the model's top 5 guesses.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div
          className={`relative rounded-2xl border-2 border-dashed transition
            ${dragging ? 'border-accent bg-accent/5' : 'border-ink/20 bg-white'}
            min-h-[360px] flex items-center justify-center overflow-hidden`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            onFile(e.dataTransfer.files?.[0])
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-contain max-h-[460px]" />
          ) : (
            <div className="text-center p-8">
              <div className="text-5xl mb-3">🖼️</div>
              <p className="font-semibold">Drag & drop a painting</p>
              <p className="text-sm text-ink/60 mt-1">or click to choose a file</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex flex-col">
          <button
            onClick={onPredict}
            disabled={!file || loading}
            className="w-full px-6 py-3 rounded-full bg-ink text-canvas font-semibold disabled:opacity-40 hover:bg-accent transition"
          >
            {loading ? 'Analyzing…' : 'Identify the artist'}
          </button>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="mt-6 flex-1">
            {results ? (
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-ink/60">
                  Top predictions
                </h3>
                <ul className="space-y-3">
                  {results.map((r, i) => (
                    <li key={r.artist}>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className={i === 0 ? 'text-accent font-bold' : ''}>
                          {i === 0 && '★ '}{r.artist}
                        </span>
                        <span>{(r.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${i === 0 ? 'bg-accent' : 'bg-ink/40'} transition-all`}
                          style={{ width: `${r.confidence * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-ink/50 italic mt-6">
                Predictions will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
