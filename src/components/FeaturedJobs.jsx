import React from 'react'
import { Link } from 'react-router-dom'

function FeaturedJobs({ jobs }) {
  const featured = jobs.filter((job) => job.isFeatured).slice(0, 4)

  return (
    <section className="panel">
      <div className="panel-head-row">
        <h2 className="panel-title">Featured Jobs</h2>
        <Link to="/jobs/date" className="panel-link">View All</Link>
      </div>
      <div className="featured-grid">
        {featured.map((job) => (
          <Link className="featured-card" key={job.id} to={`/job/${job.id}`}>
            <span className="featured-org">{job.organization}</span>
            <h3>{job.title}</h3>
            <p>{job.city} | {job.type}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FeaturedJobs
