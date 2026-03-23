import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { applyFilters, groupJobs, sortJobs } from '../utils/jobs'
import JobGroupByDate from '../components/JobGroupByDate'
import HeroSlider from '../components/HeroSlider'
import FeaturedJobs from '../components/FeaturedJobs'
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

  const starterCards = [
    {
      title: 'Latest Government Jobs',
      description: 'Open the newest government jobs first.',
      to: '/jobs/government'
    },
    {
      title: 'Browse Departments',
      description: 'Choose this if you know the department name.',
      to: '/jobs/organization'
    },
    {
      title: 'Jobs in My City',
      description: 'Choose this if you want jobs in your city.',
      to: '/jobs/location'
    }
  ]

  const quickStartCards = [
    {
      title: 'Departments',
      description: 'Search department-wise.',
      to: '/jobs/organization'
    },
    {
      title: 'Locations',
      description: 'Search city-wise.',
      to: '/jobs/location'
    },
    {
      title: 'Latest by Date',
      description: 'See the newest posts first.',
      to: '/jobs/date'
    },
    {
      title: 'Profession',
      description: 'Search by field or role.',
      to: '/jobs/profession'
    },
    {
      title: 'Newspaper',
      description: 'Search by newspaper source.',
      to: '/jobs/newspaper'
    }
  ]

  const popularDepartments = departmentDirectory.slice(0, 10)
  const popularCities = [...new Set(jobs.map((job) => job.city).filter(Boolean))].slice(0, 8)
  const popularProfessions = [...new Set(jobs.map((job) => job.category).filter(Boolean))].slice(0, 8)
  const popularSources = [...new Set(jobs.map((job) => job.source).filter(Boolean))].slice(0, 6)
  const newsUpdates = sortJobs(jobs, 'latest').slice(0, 4)

  useEffect(() => {
    setCurrentPage(1)
  }, [jobs, query])

  return (
    <>
      <div className="container">
        <section className="home-guide-hero panel">
          <div className="home-guide-copy">
            <span className="section-kicker">Start Here</span>
            <h1 className="panel-title">Find Jobs in Pakistan in a Simple Way</h1>
            <p className="panel-intro">
              Start with one option below and we will guide you to the right jobs.
            </p>
            <div className="home-hero-entry-grid">
              {starterCards.map((card) => (
                <Link key={card.title} to={card.to} className="home-hero-entry-card">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span>Open</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HeroSlider jobs={jobs} />

        <section className="home-browse-guide panel">
          <div className="panel-head-row">
            <h2 className="panel-title">Browse Jobs Your Way</h2>
            <span>Simple options</span>
          </div>
          <p className="home-browse-lead">
            Choose one option below, then click the blue job title on the next page to open full details.
          </p>
          <div className="home-start-grid">
            {quickStartCards.map((card) => (
              <Link key={card.title} to={card.to} className="home-start-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <main className="container layout">
        <section className="content">
          <section className="home-featured-layout">
            <FeaturedJobs jobs={jobs} className="home-featured-panel" />
            <section className="panel home-latest-updates-panel">
              <div className="panel-head-row">
                <h2 className="panel-title">Latest Updates</h2>
                <span>Fresh notices</span>
              </div>
              <div className="home-latest-updates-marquee">
                <div className="home-latest-updates-track">
                  {[...newsUpdates, ...newsUpdates].map((job, index) => (
                    <Link key={`${job.id}-${index}`} to={`/job/${job.id}`} className="home-latest-update-line">
                      <span className="home-latest-update-bullet">•</span>
                      <span>{job.postDate} | {job.source} | {job.title} | {job.organization} | {job.city}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
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

          <section className="about-strip top-align-block">
            <p>
              <strong>About Us:</strong> Pakistan Jobs Hub is a public service style job portal that organizes newspaper and organization
              job ads in a fast, readable format for job seekers across Pakistan.
            </p>
          </section>
        </section>
      </main>
    </>
  )
}

export default HomePage
