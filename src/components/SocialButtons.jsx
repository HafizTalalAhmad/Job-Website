import React from 'react'
import { socialLinks } from '../data/siteLinks'

const socials = [
  { key: 'facebook', label: 'Facebook', href: socialLinks.facebook, glyph: 'f' },
  { key: 'youtube', label: 'YouTube', href: socialLinks.youtube, glyph: '▶' },
  { key: 'x', label: 'X', href: socialLinks.x, glyph: 'X' },
  { key: 'linkedin', label: 'LinkedIn', href: socialLinks.linkedin, glyph: 'in' }
]

function SocialButtons({ className = '' }) {
  return (
    <div className={className}>
      {socials.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          className={`social-btn social-${social.key}`}
        >
          <span className={`social-glyph social-glyph-${social.key}`} aria-hidden="true">
            {social.glyph}
          </span>
        </a>
      ))}
    </div>
  )
}

export default SocialButtons
