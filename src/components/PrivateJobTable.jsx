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
    deadline: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'deadline', direction: 'asc' })

  const options = useMemo(
    () => ({
      companies: [...new Set(jobs.map((job) => job.organization).filter(Boolean))].sort(),
      professions: [...new Set(jobs.map((job) => job.category).filter(Boolean))].sort(),
      industries: [...new Set(jobs.map((job) => job.industry).filter(Boolean))].sort(),
      sources: [...new Set(jobs.map((job) => job.source).filter(Boolean))].sort()
    }),
    [jobs]
  )

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '')
      const locationLine = [job.city, provinceText].filter(Boolean).join(', ')
      const safeSummary = (job.summary || '').trim()
      const roleText = `${job.title} ${safeSummary}`.toLowerCase()

      const matchesRole = !filters.role || roleText.includes(filters.role.toLowerCase())
      const matchesCompany = !filters.company || job.organization === filters.company
      const matchesLocation =
        !filters.location || locationLine.toLowerCase().includes(filters.location.toLowerCase())
      const matchesProfession = !filters.profession || job.category === filters.profession
      const matchesIndustry = !filters.industry || job.industry === filters.industry
      const matchesSource = !filters.source || job.source === filters.source
      const matchesDeadline = !filters.deadline || job.deadline === filters.deadline

      return (
        matchesRole &&
        matchesCompany &&
        matchesLocation &&
        matchesProfession &&
        matchesIndustry &&
        matchesSource &&
        matchesDeadline
      )
    })

    const directionFactor = sortConfig.direction === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const provinceA = a.province || (a.location ? String(a.location).split(',')[0].trim() : '')
      const provinceB = b.province || (b.location ? String(b.location).split(',')[0].trim() : '')
      const locationA = [a.city, provinceA].filter(Boolean).join(', ')
      const locationB = [b.city, provinceB].filter(Boolean).join(', ')

      const valueMapA = {
        role: a.title || '',
        company: a.organization || '',
        location: locationA,
        profession: a.category || '',
        industry: a.industry || '',
        source: a.source || '',
        deadline: a.deadline || ''
      }
      const valueMapB = {
        role: b.title || '',
        company: b.organization || '',
        location: locationB,
        profession: b.category || '',
        industry: b.industry || '',
        source: b.source || '',
        deadline: b.deadline || ''
      }

      const left = String(valueMapA[sortConfig.key] || '').toLowerCase()
      const right = String(valueMapB[sortConfig.key] || '').toLowerCase()
      return left.localeCompare(right) * directionFactor
    })
  }, [filters, jobs, sortConfig])

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

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
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
            <col className="private-col-deadline" />
            <col className="private-col-action" />
          </colgroup>
          <thead>
            <tr>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('role')}>Role{sortIndicator('role')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('company')}>Company{sortIndicator('company')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('location')}>Location{sortIndicator('location')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('profession')}>Profession{sortIndicator('profession')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('industry')}>Industry{sortIndicator('industry')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('source')}>Source{sortIndicator('source')}</button></th>
              <th><button type="button" className="private-job-sort-btn" onClick={() => toggleSort('deadline')}>Deadline{sortIndicator('deadline')}</button></th>
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
            <td colSpan="8" className="private-job-empty-cell">
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
