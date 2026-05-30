import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SummaryStats from '../components/SummaryStats'
import TimelineView from '../components/TimelineView'
import CommitInspector from '../components/CommitInspector'
import ContributorMatrix from '../components/ContributorMatrix'
import FlagList from '../components/FlagList'
import LoadingScreen from '../components/LoadingScreen'
import CollapseEventBanner from '../components/CollapseEventBanner'
import ShareButton from '../components/ShareButton'
import EraPanel from '../components/EraPanel'
import FileHeatMap from '../components/FileHeatMap'
import ScoreHistogram from '../components/ScoreHistogram'

export default function ResultsPage({ analysis }) {
  const { data, loading, error, job } = analysis
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedCommit, setSelectedCommit] = useState(null)

  useEffect(() => {
    const repoFromUrl = searchParams.get('repo')
    if (repoFromUrl && !data && !loading && !error) {
      analysis.analyze(decodeURIComponent(repoFromUrl))
    }
  }, [analysis, data, loading, error, searchParams])

  useEffect(() => {
    if (!data && !loading && !error && !searchParams.get('repo')) navigate('/')
  }, [data, loading, error, navigate, searchParams])

  if (loading) return <LoadingScreen progress={job?.progress_pct} stage={job?.stage} updatedAt={job?.updated_at} />
  if (error) {
    return (
      <div className="results-error">
        <p>⚠ {error}</p>
        <button onClick={() => navigate('/')}>← back</button>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="results-shell">
      <CollapseEventBanner
        events={data.summary.collapse_events}
        onJumpTo={(sha) => {
          const commit = data.commits.find((c) => c.sha === sha)
          if (commit) setSelectedCommit(commit)
        }}
      />

      <div className="results-top-row">
        <SummaryStats
          summary={data.summary}
          repoName={data.repo_name}
          total={data.total_commits_analyzed}
        />
        <ShareButton
          repoName={data.repo_name}
          score={data.summary.mean_cognitive_score}
          repoUrl={data.repo_url}
        />
      </div>

      <EraPanel eraSplit={data.era_split} />

      <section className="section">
        <h2 className="section-title">Score distribution</h2>
        <ScoreHistogram commits={data.commits} />
      </section>

      <section className="section">
        <h2 className="section-title">Cognitive engagement timeline</h2>
        <p className="section-sub">
          Each point = one commit. Y-axis = cognitive engagement score (0–1).
          Red bands = detected collapse events. Click any point to inspect.
        </p>
        <TimelineView
          commits={data.commits}
          collapseEvents={data.summary.collapse_events}
          onCommitClick={setSelectedCommit}
          selectedSha={selectedCommit?.sha}
        />
      </section>

      <div className="two-col">
        <section className="section">
          <h2 className="section-title">Contributor trust index</h2>
          <ContributorMatrix contributors={data.contributors} commits={data.commits} />
        </section>
        <section className="section">
          <h2 className="section-title">Flagged commits</h2>
          <FlagList
            commits={data.commits}
            onSelect={setSelectedCommit}
            selectedSha={selectedCommit?.sha}
          />
        </section>
      </div>

      <section className="section">
        <h2 className="section-title">File risk map</h2>
        <FileHeatMap files={data.file_heatmap} />
      </section>

      {selectedCommit && (
        <section className="section">
          <h2 className="section-title">Commit inspector</h2>
          <CommitInspector
            commit={selectedCommit}
            onClose={() => setSelectedCommit(null)}
          />
        </section>
      )}
    </div>
  )
}
