import React, { useState } from 'react'

function SubscriptionBar() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setDone(true)
    setEmail('')
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
          <button type="submit">Subscribe</button>
        </form>
        {done && <span className="subscribed-msg">Subscribed successfully.</span>}
      </div>
    </section>
  )
}

export default SubscriptionBar
