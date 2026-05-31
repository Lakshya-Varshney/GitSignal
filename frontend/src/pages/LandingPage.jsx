import { useState } from 'react'
import SignalCard from '../components/SignalCard'
import '../styles/landing.css'

const SIGNALS = [
  {
    id: '01',
    name: 'Diff Entropy',
    color: '#3fb950',
    icon: '≋',
    desc: 'Shannon entropy of changed tokens. Real thinking produces varied, specific changes. Rubber-stamping produces syntactically uniform pastes.'
  },
  {
    id: '02',
    name: 'Test Coverage Delta',
    color: '#58a6ff',
    icon: '◎',
    desc: 'Humans who understand changes write tests. Zero tests added alongside 200 lines of new code is a behavioral red flag, not a code quality one.'
  },
  {
    id: '03',
    name: 'Semantic Novelty',
    color: '#a5a3e8',
    icon: '⟳',
    desc: 'Embedding distance between consecutive diffs. Copy-paste commits cluster together. Genuine work diverges semantically from prior commits.'
  },
  {
    id: '04',
    name: 'Rename Density',
    color: '#d29922',
    icon: '↺',
    desc: 'Renaming variables and restructuring functions requires comprehension. It is the strongest single signal of human understanding in a diff.'
  },
  {
    id: '05',
    name: 'Message Quality',
    color: '#f0883e',
    icon: '◈',
    desc: '"fix" tells us nothing. A specific, issue-referencing, intent-describing message signals a developer who knew what they were doing.'
  },
  {
    id: '06',
    name: 'Bulk Insertion Flag',
    color: '#f85149',
    icon: '⚠',
    desc: '+200 lines, -0 lines, no tests, generic message. The behavioral fingerprint of blindly accepted AI output. We call it Paste and Pray.'
  }
]

const DEMO_REPOS = [
  { label: 'expressjs/morgan', url: 'https://github.com/expressjs/morgan' },
  { label: 'expressjs/cors', url: 'https://github.com/express/cors' },
  { label: 'sindresorhus/ora', url: 'https://github.com/sindresorhus/ora' }
]

