import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

const BOOKMARK_STORAGE_KEY = 'privateJobBookmarks'

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
  const [search, setSearch] = useState('')
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

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return jobs.filter((job) => {
      const searchableText = [
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

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch)
      const matchesSaved = !showSavedOnly || bookmarks.includes(job.id)

      return matchesSearch && matchesSaved
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
      <div className="private-job-toolbar">
        <div className="private-job-toolbar-copy">
          <h2>Private Job Listings</h2>
          <p>Search quickly, bookmark useful roles, and check job status before you open the full page.</p>
        </div>
        <div className="private-job-toolbar-actions">
          <input
            type="text"
            placeholder="Search jobs, companies, or industries..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="private-job-search"
          />
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            className={`private-job-saved-toggle${showSavedOnly ? ' is-active' : ''}`}
          >
            Saved Jobs
          </button>
        </div>
      </div>

      <div className="private-job-table-wrap">
        <table className="private-job-grid-table private-job-simple-table">
          <thead>
            <tr>
              <th className="private-job-bookmark-col"></th>
              <th>Job Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Profession</th>
              <th>Industry</th>
              <th>Source</th>
              <th>Posting Date</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const status = getStatus(job.deadline)
              const isSaved = bookmarks.includes(job.id)

              return (
                <tr key={job.id} className={status === 'Expired' ? 'is-expired' : ''}>
                  <td className="private-job-bookmark-cell">
                    <button
                      type="button"
                      className={`private-job-bookmark-btn${isSaved ? ' is-saved' : ''}`}
                      onClick={() => toggleBookmark(job.id)}
                      aria-label={isSaved ? 'Remove bookmark' : 'Save job'}
                    >
                      {isSaved ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="private-job-role-cell">
                    <Link to={`/job/${job.id}`} className="private-job-title-link">
                      {job.title}
                    </Link>
                    {job.summary && <p>{job.summary}</p>}
                  </td>
                  <td>{job.organization || '-'}</td>
                  <td className="private-job-location-cell">
                    <span>{job.city || 'Pakistan'}</span>
                    {job.province && <span>{job.province}</span>}
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
                  <td>
                    {status === 'Expired' ? (
                      <span className="private-job-table-action is-closed">Closed</span>
                    ) : (
                      <Link to={`/job/${job.id}`} className="private-job-table-action">
                        Open
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
            {!filteredJobs.length && (
              <tr>
                <td colSpan="11" className="private-job-empty-cell">
                  No jobs found.
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
