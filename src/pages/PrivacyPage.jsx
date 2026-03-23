import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'

function PrivacyPage() {
  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel about-panel legal-panel">
        <h1 className="panel-title">Privacy Policy</h1>
        <p>
          Pakistan Jobs Hub keeps personal information limited to what users choose to submit, such as contact form
          messages and subscription email addresses.
        </p>
        <p>
          We use that information only to manage contact responses, subscriptions, and basic website operations. We do
          not intentionally collect unnecessary personal information.
        </p>
        <p>
          Users should avoid sharing sensitive information in contact forms unless it is necessary for their request.
        </p>
      </section>
    </main>
  )
}

export default PrivacyPage
