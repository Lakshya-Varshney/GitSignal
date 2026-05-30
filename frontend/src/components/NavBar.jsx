import { Link, useLocation } from 'react-router-dom'

export default function NavBar({ scanning }) {
  const loc = useLocation()
  const isResults = loc.pathname === '/results'

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="nav-logo-icon">◈</span>
        <span className="nav-logo-text">GitSignal</span>
      </Link>

      <div className="nav-right">
        {scanning && (
          <div className="nav-scanning">
            <span className="nav-scan-dot" />
            scanning...
          </div>
        )}
        {isResults && (
          <Link to="/" className="nav-new-scan">← new scan</Link>
        )}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="nav-gh"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  )
}
