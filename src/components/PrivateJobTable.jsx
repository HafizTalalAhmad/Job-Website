import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/jobs'

function PrivateJobTable({ jobs }) {
  const [filters, setFilters] = useState({
    role: '',
    company: '',
    location: '',
    profession: '',
    industry: '',
    source: '',
    jobType: '',
    deadline: ''
  })

  const options = useMemo(
    () => ({
      companies: [...new Set(jobs.map((job) => job.organization).filter(Boolean))].sort(),
      professions: [...new Set(jobs.map((job) => job.category).filter(Boolean))].sort(),
      industries: [...new Set(jobs.map((job) => job.industry).filter(Boolean))].sort(),
      sources: [...new Set(jobs.map((job) => job.source).filter(Boolean))].sort(),
      jobTypes: [...new Set(jobs.map((job) => job.employmentType || 'Private Job').filter(Boolean))].sort()
    }),
    [jobs]
  )

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
      const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
      const typeLabel = job.employmentType || 'Private Job'
      const safeSummary = (job.summary || '').trim()
      const roleText = `${job.title} ${safeSummary}`.toLowerCase()

      const matchesRole = !filters.role || roleText.includes(filters.role.toLowerCase())
      const matchesCompany = !filters.company || job.organization === filters.company
      const matchesLocation =
        !filters.location || locationLine.toLowerCase().includes(filters.location.toLowerCase())
      const matchesProfession = !filters.profession || job.category === filters.profession
      const matchesIndustry = !filters.industry || job.industry === filters.industry
      const matchesSource = !filters.source || job.source === filters.source
      const matchesType = !filters.jobType || typeLabel === filters.jobType
      const matchesDeadline = !filters.deadline || job.deadline === filters.deadline

      return (
        matchesRole &&
        matchesCompany &&
        matchesLocation &&
        matchesProfession &&
        matchesIndustry &&
        matchesSource &&
        matchesType &&
        matchesDeadline
      )
    })
  }, [filters, jobs])

  if (!jobs.length) {
    return <p className="empty-state">No private jobs matched your criteria.</p>
  }

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      role: '',
      company: '',
      location: '',
      profession: '',
      industry: '',
      source: '',
      jobType: '',
      deadline: ''
    })
  }

  return (
    <div className="private-job-table">
      <div className="private-job-table-wrap">
        <table className="private-job-grid-table">
          <colgroup>
            <col className="private-col-role" />
            <col className="private-col-company" />
            <col className="private-col-location" />
            <col className="private-col-profession" />
            <col className="private-col-industry" />
            <col className="private-col-source" />
            <col className="private-col-type" />
            <col className="private-col-deadline" />
            <col className="private-col-action" />
          </colgroup>
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Profession</th>
              <th>Industry</th>
              <th>Source</th>
              <th>Job Type</th>
              <th>Deadline</th>
              <th>Action</th>
            </tr>
            <tr className="private-job-filter-row">
              <th>
                <input
                  type="text"
                  value={filters.role}
                  onChange={(e) => updateFilter('role', e.target.value)}
                  placeholder="Search role"
                />
              </th>
              <th>
                <select value={filters.company} onChange={(e) => updateFilter('company', e.target.value)}>
                  <option value="">All</option>
                  {options.companies.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  placeholder="City or province"
                />
              </th>
              <th>
                <select value={filters.profession} onChange={(e) => updateFilter('profession', e.target.value)}>
                  <option value="">All</option>
                  {options.professions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select value={filters.industry} onChange={(e) => updateFilter('industry', e.target.value)}>
                  <option value="">All</option>
                  {options.industries.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select value={filters.source} onChange={(e) => updateFilter('source', e.target.value)}>
                  <option value="">All</option>
                  {options.sources.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select value={filters.jobType} onChange={(e) => updateFilter('jobType', e.target.value)}>
                  <option value="">All</option>
                  {options.jobTypes.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <input
                  type="date"
                  value={filters.deadline}
                  onChange={(e) => updateFilter('deadline', e.target.value)}
                />
              </th>
              <th>
                <button type="button" className="private-job-clear-btn" onClick={clearFilters}>
                  Clear
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
        {filteredJobs.map((job) => {
          const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
          const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
          const typeLabel = job.employmentType || 'Private Job'
          const safeSummary = (job.summary || '').trim()

          return (
            <tr key={job.id}>
              <td>
                <div className="private-job-cell-title">
                  <Link to={`/job/${job.id}`} className="private-job-title-link">
                    {job.title}
                  </Link>
                  <p>{safeSummary}</p>
                </div>
              </td>
              <td>{job.organization}</td>
              <td>{locationLine || 'Pakistan'}</td>
              <td>{job.category}</td>
              <td>{job.industry}</td>
              <td>{job.source}</td>
              <td>{typeLabel}</td>
              <td>
                <div className="private-job-deadline-cell">
                  <strong>{formatDate(job.deadline)}</strong>
                  <span>Posted {formatDate(job.postDate)}</span>
                </div>
              </td>
              <td>
                <Link to={`/job/${job.id}`} className="action-btn secondary private-job-open-btn">
                  Open
                </Link>
              </td>
            </tr>
          )
        })}
        {!filteredJobs.length && (
          <tr>
            <td colSpan="9" className="private-job-empty-cell">
              No private jobs matched the table filters.
            </td>
          </tr>
        )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PrivateJobTable
