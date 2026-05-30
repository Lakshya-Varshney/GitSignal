import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useRepoAnalysis() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [job, setJob] = useState(null)

  const startWithRetry = useCallback(async (repoUrl, maxCommits, timeoutMs) => {
    const attempts = 3
    for (let i = 0; i < attempts; i += 1) {
      try {
        const res = await axios.post(
          `${API_BASE}/analyze/start`,
          { repo_url: repoUrl, max_commits: maxCommits },
          { timeout: timeoutMs }
        )
        return res.data.job_id
      } catch (err) {
        const isTimeout = err.code === 'ECONNABORTED' || `${err.message || ''}`.includes('timeout')
        if (!isTimeout) throw err
        await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)))
      }
    }
    return null
  }, [])

  const pollJob = useCallback(async (jobId) => {
    let done = false
    let failures = 0
    const maxFailures = 8
    while (!done) {
      try {
        const res = await axios.get(`${API_BASE}/analyze/status/${jobId}`, { timeout: 30000 })
        const jobData = res.data
        setJob(jobData)
        failures = 0
        if (jobData.status === 'done') {
          setData(jobData.result)
          done = true
          break
        }
        if (jobData.status === 'error') {
          setError(jobData.error || 'Analysis failed')
          done = true
          break
        }
      } catch (err) {
        failures += 1
        if (failures >= maxFailures) {
          setError(err.response?.data?.detail || err.message || 'Analysis failed')
          done = true
          break
        }
        setJob((prev) => prev ? { ...prev, stage: 'waiting for status', progress_pct: prev.progress_pct || 0 } : prev)
      }
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }
  }, [])

  const analyze = useCallback(async (repoUrl, options = {}) => {
    if (!repoUrl) return
    setLoading(true)
    setError(null)
    setData(null)
    setJob(null)
    navigate(`/results?repo=${encodeURIComponent(repoUrl)}`)

    const maxCommits = options.maxCommits || 200
    const timeoutMs = options.timeoutMs || (maxCommits >= 200 ? 120000 : 45000)

    try {
      const jobId = await startWithRetry(repoUrl, maxCommits, timeoutMs)
      if (!jobId) {
        setError('Analyze start timed out. Please retry the scan.')
        return
      }
      setJob({
        job_id: jobId,
        status: 'queued',
        progress_pct: 0,
        stage: 'queued'
      })
      await pollJob(jobId)
    } catch (err) {
      if (err.code === 'ECONNABORTED' || `${err.message || ''}`.includes('timeout')) {
        setError('Analyze start timed out. Please retry the scan.')
      } else {
        setError(err.response?.data?.detail || err.message || 'Analysis failed')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, pollJob, startWithRetry])

  return { data, loading, error, job, analyze }
}