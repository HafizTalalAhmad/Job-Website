import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { createSubscriber } from '../lib/jobsApi'
import SocialButtons from './SocialButtons'

function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setDone(false)
    setError('')
    if (!email.trim()) return
    setIsSubmitting(true)
    try {
      await createSubscriber({ email, source: 'footer' })
      setDone(true)
      setEmail('')
    } catch (submitError) {
      setError(submitError.message || 'Unable to save subscription.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="site-footer">
      <div className="container footer-modern">
        <section className="footer-brand">
          <h3>Pakistan Jobs Hub</h3>
          <p>Daily jobs from newspapers, organizations, and public/private sectors in Pakistan.</p>
          <SocialButtons className="footer-social-buttons" />
        </section>

        <section className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/jobs/date">Jobs by Date</Link></li>
            <li><Link to="/jobs/government">Government Jobs</Link></li>
            <li><Link to="/jobs/location">Jobs by Location</Link></li>
            <li><Link to="/jobs/profession">Jobs by Profession</Link></li>
            <li><Link to="/jobs/newspaper">Jobs by Newspaper</Link></li>
            <li><Link to="/archives">Archives</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </section>

        <section className="footer-subscribe">
          <h4>Subscribe For Alerts</h4>
          <p>Get latest jobs by email.</p>
          <form onSubmit={onSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Subscribe'}</button>
          </form>
          {done && <span>Subscription successful.</span>}
          {error && <span className="form-error">{error}</span>}
        </section>
      </div>

      <div className="container footer-row">
        <p>Copyright 2025-2026 Pakistan Jobs Hub. All Rights Reserved.</p>
        <div className="footer-mini-links">
          <Link to="/blog">Blog</Link>
          <Link to="/archives">Archives</Link>
          <Link to="/contact">Support</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer


