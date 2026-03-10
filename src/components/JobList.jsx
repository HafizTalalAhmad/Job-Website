import React from 'react'
import JobCard from './JobCard'

function JobList({ jobs, emptyMessage }) {
  if (!jobs.length) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

export default JobList
