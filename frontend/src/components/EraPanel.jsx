export default function EraPanel({ eraSplit }) {
  if (!eraSplit) return null

  const { pre_ai, post_ai, delta, delta_pct, verdict } = eraSplit
  const declined = delta < 0
  const deltaColor = delta < -0.1 ? '#f85149' : delta < 0 ? '#d29922' : '#3fb950'

  const verdictLabel = {
    significant_decline: '⚠ Significant cognitive decline post-AI tools',
    moderate_decline: '◌ Moderate decline detected post-AI tools',
    stable: '→ Cognitive engagement stable across AI era boundary',
    improvement: '↑ Engagement improved post-AI tools adoption'
  }[verdict] || ''

  return (
    <div className="era-panel">
      <div className="era-header">
        <span className="section-eyebrow">AI era analysis</span>
        <span className="era-cutoff-label">GPT-4 release: March 14, 2023</span>
      </div>

      <div className="era-columns">
        <div className="era-col era-col-pre">
          <div className="era-col-label">Before AI tools</div>
          <div className="era-col-score" style={{ color: '#3fb950' }}>
            {pre_ai.mean_score.toFixed(3)}
          </div>
          <div className="era-col-sub">mean cognitive score</div>
          <div className="era-stats-mini">
            <span>{pre_ai.commit_count} commits</span>
            <span>{pre_ai.high_engagement_pct}% high engagement</span>
            <span>{pre_ai.paste_and_pray_pct}% paste and pray</span>
          </div>
        </div>

        <div className="era-delta-col">
          <div className="era-arrow" style={{ color: deltaColor }}>
            {declined ? '↘' : '↗'}
          </div>
          <div className="era-delta-val" style={{ color: deltaColor }}>
            {delta > 0 ? '+' : ''}{delta_pct.toFixed(1)}%
          </div>
          <div className="era-delta-label">change</div>
        </div>

        <div className="era-col era-col-post">
          <div className="era-col-label">After AI tools</div>
          <div className="era-col-score" style={{ color: deltaColor }}>
            {post_ai.mean_score.toFixed(3)}
          </div>
          <div className="era-col-sub">mean cognitive score</div>
          <div className="era-stats-mini">
            <span>{post_ai.commit_count} commits</span>
            <span>{post_ai.high_engagement_pct}% high engagement</span>
            <span>{post_ai.paste_and_pray_pct}% paste and pray</span>
          </div>
        </div>
      </div>

      <div className="era-verdict" style={{ borderLeftColor: deltaColor }}>
        {verdictLabel}
      </div>
    </div>
  )
}
