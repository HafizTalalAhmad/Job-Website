import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../context/JobsContext'

function Header({ theme, onToggleTheme }) {
  const { jobs } = useJobs()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const latestDate = [...jobs].sort((a, b) => (a.postDate < b.postDate ? 1 : -1))[0]?.postDate

  const onSearch = (event) => {
    event.preventDefault()
    const q = keyword.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  return (
    <header className="hero">
      <div className="container hero-inner">
        <div>
          <h1>Pakistan Jobs Hub</h1>
          <p className="meta-line">Latest Jobs Update: {latestDate}</p>
        </div>
        <div className="hero-right">
          <div className="hero-tools">
            <form className="hero-search" onSubmit={onSearch}>
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search jobs..."
              />
              <button type="submit">Search</button>
            </form>
            <button
              type="button"
              className="theme-toggle-btn moon-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? 'L' : 'D'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
