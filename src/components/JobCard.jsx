import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

function JobCard({ job }) {
  const positions = (job.jobPositions || job.requirements || []).slice(0, 12)
  const countryText = job.country || 'In Pakistan'
  const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
  const locationLine = [job.city, provinceText, countryText].filter(Boolean).join(', ')

  return (
    <article className="job-card">
      <div className="job-row legacy-style-row">
        <div className="job-main legacy-main">
          <p className="legacy-source-line">
            {formatDate(job.postDate)} - {job.source}
          </p>
          <p className="job-summary">
            <Link to={`/job/${job.id}`} className="job-summary-link">{job.summary}</Link>
          </p>
          <p className="legacy-country">{countryText}</p>
          <p className="job-location-line">{locationLine}</p>
        </div>
        <div className="job-meta-col legacy-bullets">
          <p className="positions-title">Job Positions</p>
          <ul>
            {positions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className={`job-badge type-${job.type}`}>{job.type}</span>
          <span className="job-cell"><strong>Deadline:</strong> {formatDate(job.deadline)}</span>
        </div>
      </div>
    </article>
  )
}

export default JobCard
