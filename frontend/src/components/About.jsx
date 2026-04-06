const stack = [
  'PyTorch', 'torchvision', 'ResNet34', 'FastAPI', 'React', 'Vite', 'Tailwind CSS',
]

export default function About() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink/10">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">About the project</h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            This project started as a senior seminar paper exploring whether a machine learning model
            could learn the visual signatures that distinguish one painter from another. It has since
            grown into a full end-to-end application: a trained deep learning model, a Python API
            serving predictions, and a React frontend for exploration.
          </p>
          <p className="text-ink/70 leading-relaxed">
            The long-term vision: a tool that helps artists, students, and curators recognize
            stylistic influence — not just who painted something, but whose style a new work emulates.
          </p>
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold mb-4">Tech stack</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {stack.map((t) => (
              <span key={t} className="text-sm px-3 py-1 rounded-full bg-ink text-canvas">
                {t}
              </span>
            ))}
          </div>
          <h3 className="font-display text-2xl font-bold mb-4">Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="underline hover:text-accent">
                Source code on GitHub →
              </a>
            </li>
            <li>
              <a href="https://www.kaggle.com/code/paultimothymooney/collections-of-paintings-from-50-artists" target="_blank" rel="noreferrer" className="underline hover:text-accent">
                Dataset: Collections of Paintings from 50 Artists →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
