const steps = [
  {
    n: '01',
    title: 'Dataset curation',
    body: 'Started from a Kaggle collection of ~50 painters. Kept only artists with 100+ works to avoid starving rare classes.',
  },
  {
    n: '02',
    title: 'Preprocessing',
    body: 'Images resized to 224×224 and normalized with ImageNet statistics so the pretrained ResNet34 sees inputs in its expected distribution.',
  },
  {
    n: '03',
    title: 'Transfer learning',
    body: 'Loaded ResNet34 with ImageNet weights and swapped the final FC layer for an N-class classifier over the remaining artists.',
  },
  {
    n: '04',
    title: 'Training & evaluation',
    body: 'Cross-entropy with class-balanced weights, Adam optimizer, held-out test split, best checkpoint saved by test accuracy.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink/10">
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">How it works</h2>
      <p className="text-ink/70 mb-12 max-w-2xl">
        A transfer-learning pipeline that fine-tunes a pretrained CNN on painting-style features.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl bg-white border border-ink/10 p-6 hover:border-accent transition">
            <div className="font-display text-3xl text-accent mb-2">{s.n}</div>
            <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
            <p className="text-ink/70 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
