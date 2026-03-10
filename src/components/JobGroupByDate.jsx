import React from 'react'
import { formatDate } from '../utils/jobs'
import JobList from './JobList'

function JobGroupByDate({ grouped }) {
  if (!grouped.length) {
    return <p className="empty-state">No jobs found for the selected filters.</p>
  }

  return (
    <div className="grouped-list">
      {grouped.map(([date, jobs]) => {
        const sourceMap = jobs.reduce((acc, job) => {
          if (!acc[job.source]) acc[job.source] = []
          acc[job.source].push(job)
          return acc
        }, {})

        return (
          <section key={date} className="date-group">
            <h2>Jobs Posted on {formatDate(date)}</h2>
            {Object.entries(sourceMap).map(([source, sourceJobs]) => (
              <div key={source} className="source-group">
                <h3>Source: {source}</h3>
                <JobList jobs={sourceJobs} emptyMessage="No jobs available." />
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export default JobGroupByDate
