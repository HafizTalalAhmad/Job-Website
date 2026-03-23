import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import pakArmyBanner from '../assets/hero-pak-army.svg'
import pafBanner from '../assets/hero-paf.svg'
import sbpBanner from '../assets/hero-sbp.svg'
import ppscBanner from '../assets/hero-ppsc.svg'

const slides = [
  {
    id: 'slide-1',
    department: 'Pakistan Army',
    cta: '/jobs/departments/pakistan-army',
    tone: 'defence',
    image: pakArmyBanner
  },
  {
    id: 'slide-2',
    department: 'Pakistan Air Force',
    cta: '/jobs/departments/pakistan-air-force',
    tone: 'aviation',
    image: pafBanner
  },
  {
    id: 'slide-3',
    department: 'State Bank of Pakistan',
    cta: '/jobs/departments/state-bank-of-pakistan',
    tone: 'federal',
    image: sbpBanner
  },
  {
    id: 'slide-4',
    department: 'Punjab Public Service Commission',
    cta: '/jobs/departments/ppsc',
    tone: 'provincial',
    image: ppscBanner
  }
]

function HeroSlider({ jobs = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const latestNews = useMemo(
    () =>
      [...jobs]
        .sort((a, b) => (a.postDate < b.postDate ? 1 : -1))
        .slice(0, 8),
    [jobs]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = slides[activeIndex]

  return (
    <section className="hero-slider" aria-label="Homepage highlights">
      <Link to={activeSlide.cta} className={`hero-slide hero-slide-${activeSlide.tone}`} aria-label={activeSlide.department}>
        <img src={activeSlide.image} alt={activeSlide.department} className="hero-slide-full-image" />
      </Link>
      {!!latestNews.length && (
        <div className="hero-news-banner" aria-label="Latest news updates">
          <span className="hero-news-label">Latest News</span>
          <div className="hero-news-marquee">
            <div className="hero-news-track">
              {[...latestNews, ...latestNews].map((job, index) => (
                <Link key={`${job.id}-${index}`} to={`/job/${job.id}`} className="hero-news-item">
                  {job.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
