import { useState } from 'react'
import { format } from 'date-fns'

export default function CollapseEventBanner({ events, onJumpTo }) {
  const [dismissed, setDismissed] = useState(false)
  if (!events?.length || dismissed) return null

  const worst = events.reduce((a, b) => (b.drop_magnitude > a.drop_magnitude ? b : a))
  const date = format(new Date(worst.timestamp * 1000), 'MMM d, yyyy')

  return (
    <div className="collapse-banner">
      <div className="cb-left">
        <span className="cb-icon">⚠</span>
        <div>
          <p className="cb-title">
            Cognitive collapse detected — {date}
          </p>
          <p className="cb-sub">
            Score dropped <strong>{(worst.drop_magnitude * 100).toFixed(0)} points</strong> over a 10-commit window.
            From {worst.score_before.toFixed(2)} → {worst.score_after.toFixed(2)}.
            {events.length > 1 && ` ${events.length} total collapse events found.`}
          </p>
        </div>
      </div>
      <div className="cb-right">
        <button className="cb-jump" onClick={() => onJumpTo(worst.commit_sha)}>
          Jump to commit ↓
        </button>
        <button className="cb-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  )
}
