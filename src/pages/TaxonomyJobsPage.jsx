import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JobGroupByDate from '../components/JobGroupByDate'
import { getTaxonomyConfig } from '../data/taxonomies'
import { useJobs } from '../context/JobsContext'
import { groupJobs, sortJobs } from '../utils/jobs'

function TaxonomyJobsPage({ mode }) {
  const { value } = useParams()
  const { jobs } = useJobs()
  const [sortBy, setSortBy] = useState('latest')
  const config = getTaxonomyConfig(mode)

  const items = useMemo(() => (config ? config.deriveItems(jobs) : []), [jobs, config])
  const currentItem = useMemo(() => items.find((item) => item.value === value), [items, value])

  const filteredJobs = useMemo(() => {
    if (!config || !currentItem) return []
    return sortJobs(jobs.filter((job) => config.matchJob(job, currentItem.value)), sortBy)
  }, [jobs, config, currentItem, sortBy])

  const groupedByDate = useMemo(() => groupJobs(filteredJobs, 'postDate'), [filteredJobs])

  if (!config || !currentItem) {
    return (
      <main className="container layout inner-layout">
        <section className="content">
          <section className="panel">
            <h1 className="panel-title">Page Not Found</h1>
            <p className="panel-intro">This item is not available in the selected directory.</p>
            <Link to={`/jobs/${mode}`} className="action-btn secondary">Back</Link>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="container layout inner-layout">
      <section className="content">
        <section className="panel page-hero-panel">
          <div className="page-hero-copy">
            <span className="section-kicker">{config.heroKicker}</span>
            <h1 className="panel-title">{config.jobsTitle(currentItem)}</h1>
            <p className="panel-intro">{config.jobsDescription(currentItem)}</p>
          </div>
          <div className="page-hero-stats">
            <div className="hero-stat-box">
              <strong>{filteredJobs.length}</strong>
              <span>Live Jobs</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <p className="panel-intro listing-helper-line">
            These are the jobs related to this selection. Click any blue headline to open full details.
          </p>
          <div className="single-filter-row">
            <Link to={`/jobs/${mode}`} className="action-btn secondary">Back to Directory</Link>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Sort: Latest</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="alphabetical">Sort: Alphabetical</option>
            </select>
          </div>
        </section>

        <section className="panel grouped-listing">
          <JobGroupByDate grouped={groupedByDate} />
          {!groupedByDate.length && (
            <p className="empty-state">
              No live jobs are currently listed here. Please go back and try another option.
            </p>
          )}
        </section>

        {!!items.length && (
          <section className="panel department-directory-panel">
            <h2 className="panel-title">Other Options</h2>
            <div className="department-inline-list">
              {items
                .filter((item) => item.value !== currentItem.value)
                .slice(0, 18)
                .map((item) => (
                  <Link key={item.value} to={`/jobs/${mode}/${encodeURIComponent(item.value)}`} className="department-pill">
                    {item.label}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default TaxonomyJobsPage
