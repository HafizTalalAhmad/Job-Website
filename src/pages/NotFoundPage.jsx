import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="container page-block">
      <section className="panel">
        <h1 className="panel-title">404 - Page Not Found</h1>
        <p className="panel-intro">The page you are looking for does not exist.</p>
        <Link className="action-btn secondary" to="/">Back to Home</Link>
      </section>
    </main>
  )
}

export default NotFoundPage
