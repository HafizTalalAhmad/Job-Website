import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { applyFilters, groupJobs, sortJobs } from '../utils/jobs'
import HeroSlider from '../components/HeroSlider'
import FeaturedJobs from '../components/FeaturedJobs'
import { useJobs } from '../context/JobsContext'
import { departmentDirectory } from '../data/departments'

function HomePage() {
  const { jobs } = useJobs()
  const location = useLocation()
  const query = new URLSearchParams(location.search).get('q') || ''

  const filtered = useMemo(
    () => sortJobs(applyFilters(jobs, { keyword: query, location: '', category: '', industry: '', organization: '', type: '', postDate: '' }), 'latest'),
    [jobs, query]
  )

  const starterCards = [
    {
      title: 'All Jobs',
      description: 'See all jobs in one place.',
      to: '/jobs/all'
    },
    {
      title: 'Latest Government Jobs',
      description: 'Open the newest government jobs first.',
      to: '/jobs/government'
    },
    {
      title: 'Private Jobs',
      description: 'Open the newest private jobs first.',
      to: '/jobs/private'
    }
  ]

  const popularDepartments = departmentDirectory.slice(0, 10)
  const popularCities = [...new Set(jobs.map((job) => job.city).filter(Boolean))].slice(0, 8)
  const popularProfessions = [...new Set(jobs.map((job) => job.category).filter(Boolean))].slice(0, 8)
  const popularSources = [...new Set(jobs.map((job) => job.source).filter(Boolean))].slice(0, 6)
  const newsUpdates = sortJobs(jobs, 'latest').slice(0, 4)

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
                <Link key={card.title} to={card.to} state={{ bookmarkPrompt: true }} className="home-hero-entry-card">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span>Open</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HeroSlider jobs={jobs} />
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
