import { useEffect, useState } from 'react'

export default function LoadingScreen({ progress, stage, updatedAt }) {
  const percent = Number.isFinite(progress) ? progress : 0
  const label = stage || 'starting'
  const lastUpdated = updatedAt ? Math.max(0, Math.floor((Date.now() / 1000) - updatedAt)) : null
  const [displayPct, setDisplayPct] = useState(percent)

  useEffect(() => {
    if (percent > 0) {
      setDisplayPct(percent)
      return
    }

    if (!label.includes('cloning') && !label.includes('collecting')) {
      setDisplayPct(0)
      return
    }

    if (lastUpdated === null || lastUpdated < 8) {
      setDisplayPct(0)
      return
    }

    const start = displayPct || 0
    const target = 15
    const duration = 20000
    const startTime = Date.now()
    let raf

    const tick = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const next = Math.min(target, Math.round(start + (target - start) * t))
      setDisplayPct(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [percent, label, lastUpdated, displayPct])

  return (
    <div className="fullscreen-loader">
      <div className="fl-logo">◈</div>
      <div className="fl-progress">
        <span className="fl-progress-pct">{displayPct}%</span>
        <span className="fl-progress-stage">{label}</span>
      </div>
      <div className="fl-bar-wrap">
        <div className="fl-bar" style={{ width: `${displayPct}%` }} />
      </div>
      {lastUpdated !== null && (
        <p className="fl-eta">last update {lastUpdated}s ago</p>
      )}
      <p className="fl-sub">analyzing behavioral signals — not reading your code</p>
    </div>
  )
}
