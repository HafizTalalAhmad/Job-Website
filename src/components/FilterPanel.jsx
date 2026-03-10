import React from 'react'

function FilterPanel({ mode, filters, options, onChange, sortBy, onSortChange }) {
  const setFilter = (key, value) => onChange((prev) => ({ ...prev, [key]: value }))

  const config = {
    date: {
      key: 'postDate',
      label: 'Filter by Date',
      items: options.postDates,
      allLabel: 'All Dates'
    },
    location: {
      key: 'location',
      label: 'Filter by Location',
      items: options.locations,
      allLabel: 'All Locations'
    },
    profession: {
      key: 'category',
      label: 'Filter by Profession',
      items: options.categories,
      allLabel: 'All Professions'
    },
    industry: {
      key: 'industry',
      label: 'Filter by Industry',
      items: options.industries,
      allLabel: 'All Industries'
    },
    organization: {
      key: 'organization',
      label: 'Filter by Organization',
      items: options.organizations,
      allLabel: 'All Organizations'
    },
    government: {
      key: 'location',
      label: 'Filter Government Jobs by Location',
      items: options.locations,
      allLabel: 'All Locations'
    }
  }

  const current = config[mode]

  if (!current) return null

  return (
    <section className="panel" aria-label="Page filter">
      <h2 className="panel-title">{current.label}</h2>
      <div className="single-filter-row">
        <select
          value={filters[current.key] || ''}
          onChange={(e) => setFilter(current.key, e.target.value)}
        >
          <option value="">{current.allLabel}</option>
          {current.items.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="latest">Sort: Latest</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="alphabetical">Sort: Alphabetical</option>
        </select>

        <button
          type="button"
          className="clear-btn"
          onClick={() => onChange((prev) => ({ ...prev, [current.key]: '' }))}
        >
          Clear
        </button>
      </div>
    </section>
  )
}

export default FilterPanel
