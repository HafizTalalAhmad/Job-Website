import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { applyFilters, groupJobs, sortJobs } from '../utils/jobs'
import JobGroupByDate from '../components/JobGroupByDate'
import LatestTicker from '../components/LatestTicker'
import HeroSlider from '../components/HeroSlider'
import { useJobs } from '../context/JobsContext'

function HomePage() {
  const { jobs } = useJobs()
  const location = useLocation()
  const pageSize = 50
  const [currentPage, setCurrentPage] = useState(1)
  const query = new URLSearchParams(location.search).get('q') || ''

  const filtered = useMemo(
    () => sortJobs(applyFilters(jobs, { keyword: query, location: '', category: '', industry: '', organization: '', type: '', postDate: '' }), 'latest'),
    [jobs, query]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pagedJobs = filtered.slice(start, end)
  const grouped = useMemo(() => groupJobs(pagedJobs, 'postDate'), [pagedJobs])

  useEffect(() => {
    setCurrentPage(1)
  }, [jobs, query])

  return (
    <>
      <div className="container">
        <LatestTicker jobs={jobs} />
        <HeroSlider />
      </div>

      <main className="container layout">
        <section className="content">
          <section className="panel">
            <div className="panel-head-row">
              <h2 className="panel-title">Latest Job Bulletin</h2>
              <span>{filtered.length} jobs found</span>
            </div>
            <JobGroupByDate grouped={grouped} />
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
    </>
  )
}

export default HomePage
