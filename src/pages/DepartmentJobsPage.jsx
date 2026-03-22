import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JobGroupByDate from '../components/JobGroupByDate'
import { departmentDirectory, findDepartmentBySlug, getDepartmentJobs } from '../data/departments'
import { useJobs } from '../context/JobsContext'
import { groupJobs, sortJobs } from '../utils/jobs'

function DepartmentJobsPage() {
  const { slug } = useParams()
  const { jobs } = useJobs()
  const [sortBy, setSortBy] = useState('latest')
  const department = findDepartmentBySlug(slug)

  const departmentJobs = useMemo(() => {
    return sortJobs(getDepartmentJobs(jobs, department), sortBy)
  }, [jobs, department, sortBy])

  const groupedByDate = useMemo(() => groupJobs(departmentJobs, 'postDate'), [departmentJobs])

  if (!department) {
    return (
      <main className="container layout inner-layout">
        <section className="content">
          <section className="panel">
            <h1 className="panel-title">Department Not Found</h1>
            <p className="panel-intro">This department is not available in the directory.</p>
            <Link to="/jobs/organization" className="action-btn secondary">Back to Departments</Link>
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
            <span className="section-kicker">Department Jobs</span>
            <h1 className="panel-title">{department.name} Jobs</h1>
            <span className={`department-scope-badge scope-${department.scope.toLowerCase().replace(/\s+/g, '-')}`}>
              {department.scope}
            </span>
            <p className="panel-intro">{department.description}</p>
          </div>
          <div className="page-hero-stats">
            <div className="hero-stat-box">
              <strong>{departmentJobs.length}</strong>
              <span>Live Jobs</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <p className="panel-intro listing-helper-line">
            Below are the current jobs related to this department. Click any blue headline to open full details.
          </p>
          <div className="single-filter-row">
            <Link to="/jobs/organization" className="action-btn secondary">Back to Departments</Link>
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
              No live jobs are currently listed for {department.name}. You can check other departments in the directory.
            </p>
          )}
        </section>

        {!!departmentJobs.length && (
          <section className="panel department-directory-panel">
            <h2 className="panel-title">Other Departments</h2>
            <div className="department-inline-list">
              {departmentDirectory
                .filter((item) => item.slug !== department.slug)
                .map((item) => (
                  <Link key={item.slug} to={`/jobs/departments/${item.slug}`} className="department-pill">
                    {item.name}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default DepartmentJobsPage
