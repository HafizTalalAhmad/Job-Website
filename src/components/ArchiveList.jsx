import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

function ArchiveList({ archiveGroups }) {
  return (
    <div className="archive-list">
      {archiveGroups.map((group) => (
        <section key={group.monthKey} className="archive-group">
          <h2>{group.label}</h2>
          <ul>
            {group.jobs.map((job) => (
              <li key={job.id}>
                <Link to={`/job/${job.id}`}>{job.title}</Link>
                <span>{job.organization}</span>
                <span>{formatDate(job.postDate)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default ArchiveList
