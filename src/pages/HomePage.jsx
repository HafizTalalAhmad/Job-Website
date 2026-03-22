import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { applyFilters, groupJobs, sortJobs } from '../utils/jobs'
import JobGroupByDate from '../components/JobGroupByDate'
import LatestTicker from '../components/LatestTicker'
import HeroSlider from '../components/HeroSlider'
import { useJobs } from '../context/JobsContext'
import { departmentDirectory } from '../data/departments'

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
  const quickStartCards = [
    {
      title: 'Jobs by Departments',
      description: 'Start with the department you know, such as WAPDA, NADRA, FPSC, Railways, or Army.',
      to: '/jobs/organization'
    },
    {
      title: 'Jobs by Location',
      description: 'Open jobs city-wise if you want Lahore, Karachi, Islamabad, Peshawar, or another city.',
      to: '/jobs/location'
    },
    {
      title: 'Jobs by Date',
      description: 'Check jobs date-wise when you want the newest posts first.',
      to: '/jobs/date'
    },
    {
      title: 'Jobs by Profession',
      description: 'Choose a profession like teaching, banking, engineering, data entry, or administration.',
      to: '/jobs/profession'
    },
    {
      title: 'Jobs by Newspaper',
      description: 'Browse jobs published in Jang, Dawn, Express, The News, and other sources.',
      to: '/jobs/newspaper'
    }
  ]

  const popularDepartments = departmentDirectory.slice(0, 10)
  const popularCities = [...new Set(jobs.map((job) => job.city).filter(Boolean))].slice(0, 8)
  const popularProfessions = [...new Set(jobs.map((job) => job.category).filter(Boolean))].slice(0, 8)
  const popularSources = [...new Set(jobs.map((job) => job.source).filter(Boolean))].slice(0, 6)
  const latestGovernmentJobs = sortJobs(jobs.filter((job) => job.type === 'government'), 'latest').slice(0, 6)

  useEffect(() => {
    setCurrentPage(1)
  }, [jobs, query])

  return (
    <>
      <div className="container">
        <section className="about-strip top-align-block">
          <p>
            <strong>About Us:</strong> Pakistan Jobs Hub is a public service style job portal that organizes newspaper and organization
            job ads in a fast, readable format for job seekers across Pakistan.
          </p>
        </section>
        <section className="home-guide-hero panel">
          <div className="home-guide-copy">
            <span className="section-kicker">Start Here</span>
            <h1 className="panel-title">Find Government Jobs in Pakistan</h1>
            <p className="panel-intro">
              If job websites feel confusing, start from what you already know: a department, city, date, profession, or newspaper.
            </p>
          </div>
          <div className="home-guide-actions">
            <Link to="/jobs/government" className="action-btn">Open Government Jobs</Link>
            <Link to="/jobs/organization" className="action-btn secondary">Browse Departments</Link>
          </div>
        </section>
        <LatestTicker jobs={jobs} />
        <HeroSlider />
        <section className="home-quick-start panel">
          <div className="panel-head-row">
            <h2 className="panel-title">Quick Start</h2>
            <span>Choose one simple way to begin</span>
          </div>
          <div className="home-start-grid">
            {quickStartCards.map((card) => (
              <Link key={card.title} to={card.to} className="home-start-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="home-helper-strip panel">
          <div className="helper-steps-grid">
            <article className="helper-step-card">
              <span>1</span>
              <h3>Choose a Section</h3>
              <p>Select departments, city, date, profession, or newspaper to keep things simple.</p>
            </article>
            <article className="helper-step-card">
              <span>2</span>
              <h3>Open Relevant Jobs</h3>
              <p>The next page will show only the jobs related to what you selected.</p>
            </article>
            <article className="helper-step-card">
              <span>3</span>
              <h3>Click Blue Headline</h3>
              <p>Open the full job page to see poster, deadline, application method, and details.</p>
            </article>
          </div>
        </section>
        <section className="home-explore-grid">
          <section className="panel">
            <h2 className="panel-title">Popular Departments</h2>
            <div className="department-inline-list">
              {popularDepartments.map((department) => (
                <Link key={department.slug} to={`/jobs/departments/${department.slug}`} className="department-pill">
                  {department.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2 className="panel-title">Popular Cities</h2>
            <div className="department-inline-list">
              {popularCities.map((city) => (
                <Link key={city} to={`/jobs/location/${encodeURIComponent(city)}`} className="department-pill">
                  {city}
                </Link>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2 className="panel-title">Popular Professions</h2>
            <div className="department-inline-list">
              {popularProfessions.map((profession) => (
                <Link key={profession} to={`/jobs/profession/${encodeURIComponent(profession)}`} className="department-pill">
                  {profession}
                </Link>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2 className="panel-title">Popular Newspapers</h2>
            <div className="department-inline-list">
              {popularSources.map((source) => (
                <Link key={source} to={`/jobs/newspaper/${encodeURIComponent(source)}`} className="department-pill">
                  {source}
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>

      <main className="container layout">
        <section className="content">
          <section className="panel">
            <div className="panel-head-row">
              <h2 className="panel-title">Latest Government Jobs</h2>
              <Link to="/jobs/government" className="panel-link">See All</Link>
            </div>
            <div className="home-highlight-list">
              {latestGovernmentJobs.map((job) => (
                <Link key={job.id} to={`/job/${job.id}`} className="home-highlight-card">
                  <strong>{job.title}</strong>
                  <span>{job.organization} | {job.city}</span>
                </Link>
              ))}
            </div>
          </section>
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
