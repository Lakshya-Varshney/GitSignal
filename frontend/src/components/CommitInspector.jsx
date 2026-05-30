import { format } from 'date-fns'

const FLAG_META = {
  paste_and_pray: {
    label: 'Paste and pray',
    color: '#f85149',
    desc: 'Large bulk insertion with no corresponding tests. Classic blindly-accepted AI output.'
  },
  rubber_stamp: {
    label: 'Rubber stamp',
    color: '#f85149',
    desc: 'Near-zero cognitive engagement signal across all dimensions.'
  },
  test_desert: {
    label: 'Test desert',
    color: '#d29922',
    desc: 'Significant code changes with zero test coverage added.'
  },
  silent_commit: {
    label: 'Silent commit',
    color: '#d29922',
    desc: 'Commit message provides no signal about what changed or why.'
  },
  deep_refactor: {
    label: 'Deep refactor',
    color: '#3fb950',
    desc: 'Multiple renames or restructures detected - strong sign of genuine comprehension.'
  },
  test_driven: {
    label: 'Test-driven',
    color: '#3fb950',
    desc: 'Tests represent 40%+ of changed files - high cognitive engagement.'
  }
}

export default function CommitInspector({ commit, onClose }) {
  const diff = commit.diff || {}
  const date = format(new Date(commit.timestamp), 'PPpp')
  const scoreColor = commit.cognitive_score >= 0.6
    ? '#3fb950'
    : commit.cognitive_score >= 0.35
      ? '#d29922'
      : '#f85149'

  return (
    <div className="inspector-card">
      <div className="inspector-header">
        <div>
          <span className="sha-badge">{commit.sha}</span>
          <span className="inspector-author">{commit.author}</span>
          <span className="inspector-date">{date}</span>
        </div>
        <button className="close-btn" onClick={onClose}>x</button>
      </div>

      <p className="inspector-message">"{commit.message}"</p>

      <div className="score-breakdown">
        <ScoreBar label="Overall cognitive score" value={commit.cognitive_score} max={1} color={scoreColor} />
        <ScoreBar label="Semantic novelty" value={commit.semantic_novelty} max={1} color="#a5a3e8" />
        <ScoreBar label="Message quality" value={commit.message_quality} max={1} color="#58a6ff" />
      </div>

      <div className="diff-stats">
        <DiffStat label="Files changed" value={diff.files_changed_count} />
        <DiffStat label="Additions" value={`+${diff.total_additions}`} color="#3fb950" />
        <DiffStat label="Deletions" value={`-${diff.total_deletions}`} color="#f85149" />
        <DiffStat label="Test files" value={diff.test_files_changed} color="#58a6ff" />
        <DiffStat label="Renames" value={diff.rename_count} color="#d29922" />
        <DiffStat label="Comment lines added" value={diff.comment_lines_added} />
        <DiffStat
          label="Bulk insertion"
          value={diff.bulk_insertion_detected ? 'YES' : 'no'}
          color={diff.bulk_insertion_detected ? '#f85149' : '#3fb950'}
        />
      </div>

      {commit.flags?.length > 0 && (
        <div className="flag-section">
          <span className="flag-section-label">Signals detected</span>
          <div className="flag-list-inline">
            {commit.flags.map((flag) => {
              const meta = FLAG_META[flag] || { label: flag, color: '#8b949e', desc: '' }
              return (
                <div key={flag} className="flag-chip" style={{ borderColor: meta.color }}>
                  <span className="flag-chip-label" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="flag-chip-desc">{meta.desc}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-bar-val" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value.toFixed(3)}
      </span>
    </div>
  )
}

function DiffStat({ label, value, color }) {
  return (
    <div className="diff-stat-item">
      <span className="diff-stat-label">{label}</span>
      <span
        className="diff-stat-val"
        style={{ color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  )
}
