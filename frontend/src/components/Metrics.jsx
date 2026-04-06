export default function Metrics({ info }) {
  const stats = [
    { label: 'Architecture', value: info?.architecture ?? 'ResNet34' },
    { label: 'Artists', value: info?.num_artists ?? '—' },
    { label: 'Test accuracy', value: info?.test_accuracy != null ? `${(info.test_accuracy * 100).toFixed(1)}%` : '—' },
    { label: 'Training images', value: info?.num_train ?? '—' },
  ]

  return (
    <section id="metrics" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink/10">
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">By the numbers</h2>
      <p className="text-ink/70 mb-12">Live stats pulled from the running model server.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-ink/10 p-6 text-center">
            <div className="font-display text-4xl font-bold text-accent">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-ink/60 mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {info?.artists?.length > 0 && (
        <div className="mt-12">
          <h3 className="text-sm uppercase tracking-wider text-ink/60 mb-4">Artists the model knows</h3>
          <div className="flex flex-wrap gap-2">
            {info.artists.map((a) => (
              <span key={a} className="text-xs px-3 py-1 rounded-full bg-ink/5 border border-ink/10">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
