import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

export default function ContributorMatrix({ contributors, commits }) {
  if (!contributors?.length) return null
  const top = contributors.slice(0, 10)

  return (
    <div className="contrib-table">
      <div className="contrib-header-row">
        <span>Author</span>
        <span>Commits</span>
        <span>Mean score</span>
        <span>Trend</span>
        <span>Sparkline</span>
        <span>Paste %</span>
      </div>
      {top.map((c) => {
        const scoreColor = c.mean_score >= 0.6 ? '#3fb950' : c.mean_score >= 0.35 ? '#d29922' : '#f85149'
        const trendIcon = c.score_trend === 'declining' ? '↘' : c.score_trend === 'improving' ? '↗' : '→'
        const trendColor = c.score_trend === 'declining' ? '#f85149' : c.score_trend === 'improving' ? '#3fb950' : '#8b949e'

        const authorCommits = commits
          ? commits.filter((cm) => cm.author === c.author)
            .sort((a, b) => a.unix_ts - b.unix_ts)
            .map((cm) => cm.cognitive_score)
          : []

        return (
          <div key={c.author} className="contrib-row">
            <span className="contrib-name" title={c.author}>{c.author.slice(0, 18)}</span>
            <span className="contrib-mono">{c.commit_count}</span>
            <span className="contrib-score" style={{ color: scoreColor }}>{c.mean_score.toFixed(3)}</span>
            <span style={{ color: trendColor, fontFamily: 'var(--font-mono)' }}>{trendIcon}</span>
            <Sparkline scores={authorCommits} color={scoreColor} />
            <span className={`contrib-pct ${c.paste_and_pray_pct > 20 ? 'danger' : ''}`}>
              {c.paste_and_pray_pct.toFixed(0)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Sparkline({ scores, color }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !scores?.length) return
    const width = 80
    const height = 24
    d3.select(ref.current).selectAll('*').remove()
    const svg = d3.select(ref.current).attr('width', width).attr('height', height)
    const x = d3.scaleLinear().domain([0, scores.length - 1]).range([2, width - 2])
    const y = d3.scaleLinear().domain([0, 1]).range([height - 2, 2])
    const line = d3.line().x((_, i) => x(i)).y((d) => y(d)).curve(d3.curveCatmullRom)
    svg.append('path')
      .datum(scores)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .attr('d', line)
  }, [scores, color])

  return <svg ref={ref} style={{ display: 'block' }} />
}
