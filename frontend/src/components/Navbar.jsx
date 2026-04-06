export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-canvas/80 border-b border-ink/10">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-xl font-bold tracking-tight">
          Artist<span className="text-accent">ML</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          <li><a href="#demo" className="hover:text-accent transition">Demo</a></li>
          <li><a href="#how" className="hover:text-accent transition">How it works</a></li>
          <li><a href="#metrics" className="hover:text-accent transition">Metrics</a></li>
          <li><a href="#about" className="hover:text-accent transition">About</a></li>
        </ul>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold px-4 py-2 rounded-full bg-ink text-canvas hover:bg-accent transition"
        >
          GitHub
        </a>
      </nav>
    </header>
  )
}
