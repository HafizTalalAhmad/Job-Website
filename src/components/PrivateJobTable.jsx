import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, toDate } from '../utils/jobs'

const BOOKMARK_STORAGE_KEY = 'savedJobs'

function getStatus(deadline) {
  if (!deadline) return 'Active'

  const today = new Date()
  const dueDate = new Date(`${deadline}T00:00:00`)
  today.setHours(0, 0, 0, 0)

  const diff = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

  if (diff < 0) return 'Expired'
  if (diff <= 2) return 'Closing Soon'
  return 'Active'
}

function getTimeSince(postDate) {
  if (!postDate) return ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const post = toDate(postDate)
  const diff = Math.max(0, Math.floor((today.getTime() - post.getTime()) / (1000 * 60 * 60 * 24)))

  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 7) return `${diff} days ago`
  return formatDate(postDate)
}

function getCompanyInitials(name) {
  if (!name) return 'PJ'
  const words = name.split(' ').filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
}

function PrivateJobTable({ jobs }) {
  const [bookmarks, setBookmarks] = useState([])
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BOOKMARK_STORAGE_KEY)) || []
      setBookmarks(Array.isArray(saved) ? saved : [])
    } catch {
      setBookmarks([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return jobs.filter((job) => {
      const matchesSaved = !showSavedOnly || bookmarks.includes(job.id)
      const matchesSearch =
        !searchText ||
        [
          job.title,
          job.organization,
          job.city,
          job.province,
          job.category,
          job.industry,
          job.source,
          job.summary
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchText)

      return matchesSaved && matchesSearch
    })
  }, [bookmarks, jobs, search, showSavedOnly])

  const toggleBookmark = (jobId) => {
    setBookmarks((current) =>
      current.includes(jobId) ? current.filter((savedId) => savedId !== jobId) : [...current, jobId]
    )
  }

  if (!jobs.length) {
    return <p className="empty-state">No private jobs matched your criteria.</p>
  }

  return (
    <div className="private-job-board">
      <div className="private-job-toolbar private-job-toolbar-card">
        <div className="private-job-toolbar-copy">
          <h2>Private Job Listings</h2>
          <p>Search company opportunities, save interesting roles, and open a cleaner second page for full details.</p>
        </div>
        <div className="private-job-toolbar-actions">
          <label className="private-job-search">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search private jobs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            className={`private-job-saved-toggle${showSavedOnly ? ' is-active' : ''}`}
          >
            Saved Jobs ({bookmarks.length})
          </button>
        </div>
      </div>

      <div className="private-job-board-meta">
        <div className="private-job-board-chip">
          <strong>{filteredJobs.length}</strong>
          <span>{filteredJobs.length === 1 ? 'job found' : 'jobs found'}</span>
        </div>
        {showSavedOnly && <div className="private-job-board-chip private-job-board-chip-soft">Showing saved jobs</div>}
      </div>

      <div className="private-job-card-grid">
        {filteredJobs.map((job) => {
          const status = getStatus(job.deadline)
          const isSaved = bookmarks.includes(job.id)
          const fallbackParts = job.location ? String(job.location).split(',').map((part) => part.trim()) : []
          const cityText = job.city || fallbackParts[0] || 'Pakistan'
          const rawProvinceText = job.province || (job.city ? fallbackParts[0] : fallbackParts[1]) || ''
          const provinceText = /^(pakistan|remote)$/i.test(rawProvinceText) ? '' : rawProvinceText
          const locationText = provinceText ? `${cityText}, ${provinceText}` : cityText

          return (
            <article key={job.id} className={`private-job-card${status === 'Expired' ? ' is-expired' : ''}`}>
              <div className="private-job-card-topline">
                <span className="private-job-age">{getTimeSince(job.postDate)}</span>
                <button
                  type="button"
                  className={`private-job-card-save${isSaved ? ' is-saved' : ''}`}
                  onClick={() => toggleBookmark(job.id)}
                  title={isSaved ? 'Unsave job' : 'Save job'}
                  aria-label={isSaved ? 'Unsave job' : 'Save job'}
                >
                  {isSaved ? '\u2665' : '\u2661'}
                </button>
              </div>

              <div className="private-job-company-mark">{getCompanyInitials(job.organization)}</div>

              <Link to={`/job/${job.id}`} className="private-job-card-title">
                {job.title}
              </Link>

              <p className="private-job-card-company">{job.organization}</p>

              <p className="private-job-card-summary">{job.summary}</p>

              <div className="private-job-card-tags">
                <span>{locationText}</span>
                <span>{job.category}</span>
                <span>{job.source}</span>
              </div>

              <div className="private-job-card-bottom">
                <div className="private-job-card-deadline">
                  <strong>{formatDate(job.deadline)}</strong>
                  <span>{status}</span>
                </div>
                <Link to={`/job/${job.id}`} className="private-job-card-open">
                  View Job
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {!filteredJobs.length && <p className="private-job-empty-message">No jobs matched your current search.</p>}
    </div>
  )
}

export default PrivateJobTable
