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

  return (
    <main className="container layout inner-layout">
      <section className="content">
        <section className="panel">
          <h1 className="panel-title">Jobs by Departments</h1>
          <p className="panel-intro">
            Browse government departments of Pakistan and open the jobs currently relevant to each department.
          </p>
        </section>

        <section className="panel">
          <h2 className="panel-title">Government Departments Directory</h2>
          <div className="single-filter-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search departments..."
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
