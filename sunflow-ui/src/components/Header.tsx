import { Sun } from 'lucide-react'

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <a href="/" className="header-brand">
          <div className="header-logo">
            <Sun size={20} />
          </div>
          <h1 className="header-title">
            Sun<span>Flow</span> 360
          </h1>
        </a>
        <div className="header-right">
          <span className="header-badge">Hackathon Build</span>
        </div>
      </div>
    </header>
  )
}
