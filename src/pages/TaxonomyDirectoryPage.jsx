import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { encodeTaxonomyValue, getTaxonomyConfig } from '../data/taxonomies'
import { useJobs } from '../context/JobsContext'

function TaxonomyDirectoryPage({ mode }) {
  const { jobs } = useJobs()
  const [query, setQuery] = useState('')
  const config = getTaxonomyConfig(mode)

  const items = useMemo(() => {
    if (!config) return []

    const keyword = query.trim().toLowerCase()

    return config
      .deriveItems(jobs)
      .filter((item) => {
        if (!keyword) return true

        return (
          item.label.toLowerCase().includes(keyword) ||
          config.itemDescription(item).toLowerCase().includes(keyword)
        )
      })
  }, [jobs, config, query])

  const popularItems = items.filter((item) => item.count > 0).slice(0, 6)

  if (!config) return null

  return (
    <main className="container layout inner-layout">
      <section className="content">
        <section className="panel page-hero-panel">
          <div className="page-hero-copy">
            <span className="section-kicker">{config.heroKicker}</span>
            <h1 className="panel-title">{config.title}</h1>
            <p className="panel-intro">{config.heroDescription}</p>
          </div>
          <div className="page-hero-stats">
            <div className="hero-stat-box">
              <strong>{items.length}</strong>
              <span>{config.directoryTitle.replace(' Directory', '')}</span>
            </div>
          </div>
        </section>

        <section className="panel helper-steps-panel">
          <h2 className="panel-title">{config.helperTitle}</h2>
          <div className="helper-steps-grid">
            {config.helperSteps.map((step, index) => (
              <article key={step.title} className="helper-step-card">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head-row">
            <h2 className="panel-title">{config.directoryTitle}</h2>
            <span>{items.length} items</span>
          </div>
          {!!popularItems.length && !query && (
            <div className="department-inline-list popular-department-list">
              {popularItems.map((item) => (
                <Link key={item.value} to={`/jobs/${mode}/${encodeTaxonomyValue(item.value)}`} className="department-pill">
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <div className="single-filter-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={config.searchPlaceholder}
            />
          </div>
        </section>

        <section className="panel">
          <div className="department-grid">
            {items.map((item) => (
              <Link key={item.value} to={`/jobs/${mode}/${encodeTaxonomyValue(item.value)}`} className="department-card">
                <div className="department-card-head">
                  <div className="department-card-title-wrap">
                    <h3>{config.itemTitle(item)}</h3>
                  </div>
                  <span>{item.count} {config.itemCountLabel}</span>
                </div>
                <p>{config.itemDescription(item)}</p>
              </Link>
            ))}
          </div>
          {!items.length && <p className="empty-state">No matching items were found.</p>}
        </section>
      </section>
    </main>
  )
}

export default TaxonomyDirectoryPage
