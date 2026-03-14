import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 'slide-1',
    department: 'Pakistan Civil Aviation Authority',
    code: 'PCAA',
    eyebrow: 'Aviation Recruitment Window',
    title: 'Airport operations, communication units, and technical support openings.',
    blurb: 'Track aviation-focused recruitment with department-level visibility, fast deadline scanning, and direct access to detail pages.',
    accents: ['Air Traffic', 'Operations', 'Technical'],
    cta: '/jobs/government',
    ctaLabel: 'View Government Jobs',
    tone: 'aviation'
  },
  {
    id: 'slide-2',
    department: 'Federal Public Service Commission',
    code: 'FPSC',
    eyebrow: 'Federal Hiring Bulletin',
    title: 'Public administration, education, and specialist vacancies grouped into one readable board.',
    blurb: 'Daily listings stay organized by date, source, and department so users can scan opportunities without jumping across multiple portals.',
    accents: ['Lecturers', 'Inspectors', 'Analysts'],
    cta: '/jobs/date',
    ctaLabel: 'Browse by Date',
    tone: 'federal'
  },
  {
    id: 'slide-3',
    department: 'Pakistan Railways and Public Utilities',
    code: 'PR',
    eyebrow: 'National Service Hiring',
    title: 'Technical, field, and operations posts presented in a practical newspaper-style layout.',
    blurb: 'Use the public job board for daily tracking, then manage postings and contact messages through the admin workspace.',
    accents: ['Workshops', 'Field Teams', 'Support Staff'],
    cta: '/admin',
    ctaLabel: 'Open Admin',
    tone: 'railways'
  }
]

function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = slides[activeIndex]

  return (
    <section className="hero-slider" aria-label="Homepage highlights">
      <div className={`hero-slide hero-slide-${activeSlide.tone}`}>
        <div className="hero-slide-overlay">
          <div className="hero-slide-copy">
            <span className="hero-slide-eyebrow">{activeSlide.eyebrow}</span>
            <h2>{activeSlide.title}</h2>
            <p>{activeSlide.blurb}</p>
            <div className="hero-slide-tags">
              {activeSlide.accents.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="hero-slide-actions">
              <Link to={activeSlide.cta} className="hero-slide-btn">
                {activeSlide.ctaLabel}
              </Link>
            </div>
          </div>

          <div className="hero-slide-poster" aria-hidden="true">
            <div className="hero-slide-seal" />
            <div className="hero-slide-dept">
              <strong>{activeSlide.code}</strong>
              <span>{activeSlide.department}</span>
            </div>
            <div className="hero-slide-lines">
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
