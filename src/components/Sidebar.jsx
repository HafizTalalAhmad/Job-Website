import React from 'react'
import { Link } from 'react-router-dom'

function Sidebar({ jobs, popular }) {
  const todaysJobs = jobs.filter((job) => job.postDate === '2026-03-09').slice(0, 5)
  const govtJobs = jobs.filter((job) => job.type === 'government').slice(0, 5)

  return (
    <aside className="sidebar">
      <section className="widget">
        <h3>Popular Cities</h3>
        <div className="tag-cloud">
          {popular.cities.map((city) => (
            <Link key={city} to="/jobs/location">{city}</Link>
          ))}
        </div>
      </section>

      <section className="widget">
        <h3>Popular Professions</h3>
        <div className="tag-cloud">
          {popular.categories.map((cat) => (
            <Link key={cat} to="/jobs/profession">{cat}</Link>
          ))}
        </div>
      </section>

      <section className="widget">
        <h3>Today&apos;s Jobs</h3>
        <ul className="compact-list">
          {todaysJobs.map((job) => (
            <li key={job.id}><Link to={`/job/${job.id}`}>{job.title}</Link></li>
          ))}
        </ul>
      </section>

      <section className="widget">
        <h3>Latest Government Jobs</h3>
        <ul className="compact-list">
          {govtJobs.map((job) => (
            <li key={job.id}><Link to={`/job/${job.id}`}>{job.organization} - {job.category}</Link></li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

export default Sidebar
