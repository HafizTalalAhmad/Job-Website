import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'
import JobGroupByDate from '../components/JobGroupByDate'
import PrivateJobTable from '../components/PrivateJobTable'
import { applyFilters, getUniqueOptions, groupJobs, sortJobs } from '../utils/jobs'
import { useJobs } from '../context/JobsContext'

const baseFilters = {
  keyword: '',
  location: '',
  category: '',
  industry: '',
  organization: '',
  type: '',
  postDate: ''
}

function ListingPage({ mode, title, description }) {
  const { jobs } = useJobs()
  const location = useLocation()
  const [filters, setFilters] = useState(baseFilters)
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const pageSize = 50
  const query = new URLSearchParams(location.search).get('q') || ''
  const isPrivatePage = mode === 'private'

  const options = useMemo(
    () => ({
      postDates: getUniqueOptions(jobs, 'postDate'),
      locations: getUniqueOptions(jobs, 'city'),
      categories: getUniqueOptions(jobs, 'category'),
      industries: getUniqueOptions(jobs, 'industry'),
      organizations: getUniqueOptions(jobs, 'organization')
    }),
    [jobs]
  )

  const filtered = useMemo(() => {
    const filteredBase =
      mode === 'government'
        ? jobs.filter((job) => job.type === 'government')
        : mode === 'private'
          ? jobs.filter((job) => job.type === 'private')
          : jobs
    const baseFiltersWithQuery = { ...filters, keyword: query || filters.keyword }
    const base = sortJobs(applyFilters(filteredBase, baseFiltersWithQuery), sortBy)

    if (mode !== 'date' || (!fromDate && !toDate)) {
      return base
    }

    return base.filter((job) => {
      const afterFrom = !fromDate || job.postDate >= fromDate
      const beforeTo = !toDate || job.postDate <= toDate
      return afterFrom && beforeTo
    })
  }, [filters, sortBy, mode, fromDate, toDate, query])
  const showsFilters = mode !== 'government' && mode !== 'private' && mode !== 'all'

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pagedJobs = filtered.slice(start, end)
  const groupedByDate = useMemo(() => groupJobs(pagedJobs, 'postDate'), [pagedJobs])
  const privateStats = useMemo(
    () => ({
      total: filtered.length,
      pageStart: filtered.length ? start + 1 : 0,
      pageEnd: Math.min(end, filtered.length)
    }),
    [filtered.length, start, end]
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, mode, fromDate, toDate, query])

  return (
    <main className="container layout inner-layout">
      <section className="content">
        <section className="panel">
          {isPrivatePage ? (
            <div className="private-listing-hero">
              <div className="private-listing-copy">
                <span className="section-kicker">Private Sector Jobs</span>
                <h1 className="panel-title">{title}</h1>
                <p className="panel-intro">
                  Find company jobs in a cleaner board layout. Each row gives you the role, company, location, deadline,
                  and direct next step.
                </p>
              </div>
              <div className="private-listing-stats">
                <div className="private-listing-stat">
                  <strong>{privateStats.total}</strong>
                  <span>Total jobs</span>
                </div>
                <div className="private-listing-stat">
                  <strong>{privateStats.pageStart}-{privateStats.pageEnd}</strong>
                  <span>Shown now</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="panel-title">{title}</h1>
              <p className="panel-intro">{description}</p>
              <p className="panel-intro listing-helper-line">
                {showsFilters
                  ? 'Tip: use the filters below if needed, then click any blue job headline to open full details.'
                  : 'Tip: click any blue job headline below to open full details.'}
              </p>
            </>
          )}
        </section>

        {showsFilters && (
          <FilterPanel
            mode={mode}
            filters={filters}
            options={options}
            onChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {mode === 'date' && (
          <section className="panel">
            <h2 className="panel-title">Date Range Calendar</h2>
            <div className="archive-filter-row">
              <label>
                From Date
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </label>
              <label>
                To Date
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </label>
            </div>
          </section>
        )}

        <section className="panel grouped-listing">
          {isPrivatePage ? <PrivateJobTable jobs={pagedJobs} /> : <JobGroupByDate grouped={groupedByDate} />}
          {!isPrivatePage && !groupedByDate.length && <p className="empty-state">No jobs matched your criteria.</p>}
          <div className="pagination-wrap">
            <div className="pagination">
              <button
                className="page-btn arrow-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                {'<<'}
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    className={`page-btn${currentPage === page ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                className="page-btn arrow-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                {'>>'}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default ListingPage
