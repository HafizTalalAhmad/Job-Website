import React, { useState } from 'react'
import { createSubscriber } from '../lib/jobsApi'

function SubscriptionBar() {
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
      await createSubscriber({ email, source: 'subscription_bar' })
      setDone(true)
      setEmail('')
    } catch (submitError) {
      setError(submitError.message || 'Unable to save subscription.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="subscription-wrap">
      <div className="container subscription-inner">
        <div>
          <h3>Get Latest Jobs by Email</h3>
          <p>Subscribe to receive daily job alerts in your inbox.</p>
        </div>
        <form onSubmit={onSubmit} className="subscription-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Subscribe'}</button>
        </form>
        {done && <span className="subscribed-msg">Subscribed successfully.</span>}
        {error && <span className="form-error">{error}</span>}
      </div>
    </section>
  )
}

export default SubscriptionBar
