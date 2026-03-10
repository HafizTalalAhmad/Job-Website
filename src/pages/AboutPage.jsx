import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'

function AboutPage() {
  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel about-panel">
        <h1 className="panel-title">About Pakistan Jobs Hub</h1>
        <p>
          Pakistan Jobs Hub is a modern React job-board reference project inspired by the practical, information-dense
          structure of traditional newspaper-style job portals.
        </p>
        <p>
          The app focuses on high readability, quick filtering, and category-first navigation. It uses mock JSON data
          now and is structured for backend/API integration later.
        </p>
      </section>
    </main>
  )
}

export default AboutPage
