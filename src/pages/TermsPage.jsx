import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'

function TermsPage() {
  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel about-panel legal-panel">
        <h1 className="panel-title">Terms of Use</h1>
        <p>
          Pakistan Jobs Hub shares public job information to make browsing easier for job seekers across Pakistan.
        </p>
        <p>
          We try to present listings clearly and in good faith, but users should always verify deadlines, eligibility,
          and application methods from the official job notice, poster, or organization website before applying.
        </p>
        <p>
          By using this website, you agree that Pakistan Jobs Hub is an informational service and not the hiring
          authority for the advertised jobs.
        </p>
      </section>
    </main>
  )
}

export default TermsPage