export default function LandingPage({ analysis }) {
  const [url, setUrl] = useState('')
  const [depth, setDepth] = useState('200')
  const { error } = analysis

  const handleScan = (repoUrl) => {
    const maxCommits = Number(depth) || 200
    analysis.analyze(repoUrl, { maxCommits })
  }

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            cognitive depth analyzer
          </div>

          <h1 className="hero-title">
            Was this code<br />
            <span className="hero-title-accent">understood</span>?
          </h1>

          <p className="hero-sub">
            GitSignal reconstructs human cognitive depth from git history.
            Not "was this AI-generated?" — but "did any human actually think about this before merging it?"
          </p>

          <div className="hero-input-group">
            <div className="hero-input-wrap">
              <span className="hero-input-icon">⌥</span>
              <input
                className="hero-input"
                type="text"
                placeholder="https://github.com/Lakshya-Varshney/GitSignal"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && url.trim() && handleScan(url.trim())}
              />
            </div>
            <div className="hero-select-wrap">
              <span className="hero-select-label">depth</span>
              <select
                className="hero-select"
                value={depth}
                onChange={(event) => setDepth(event.target.value)}
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
            <span className="hero-depth-hint">Large repos: use 50</span>
            <button
              className="hero-btn"
              onClick={() => url.trim() && handleScan(url.trim())}
              disabled={!url.trim()}
            >
              Scan repo ◈
            </button>
          </div>

          {error && (
            <div className="landing-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="demo-pills">
            <span className="demo-pills-label">Try a demo →</span>
            {DEMO_REPOS.map((repo) => (
              <button
                key={repo.url}
                className="demo-pill"
                onClick={() => handleScan(repo.url)}
              >
                {repo.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-terminal" aria-hidden="true">
          <div className="terminal-bar">
            <span className="t-dot red" /><span className="t-dot amber" /><span className="t-dot green" />
            <span className="t-title">gitsignal — analysis</span>
          </div>
          <div className="terminal-body">
            <TerminalLine delay={0} color="#8b949e" text="→ fetching commit history (200 commits)..." />
            <TerminalLine delay={0.6} color="#8b949e" text="→ extracting diff entropy signals..." />
            <TerminalLine delay={1.1} color="#8b949e" text="→ embedding semantic novelty..." />
            <TerminalLine delay={1.7} color="#8b949e" text="→ scoring cognitive engagement..." />
            <TerminalLine delay={2.3} color="#f85149" text="⚠  collapse event detected — 2023-04-17" />
            <TerminalLine delay={2.9} color="#f85149" text="⚠  14 paste_and_pray commits flagged" />
            <TerminalLine delay={3.5} color="#d29922" text="◈  mean cognitive score: 0.312 (↓ from 0.581)" />
            <TerminalLine delay={4.1} color="#3fb950" text="✓  analysis complete" />
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <StatPill value="6" label="behavioral signals" />
        <div className="stats-divider" />
        <StatPill value="200" label="commits per scan" />
        <div className="stats-divider" />
        <StatPill value="0" label="content read — pure behavior" />
        <div className="stats-divider" />
        <StatPill value="∞" label="public repos supported" />
      </section>

      <section className="problem-section">
        <div className="problem-left">
          <span className="section-eyebrow">the problem</span>
          <h2 className="problem-title">
            The real threat isn't AI writing code.<br />
            It's humans <em>not reading it</em>.
          </h2>
          <p className="problem-body">
            Every team using AI coding assistants faces the same risk: developers
            accept suggestions without comprehension, merge without understanding,
            and ship without knowing what changed. Traditional code review metrics
            don't capture this. GitSignal does.
          </p>
          <p className="problem-body">
            We analyze behavioral artifacts — the traces humans leave (or fail to leave)
            when they genuinely engage with code. Entropy patterns. Test evolution.
            Rename density. Commit message specificity. Six signals. One score.
          </p>
        </div>
        <div className="problem-right">
          <div className="problem-quote-card">
            <span className="pq-mark">"</span>
            <p className="pq-text">The dangerous thing isn't AI writing code — it's the rubber-stamp review that follows.</p>
            <div className="pq-rule" />
            <p className="pq-attr">GitSignal — Slop Scan Hackathon 2024</p>
          </div>
        </div>
      </section>

      <section className="signals-section">
        <div className="signals-header">
          <span className="section-eyebrow">how it works</span>
          <h2 className="signals-title">Six signals. Zero content reading.</h2>
          <p className="signals-sub">
            GitSignal never reads your code. It reads how your team behaves around it.
          </p>
        </div>
        <div className="signals-grid">
          {SIGNALS.map((signal, index) => (
            <SignalCard key={signal.id} signal={signal} index={index} />
          ))}
        </div>
      </section>

      <section className="flags-section">
        <span className="section-eyebrow">detection taxonomy</span>
        <h2 className="flags-title">What GitSignal flags</h2>
        <div className="flags-grid">
          <FlagExplain
            name="Paste and Pray"
            color="#f85149"
            icon="⚠"
            desc="Bulk insertion (+80 lines, -0 tests, generic message). The signature of blindly accepted AI output."
          />
          <FlagExplain
            name="Rubber Stamp"
            color="#f85149"
            icon="◻"
            desc="Near-zero cognitive signal across all dimensions. Someone clicked 'approve' without reading."
          />
          <FlagExplain
            name="Test Desert"
            color="#d29922"
            icon="◌"
            desc="Significant code changes with zero test coverage added. Risk accumulates invisibly."
          />
          <FlagExplain
            name="Silent Commit"
            color="#d29922"
            icon="—"
            desc="Message is 'fix' or 'update'. No intent, no context, no signal that a human was present."
          />
          <FlagExplain
            name="Deep Refactor ✓"
            color="#3fb950"
            icon="↺"
            desc="Multiple renames and structural changes. Positive signal — someone understood well enough to improve."
          />
          <FlagExplain
            name="Test-Driven ✓"
            color="#3fb950"
            icon="◎"
            desc="Tests represent 40%+ of the diff. The strongest positive signal of developer comprehension."
          />
        </div>
      </section>

      <footer className="landing-footer">
        <span className="footer-logo">◈ GitSignal</span>
        <span className="footer-sub">Built for the Slop Scan Hackathon · Authenticity infrastructure for code review</span>
      </footer>
    </div>
  )
}

function TerminalLine({ delay, color, text }) {
  return (
    <p className="t-line" style={{ animationDelay: `${delay}s`, color }}>
      {text}
    </p>
  )
}

function StatPill({ value, label }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill-val">{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  )
}

function FlagExplain({ name, color, icon, desc }) {
  return (
    <div className="flag-explain" style={{ '--flag-color': color }}>
      <div className="fe-header">
        <span className="fe-icon" style={{ color }}>{icon}</span>
        <span className="fe-name" style={{ color }}>{name}</span>
      </div>
      <p className="fe-desc">{desc}</p>
    </div>
  )
}
