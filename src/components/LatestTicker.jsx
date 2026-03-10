import React from 'react'
import { Link } from 'react-router-dom'

function LatestTicker({ jobs }) {
  const latest = [...jobs]
    .sort((a, b) => (a.postDate < b.postDate ? 1 : -1))
    .slice(0, 8)

  return (
    <section className="ticker" aria-label="Latest jobs ticker">
      <span>Latest Jobs:</span>
      <div className="ticker-track">
        {latest.map((job) => (
          <Link key={job.id} to={`/job/${job.id}`}>{job.title}</Link>
        ))}
      </div>
    </section>
  )
}

export default LatestTicker
