import React, { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'

function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }
  const handleSubscribe = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel contact-modern">
        <div className="contact-left">
          <h1 className="panel-title">Contact Us</h1>
          <p className="panel-intro">Send your query regarding jobs, posting issues, or suggestions.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="text" placeholder="Subject" required />
            <textarea placeholder="Message" rows="6" required />
            <button type="submit" className="load-more-btn">Submit</button>
          </form>
          {submitted && <p className="form-success">Your message has been submitted.</p>}
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
              <button type="submit">Subscribe</button>
            </form>
            {subscribed && <p>Subscribed successfully.</p>}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default ContactPage
