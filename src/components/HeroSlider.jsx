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
    cta: '/jobs/government',
    tone: 'federal',
    image: fpscImage
  },
  {
    id: 'slide-2',
    department: 'General Headquarters',
    cta: '/jobs/date',
    tone: 'defence',
    image: ghqImage
  },
  {
    id: 'slide-3',
    department: 'Inter-Services Public Relations',
    cta: '/admin',
    tone: 'signals',
    image: isprImage
  },
  {
    id: 'slide-4',
    department: 'Punjab Public Service Commission',
    cta: '/jobs/profession',
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
      <Link to={activeSlide.cta} className={`hero-slide hero-slide-${activeSlide.tone}`} aria-label={activeSlide.department}>
        <img src={activeSlide.image} alt={activeSlide.department} className="hero-slide-full-image" />
      </Link>

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
