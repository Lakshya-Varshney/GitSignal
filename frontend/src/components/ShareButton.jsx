import { useState } from 'react'

export default function ShareButton({ repoName, score, repoUrl }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/results?repo=${encodeURIComponent(repoUrl)}`
  const tweetText = `GitSignal scanned ${repoName}. Cognitive engagement score: ${score.toFixed(3)}/1.0\n\nNot "was this AI?" — "was this understood?"\n\n${shareUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleTweet = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="share-btn" onClick={handleCopy}>
        {copied ? '✓ copied' : '↗ copy link'}
      </button>
      <button className="share-btn" onClick={handleTweet} style={{ color: 'var(--blue)' }}>
        𝕏 tweet
      </button>
    </div>
  )
}
