import React, { useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { JobsProvider } from './context/JobsContext'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import JobDetailPage from './pages/JobDetailPage'
import ArchivesPage from './pages/ArchivesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import PostJobPage from './pages/PostJobPage'
import NotFoundPage from './pages/NotFoundPage'

function AppContent() {
  const location = useLocation()
  const isJobDetailPage = location.pathname.startsWith('/job/')
  const [theme, setTheme] = useState(() => localStorage.getItem('jobs_theme') || 'light')
  const [showThemePrompt, setShowThemePrompt] = useState(
    () => localStorage.getItem('jobs_theme_prompt_seen') !== '1'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('jobs_theme', theme)
  }, [theme])

  const onToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const onDismissThemePrompt = () => {
    setShowThemePrompt(false)
    localStorage.setItem('jobs_theme_prompt_seen', '1')
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <Navbar />
      {showThemePrompt && (
        <section className="container theme-prompt">
          <p>Tip: Use the moon button next to the Search bar in the header to turn on Dark Mode.</p>
          <div className="theme-prompt-actions">
            <button type="button" className="action-btn secondary" onClick={onDismissThemePrompt}>Got It</button>
          </div>
        </section>
      )}
      {!isJobDetailPage && (
        <>
          <section className="container about-strip">
            <p>
              <strong>About Us:</strong> Pakistan Jobs Hub is a public service style job portal that organizes newspaper and organization
              job ads in a fast, readable format for job seekers across Pakistan.
            </p>
          </section>
          <div className="container ad-top">Google Advertisement Space (Top Banner)</div>
        </>
      )}
      <div className="with-side-ads">
        <div className="route-zone">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/jobs/government"
              element={<ListingPage mode="government" title="Government Jobs" description="Latest government jobs across Pakistan." />}
            />
            <Route
              path="/jobs/date"
              element={<ListingPage mode="date" title="Jobs by Date" description="Browse job posts organized by posting date." />}
            />
            <Route
              path="/jobs/location"
              element={<ListingPage mode="location" title="Jobs by Location" description="Explore jobs city-wise and region-wise." />}
            />
            <Route
              path="/jobs/profession"
              element={<ListingPage mode="profession" title="Jobs by Profession" description="Scan roles grouped by profession/category." />}
            />
            <Route
              path="/jobs/industry"
              element={<ListingPage mode="industry" title="Jobs by Industry" description="Find opportunities sector by sector." />}
            />
            <Route
              path="/jobs/organization"
              element={<ListingPage mode="organization" title="Jobs by Organization" description="Track hiring by department and company." />}
            />
            <Route
              path="/jobs/newspaper"
              element={<ListingPage mode="newspaper" title="Jobs by Newspaper" description="Browse jobs from Jang, Dawn, Express and other newspapers." />}
            />
            <Route path="/job/:id" element={<JobDetailPage />} />
            <Route path="/admin" element={<PostJobPage />} />
            <Route path="/archives" element={<ArchivesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <section className="disclaimer-strip">
            <p>
              The newspaper ads provided by Pakistan Jobs Hub are collected from Pakistan&apos;s leading newspapers like Daily
              Jang, Express, Nawai-i-Waqt, The News, Dawn and The Nation. Our aim is to facilitate job seekers from various
              cities of Pakistan by providing all job advertisements on a single website. This is done as a public service in
              good faith and we are not responsible for any incorrect, misrepresented or misleading advertisement.
            </p>
          </section>
          <Footer />
        </div>
        <aside className="side-ad right">Google Ad Space (Right)</aside>
      </div>
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <JobsProvider>
        <AppContent />
      </JobsProvider>
    </HashRouter>
  )
}

export default App
