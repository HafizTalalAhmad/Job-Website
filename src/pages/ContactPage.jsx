import React, { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import { createContactMessage, createSubscriber } from '../lib/jobsApi'

function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribeError, setSubscribeError] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(false)
    setSubmitError('')

    setIsSubmitting(true)
    try {
      await createContactMessage(form)
      setSubmitted(true)
      setForm({ fullName: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit your message right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setSubscribed(false)
    setSubscribeError('')
    if (!email.trim()) return
    setIsSubscribing(true)
    try {
      await createSubscriber({ email, source: 'contact' })
      setSubscribed(true)
      setEmail('')
    } catch (error) {
      setSubscribeError(error.message || 'Unable to save subscription right now.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel contact-modern">
        <div className="contact-left">
          <h1 className="panel-title">Contact Us</h1>
          <p className="panel-intro">Send your query regarding jobs, posting issues, or suggestions.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => onChange('subject', e.target.value)}
              required
            />
            <textarea
              placeholder="Message"
              rows="6"
              value={form.message}
              onChange={(e) => onChange('message', e.target.value)}
              required
            />
            <button type="submit" className="load-more-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          {submitted && <p className="form-success">Your message has been submitted.</p>}
          {submitError && <p className="form-error">{submitError}</p>}
        </div>

        <aside className="contact-right">
          <h3>Contact Information</h3>
          <p>Email: support@pakistanjobshub.com</p>
          <p>Timing: Monday - Saturday</p>
          <p>Response: Within 24-48 hours</p>

          <h4>Follow Us</h4>
          <div className="contact-socials">
            <a href="#" className="social-btn social-facebook" aria-label="Facebook">f</a>
            <a href="#" className="social-btn social-youtube" aria-label="YouTube">▶</a>
            <a href="#" className="social-btn social-x" aria-label="X">X</a>
            <a href="#" className="social-btn social-linkedin" aria-label="LinkedIn">in</a>
          </div>

          <div className="contact-subscribe">
            <h4>Subscribe For Job Alerts</h4>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <button type="submit" disabled={isSubscribing}>{isSubscribing ? 'Saving...' : 'Subscribe'}</button>
            </form>
            {subscribed && <p>Subscribed successfully.</p>}
            {subscribeError && <p className="form-error">{subscribeError}</p>}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default ContactPage
