import React from 'react'
import { Link } from 'react-router-dom'

function FeedbackPrompt() {
  return (
    <section className="feedback-prompt panel">
      <div>
        <span className="section-kicker">Your Feedback</span>
        <h2 className="panel-title">How Can We Improve This Website?</h2>
        <p className="panel-intro">
          If anything feels confusing or difficult, send us your suggestion. Your feedback helps us make this website easier for students and job seekers.
        </p>
      </div>
      <div className="feedback-prompt-actions">
        <Link to="/contact" className="action-btn">Send Suggestion</Link>
      </div>
    </section>
  )
}

export default FeedbackPrompt
