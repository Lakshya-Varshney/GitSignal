import { useInView } from 'react-intersection-observer'

export default function SignalCard({ signal, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={`signal-card ${inView ? 'in-view' : ''}`}
      style={{ '--delay': `${index * 0.08}s`, '--accent': signal.color }}
    >
      <div className="sc-top">
        <span className="sc-id">{signal.id}</span>
        <span className="sc-icon" style={{ color: signal.color }}>{signal.icon}</span>
      </div>
      <h3 className="sc-name" style={{ color: signal.color }}>{signal.name}</h3>
      <p className="sc-desc">{signal.desc}</p>
      <div className="sc-bar">
        <div className="sc-bar-fill" style={{ background: signal.color }} />
      </div>
    </div>
  )
}
