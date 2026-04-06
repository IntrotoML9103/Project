export default function Footer() {
  return (
    <footer className="border-t border-ink/10 py-10 text-center text-sm text-ink/60">
      <p>Built with PyTorch, FastAPI, and React. © {new Date().getFullYear()}</p>
    </footer>
  )
}
