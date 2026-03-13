import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 'slide-1',
    eyebrow: 'Public Sector Spotlight',
    title: 'Government hiring windows, newspaper ads, and deadlines in one place.',
    blurb: 'Track major openings across aviation, education, utilities, railways, and public administration without scanning multiple sources.',
    accent: 'Government Jobs',
    cta: '/jobs/government',
    tone: 'aviation'
  },
  {
    id: 'slide-2',
    eyebrow: 'Daily Job Scan',
    title: 'Browse fast, newspaper-style listings that stay readable on mobile.',
    blurb: 'Date-grouped job cards, clear deadlines, location details, and direct detail pages keep the experience practical instead of flashy.',
    accent: 'Browse by Date',
    cta: '/jobs/date',
    tone: 'bulletin'
  },
  {
    id: 'slide-3',
    eyebrow: 'Admin + Alerts',
    title: 'Post jobs, manage contact messages, and maintain a clean public job board.',
    blurb: 'Use the admin area for posting, updating, and reviewing incoming messages while the public site stays lightweight and focused.',
    accent: 'Open Admin',
    cta: '/admin',
    tone: 'control'
  }
]

function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 4800)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = slides[activeIndex]

  return (
    <section className="hero-slider" aria-label="Homepage highlights">
      <div className={`hero-slide hero-slide-${activeSlide.tone}`}>
        <div className="hero-slide-copy">
          <span className="hero-slide-eyebrow">{activeSlide.eyebrow}</span>
          <h2>{activeSlide.title}</h2>
          <p>{activeSlide.blurb}</p>
          <div className="hero-slide-actions">
            <Link to={activeSlide.cta} className="hero-slide-btn">
              {activeSlide.accent}
            </Link>
          </div>
        </div>

        <div className="hero-slide-art" aria-hidden="true">
          <div className="art-frame">
            <div className="art-strip" />
            <div className="art-card art-card-primary" />
            <div className="art-card art-card-secondary" />
            <div className="art-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-slide-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`hero-dot${index === activeIndex ? ' active' : ''}`}
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSlider
