import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

function PrivateJobTable({ jobs }) {
  if (!jobs.length) {
    return <p className="empty-state">No private jobs matched your criteria.</p>
  }

  return (
    <div className="private-job-table">
      <div className="private-job-table-head">
        <span>Private Jobs Board</span>
        <span>One role per row</span>
      </div>

      <div className="private-job-table-body">
        {jobs.map((job) => {
          const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
          const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
          const companyMark = (job.organization || '?')
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0] || '')
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <article key={job.id} className="private-job-row">
              <div className="private-job-mark">{companyMark}</div>

              <div className="private-job-role">
                <Link to={`/job/${job.id}`} className="private-job-title-link">
                  {job.title}
                </Link>
                <p>{job.summary}</p>
              </div>

              <div className="private-job-col private-job-company">
                <strong>{job.organization}</strong>
                <span>{job.category}</span>
                <small>{job.source}</small>
              </div>

              <div className="private-job-col">
                <strong>{locationLine}</strong>
                <span>{job.employmentType || 'Private Job'}</span>
              </div>

              <div className="private-job-col private-job-date">
                <strong>Deadline {formatDate(job.deadline)}</strong>
                <span>Posted {formatDate(job.postDate)}</span>
              </div>

              <div className="private-job-actions">
                <Link to={`/job/${job.id}`} className="action-btn secondary">
                  View Job
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default PrivateJobTable
