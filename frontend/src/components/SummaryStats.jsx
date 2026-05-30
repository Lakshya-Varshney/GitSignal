export default function SummaryStats({ summary, repoName, total }) {
  const score = summary.mean_cognitive_score
  const scoreColor = score >= 0.6 ? '#3fb950' : score >= 0.35 ? '#d29922' : '#f85149'
  const grade = score >= 0.70 ? 'A'
    : score >= 0.55 ? 'B'
      : score >= 0.40 ? 'C'
        : score >= 0.25 ? 'D'
          : 'F'
  const verdict = score >= 0.6
    ? 'High engagement - humans appear to understand their commits.'
    : score >= 0.35
      ? 'Mixed signals - some genuine review, significant rubber-stamping detected.'
      : 'Low engagement - repository shows signs of widespread blind AI acceptance.'

  return (
    <div className="summary-bar">
      <div className="summary-header">
        <span className="repo-name">{repoName}</span>
        <span className="commits-analyzed">{total} commits analyzed</span>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Health grade"
          value={grade}
          color={scoreColor}
          mono
        />
        <StatCard
          label="Mean cognitive score"
          value={score.toFixed(3)}
          color={scoreColor}
          mono
        />
        <StatCard
          label="High engagement commits"
          value={`${summary.high_engagement_pct}%`}
          color="#3fb950"
          mono
        />
        <StatCard
          label="Paste and pray commits"
          value={summary.paste_and_pray_count}
          color="#f85149"
          mono
        />
        <StatCard
          label="Rubber stamp commits"
          value={summary.rubber_stamp_count}
          color="#d29922"
          mono
        />
        <StatCard
          label="Collapse events"
          value={summary.collapse_events?.length || 0}
          color={summary.collapse_events?.length ? '#f85149' : '#3fb950'}
          mono
        />
      </div>

      <div className="verdict-bar" style={{ borderLeftColor: scoreColor }}>
        <span className="verdict-icon">◈</span>
        <span className="verdict-text">{verdict}</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, mono }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span
        className="stat-value"
        style={{ color, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }}
      >
        {value}
      </span>
    </div>
  )
}
