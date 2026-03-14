import React, { useState } from 'react'
import { createSubscriber } from '../lib/jobsApi'

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
          <div className="footer-social-buttons">
            <a href="#" aria-label="Facebook" className="social-btn social-facebook">f</a>
            <a href="#" aria-label="YouTube" className="social-btn social-youtube">▶</a>
            <a href="#" aria-label="X" className="social-btn social-x">X</a>
            <a href="#" aria-label="LinkedIn" className="social-btn social-linkedin">in</a>
          </div>
        </section>

        <section className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Jobs by Date</a></li>
            <li><a href="#">Government Jobs</a></li>
            <li><a href="#">Jobs by Location</a></li>
            <li><a href="#">Jobs by Profession</a></li>
            <li><a href="#">Jobs by Newspaper</a></li>
            <li><a href="#">Archives</a></li>
            <li><a href="#">Contact Us</a></li>
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
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
