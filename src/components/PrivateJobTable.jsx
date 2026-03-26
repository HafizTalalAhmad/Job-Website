import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

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

function PrivateJobTable({ jobs }) {
  const [bookmarks, setBookmarks] = useState([])
  const [showSavedOnly, setShowSavedOnly] = useState(false)

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

  const filteredJobs = useMemo(
    () => jobs.filter((job) => (!showSavedOnly ? true : bookmarks.includes(job.id))),
    [bookmarks, jobs, showSavedOnly]
  )

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
      <div className="private-job-toolbar">
        <div className="private-job-toolbar-copy">
          <h2>Job Listings</h2>
          <p>Review private-sector roles, save useful ones, and quickly see which jobs are still active.</p>
        </div>
        <div className="private-job-toolbar-actions">
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            className={`private-job-saved-toggle${showSavedOnly ? ' is-active' : ''}`}
          >
            Saved Jobs ({bookmarks.length})
          </button>
        </div>
      </div>

      <div className="private-job-table-wrap">
        <table className="private-job-grid-table private-job-simple-table">
          <colgroup>
            <col className="private-col-role" />
            <col className="private-col-company" />
            <col className="private-col-location" />
            <col className="private-col-profession" />
            <col className="private-col-industry" />
            <col className="private-col-source" />
            <col className="private-col-posted" />
            <col className="private-col-deadline" />
            <col className="private-col-status" />
            <col className="private-col-bookmark" />
          </colgroup>
          <thead>
            <tr>
              <th>Job Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Profession</th>
              <th>Industry</th>
              <th>Source</th>
              <th>Posting Date</th>
              <th>Deadline</th>
              <th>Status</th>
              <th className="private-job-bookmark-col"></th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const status = getStatus(job.deadline)
              const isSaved = bookmarks.includes(job.id)
              const fallbackParts = job.location ? String(job.location).split(',').map((part) => part.trim()) : []
              const cityText = job.city || fallbackParts[0] || 'Pakistan'
              const provinceText = job.province || fallbackParts[1] || ''

              return (
                <tr key={job.id} className={status === 'Expired' ? 'is-expired' : ''}>
                  <td className="private-job-role-cell">
                    <Link to={`/job/${job.id}`} className="private-job-title-link">
                      {job.title}
                    </Link>
                    {job.summary && <p>{job.summary}</p>}
                  </td>
                  <td>{job.organization || '-'}</td>
                  <td className="private-job-location-cell">
                    <span>{cityText}</span>
                    {provinceText && <span>{provinceText}</span>}
                  </td>
                  <td>{job.category || '-'}</td>
                  <td>{job.industry || '-'}</td>
                  <td>{job.source || '-'}</td>
                  <td>{job.postDate ? formatDate(job.postDate) : '-'}</td>
                  <td>{job.deadline ? formatDate(job.deadline) : '-'}</td>
                  <td>
                    <span className={`private-job-status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {status}
                    </span>
                  </td>
                  <td className="private-job-bookmark-cell">
                    <button
                      type="button"
                      className={`private-job-bookmark-btn${isSaved ? ' is-saved' : ''}`}
                      onClick={() => toggleBookmark(job.id)}
                      title={isSaved ? 'Unsave job' : 'Save job'}
                      aria-label={isSaved ? 'Unsave job' : 'Save job'}
                    >
                      {isSaved ? '\u2605' : '\u2606'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {!filteredJobs.length && (
              <tr>
                <td colSpan="10" className="private-job-empty-cell">
                  No jobs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PrivateJobTable
