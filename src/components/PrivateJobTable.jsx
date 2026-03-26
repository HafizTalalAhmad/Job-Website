import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

function PrivateJobTable({ jobs }) {
  if (!jobs.length) {
    return <p className="empty-state">No private jobs matched your criteria.</p>
  }

  return (
    <div className="private-job-table">
      <div className="private-job-table-wrap">
        <table className="private-job-grid-table">
          <colgroup>
            <col className="private-col-role" />
            <col className="private-col-company" />
            <col className="private-col-location" />
            <col className="private-col-profession" />
            <col className="private-col-industry" />
            <col className="private-col-source" />
            <col className="private-col-type" />
            <col className="private-col-deadline" />
            <col className="private-col-action" />
          </colgroup>
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Profession</th>
              <th>Industry</th>
              <th>Source</th>
              <th>Job Type</th>
              <th>Deadline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
        {jobs.map((job) => {
          const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
          const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
          const typeLabel = job.employmentType || 'Private Job'
          const safeSummary = (job.summary || '').trim()

          return (
            <tr key={job.id}>
              <td>
                <div className="private-job-cell-title">
                  <Link to={`/job/${job.id}`} className="private-job-title-link">
                    {job.title}
                  </Link>
                  <p>{safeSummary}</p>
                </div>
              </td>
              <td>{job.organization}</td>
              <td>{locationLine || 'Pakistan'}</td>
              <td>{job.category}</td>
              <td>{job.industry}</td>
              <td>{job.source}</td>
              <td>{typeLabel}</td>
              <td>
                <div className="private-job-deadline-cell">
                  <strong>{formatDate(job.deadline)}</strong>
                  <span>Posted {formatDate(job.postDate)}</span>
                </div>
              </td>
              <td>
                <Link to={`/job/${job.id}`} className="action-btn secondary private-job-open-btn">
                  Open
                </Link>
              </td>
            </tr>
          )
        })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PrivateJobTable
