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
        <span>Role</span>
        <span>Company</span>
        <span>Location</span>
        <span>Job Type</span>
        <span>Deadline</span>
        <span>Action</span>
      </div>

      <div className="private-job-table-body">
        {jobs.map((job) => {
          const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
          const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
          const typeLabel = job.employmentType || 'Private Job'
          const companyMark = (job.organization || '?')
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0] || '')
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <article key={job.id} className="private-job-row">
              <div className="private-job-role-cell">
                <div className="private-job-mark">{companyMark}</div>
                <div className="private-job-role-content">
                  <Link to={`/job/${job.id}`} className="private-job-title-link">
                    {job.title}
                  </Link>
                  <p>{job.summary}</p>
                </div>
              </div>

              <div className="private-job-col private-job-company">
                <strong>{job.organization}</strong>
                <span>{job.category}</span>
              </div>

              <div className="private-job-col">
                <strong>{locationLine}</strong>
                <span>{job.province || 'Pakistan'}</span>
              </div>

              <div className="private-job-col private-job-type">
                <strong>{typeLabel}</strong>
                <span>{job.source}</span>
              </div>

              <div className="private-job-col private-job-date">
                <strong>{formatDate(job.deadline)}</strong>
                <span>Posted {formatDate(job.postDate)}</span>
              </div>

              <div className="private-job-actions">
                <Link to={`/job/${job.id}`} className="action-btn secondary">
                  Open
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
