import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import fpscImage from '../../img/FPSC.jfif'
import ghqImage from '../../img/GHQ.jfif'
import isprImage from '../../img/ISPR.jfif'
import ppscImage from '../../img/ppscofficial_cover.jfif'

const slides = [
  {
    id: 'slide-1',
    department: 'Federal Public Service Commission',
    code: 'FPSC',
    eyebrow: 'Federal Recruitment Bulletin',
    title: 'Centralized public service hiring with fast date-wise tracking and direct detail access.',
    blurb: 'Surface federal vacancies in one readable stream so users can review eligibility, deadlines, and source posters without switching between portals.',
    accents: ['CSS Pathways', 'Lecturers', 'Inspectors'],
    cta: '/jobs/government',
    ctaLabel: 'View Government Jobs',
    tone: 'federal',
    image: fpscImage
  },
  {
    id: 'slide-2',
    department: 'General Headquarters',
    code: 'GHQ',
    eyebrow: 'Defence Desk',
    title: 'Operations, support, and specialist roles presented in a cleaner, searchable format.',
    blurb: 'Use the portal to track public-sector openings by department, city, and deadline while keeping the original poster one click away.',
    accents: ['Clerical', 'Technical', 'Admin'],
    cta: '/jobs/date',
    ctaLabel: 'Browse by Date',
    tone: 'defence',
    image: ghqImage
  },
  {
    id: 'slide-3',
    department: 'Inter-Services Public Relations',
    code: 'ISPR',
    eyebrow: 'Public Notice Highlights',
    title: 'Poster-based announcements converted into a practical board for daily scanning and follow-up.',
    blurb: 'Dense listings stay readable through grouped dates, quick links, and structured detail pages built for fast public review.',
    accents: ['Media Wing', 'Field Support', 'Coordination'],
    cta: '/admin',
    ctaLabel: 'Open Admin',
    tone: 'signals',
    image: isprImage
  },
  {
    id: 'slide-4',
    department: 'Punjab Public Service Commission',
    code: 'PPSC',
    eyebrow: 'Provincial Hiring Window',
    title: 'Provincial recruitment posters transformed into modern, mobile-friendly job listings.',
    blurb: 'Highlight teaching, administration, and departmental vacancies with cleaner summaries, date grouping, and direct poster viewing.',
    accents: ['Punjab Jobs', 'Teaching', 'Departments'],
    cta: '/jobs/profession',
    ctaLabel: 'Browse by Profession',
    tone: 'provincial',
    image: ppscImage
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
            <div className="hero-slide-image-frame">
              <img src={activeSlide.image} alt={activeSlide.department} className="hero-slide-image" />
            </div>
            <div className="hero-slide-dept">
              <strong>{activeSlide.code}</strong>
              <span>{activeSlide.department}</span>
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
