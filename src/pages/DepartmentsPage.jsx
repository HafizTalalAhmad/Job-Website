import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { departmentDirectory, getDepartmentJobs } from '../data/departments'
import { useJobs } from '../context/JobsContext'

function DepartmentsPage() {
  const { jobs } = useJobs()
  const [query, setQuery] = useState('')

  const departments = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return departmentDirectory
      .map((department) => ({
        ...department,
        jobsCount: getDepartmentJobs(jobs, department).length
      }))
      .filter((department) => {
        if (!keyword) return true

        return (
          department.name.toLowerCase().includes(keyword) ||
          department.description.toLowerCase().includes(keyword)
        )
      })
  }, [jobs, query])

  const totalGovernmentJobs = useMemo(
    () => jobs.filter((job) => job.type === 'government').length,
    [jobs]
  )

  const popularDepartments = departments
    .filter((department) => department.jobsCount > 0)
    .slice(0, 6)

  return (
    <main className="container layout inner-layout">
      <section className="content">
        <section className="panel page-hero-panel">
          <div className="page-hero-copy">
            <span className="section-kicker">Simple Job Search</span>
            <h1 className="panel-title">Jobs by Departments</h1>
            <p className="panel-intro">
              If you are not sure where to start, just choose a government department below. We will show you the jobs
              available for that department on the next page.
            </p>
          </div>
          <div className="page-hero-stats">
            <div className="hero-stat-box">
              <strong>{departmentDirectory.length}</strong>
              <span>Departments</span>
            </div>
            <div className="hero-stat-box">
              <strong>{totalGovernmentJobs}</strong>
              <span>Government Jobs</span>
            </div>
          </div>
        </section>

        <section className="panel helper-steps-panel">
          <h2 className="panel-title">How to Use This Page</h2>
          <div className="helper-steps-grid">
            <article className="helper-step-card">
              <span>1</span>
              <h3>Choose a Department</h3>
              <p>Click the department name you know, such as WAPDA, NADRA, FPSC, or Pakistan Railways.</p>
            </article>
            <article className="helper-step-card">
              <span>2</span>
              <h3>See Related Jobs</h3>
              <p>On the next page, only the jobs related to that department will be shown in a clear list.</p>
            </article>
            <article className="helper-step-card">
              <span>3</span>
              <h3>Open Full Details</h3>
              <p>Click any job headline to open the poster, instructions, deadline, and full application details.</p>
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head-row">
            <h2 className="panel-title">Government Departments Directory</h2>
            <span>{departments.length} departments</span>
          </div>
          {!!popularDepartments.length && !query && (
            <div className="department-inline-list popular-department-list">
              {popularDepartments.map((department) => (
                <Link key={department.slug} to={`/jobs/departments/${department.slug}`} className="department-pill">
                  {department.name}
                </Link>
              ))}
            </div>
          )}
          <div className="single-filter-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a department name..."
            />
          </div>
        </section>

        <section className="panel">
          <div className="department-grid">
            {departments.map((department) => (
              <Link key={department.slug} to={`/jobs/departments/${department.slug}`} className="department-card">
                <div className="department-card-head">
                  <h3>{department.name}</h3>
                  <span>{department.jobsCount} job{department.jobsCount === 1 ? '' : 's'}</span>
                </div>
                <p>{department.description}</p>
              </Link>
            ))}
          </div>
          {!departments.length && <p className="empty-state">No departments matched your search.</p>}
        </section>
      </section>
    </main>
  )
}

export default DepartmentsPage
