import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../context/JobsContext'

function Header() {
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
          <form className="hero-search" onSubmit={onSearch}>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search jobs..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </header>
  )
}

export default Header
