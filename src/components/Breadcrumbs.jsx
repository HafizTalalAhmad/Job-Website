import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const labels = {
  '/jobs/date': 'Jobs by Date',
  '/jobs/location': 'Jobs by Location',
  '/jobs/profession': 'Jobs by Profession',
  '/jobs/industry': 'Jobs by Industry',
  '/jobs/organization': 'Jobs by Departments',
  '/jobs/newspaper': 'Jobs by Newspaper',
  '/jobs/government': 'Government Jobs',
  '/jobs/private': 'Private Jobs',
  '/jobs/all': 'All Jobs',
  '/admin': 'Admin',
  '/archives': 'Archives',
  '/blog': 'Blog',
  '/about': 'About',
  '/terms': 'Terms',
  '/privacy': 'Privacy'
}

function Breadcrumbs({ jobTitle, parentTo, parentLabel }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  if (isHome) return null

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {(parentTo || jobTitle || labels[pathname]) && <span>/</span>}
      {parentTo && parentLabel ? (
        <>
          <Link to={parentTo}>{parentLabel}</Link>
          <span>/</span>
        </>
      ) : null}
      <span>{jobTitle || labels[pathname] || 'Page'}</span>
    </nav>
  )
}

export default Breadcrumbs
