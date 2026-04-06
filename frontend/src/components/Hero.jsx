export default function Hero({ info }) {
  return (
    <section id="top" className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            Deep learning · Computer vision
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight">
            Who painted <span className="italic text-accent">that?</span>
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-xl">
            Upload any painting and a fine-tuned ResNet34 will guess the artist — trained on thousands
            of works from {info?.num_artists ?? '—'} famous painters, from Van Gogh to Vermeer.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#demo" className="px-6 py-3 rounded-full bg-ink text-canvas font-semibold hover:bg-accent transition">
              Try the demo
            </a>
            <a href="#how" className="px-6 py-3 rounded-full border border-ink/20 font-semibold hover:border-accent hover:text-accent transition">
              How it works
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-accent/20 via-amber-200/40 to-ink/5 border border-ink/10 shadow-xl overflow-hidden flex items-center justify-center">
            <div className="text-center p-8">
              <div className="font-display text-7xl text-accent">🎨</div>
              <p className="mt-4 font-display text-2xl">ResNet34</p>
              <p className="text-sm text-ink/60 mt-1">Fine-tuned on the 50 Artists dataset</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
