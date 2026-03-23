import React, { useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BookmarkPrompt from './components/BookmarkPrompt'
import { JobsProvider } from './context/JobsContext'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import JobDetailPage from './pages/JobDetailPage'
import ArchivesPage from './pages/ArchivesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import PostJobPage from './pages/PostJobPage'
import NotFoundPage from './pages/NotFoundPage'
import DepartmentsPage from './pages/DepartmentsPage'
import DepartmentJobsPage from './pages/DepartmentJobsPage'
import TaxonomyDirectoryPage from './pages/TaxonomyDirectoryPage'
import TaxonomyJobsPage from './pages/TaxonomyJobsPage'
import FeedbackPrompt from './components/FeedbackPrompt'

function AppContent() {
  const [theme, setTheme] = useState(() => localStorage.getItem('jobs_theme') || 'light')
  const [showBookmarkPrompt, setShowBookmarkPrompt] = useState(false)
  const [isPageBookmarked, setIsPageBookmarked] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('jobs_theme', theme)
  }, [theme])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  useEffect(() => {
    const savedPages = JSON.parse(localStorage.getItem('jobs_bookmarked_pages') || '[]')
    setIsPageBookmarked(savedPages.includes(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    if (location.state?.bookmarkPrompt) {
      setShowBookmarkPrompt(false)
      const timer = window.setTimeout(() => {
        setShowBookmarkPrompt(true)
      }, 3000)
      navigate(`${location.pathname}${location.search}`, { replace: true })
      return () => window.clearTimeout(timer)
    }
  }, [location.pathname, location.search, location.state, navigate])

  const onConfirmBookmark = () => {
    const savedPages = JSON.parse(localStorage.getItem('jobs_bookmarked_pages') || '[]')

    if (!savedPages.includes(location.pathname)) {
      localStorage.setItem('jobs_bookmarked_pages', JSON.stringify([...savedPages, location.pathname]))
    }

    setIsPageBookmarked(true)
    setShowBookmarkPrompt(true)
  }

  const onToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <Navbar />
      <div className="page-shell">
        <div className="with-side-ads">
          <div className="route-zone">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/jobs/government"
                element={<ListingPage mode="government" title="Government Jobs" description="Latest government jobs across Pakistan." />}
              />
              <Route
                path="/jobs/private"
                element={<ListingPage mode="private" title="Private Jobs" description="Latest private jobs across Pakistan." />}
              />
              <Route
                path="/jobs/all"
                element={<ListingPage mode="all" title="All Jobs" description="All latest jobs across Pakistan in one place." />}
              />
              <Route path="/jobs/date" element={<TaxonomyDirectoryPage mode="date" />} />
              <Route path="/jobs/date/:value" element={<TaxonomyJobsPage mode="date" />} />
              <Route path="/jobs/location" element={<TaxonomyDirectoryPage mode="location" />} />
              <Route path="/jobs/location/:value" element={<TaxonomyJobsPage mode="location" />} />
              <Route path="/jobs/profession" element={<TaxonomyDirectoryPage mode="profession" />} />
              <Route path="/jobs/profession/:value" element={<TaxonomyJobsPage mode="profession" />} />
              <Route path="/jobs/industry" element={<TaxonomyDirectoryPage mode="industry" />} />
              <Route path="/jobs/industry/:value" element={<TaxonomyJobsPage mode="industry" />} />
              <Route path="/jobs/organization" element={<DepartmentsPage />} />
              <Route path="/jobs/departments/:slug" element={<DepartmentJobsPage />} />
              <Route path="/jobs/newspaper" element={<TaxonomyDirectoryPage mode="newspaper" />} />
              <Route path="/jobs/newspaper/:value" element={<TaxonomyJobsPage mode="newspaper" />} />
              <Route path="/job/:id" element={<JobDetailPage />} />
              <Route path="/admin" element={<PostJobPage />} />
              <Route path="/archives" element={<ArchivesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            {isPageBookmarked && <div className="page-bookmark-badge">Bookmarked</div>}
            <BookmarkPrompt
              open={showBookmarkPrompt}
              onClose={() => setShowBookmarkPrompt(false)}
              onConfirm={onConfirmBookmark}
              isBookmarked={isPageBookmarked}
            />
            {location.pathname !== '/contact' && location.pathname !== '/admin' && <FeedbackPrompt />}
            {location.pathname !== '/admin' && (
              <section className="disclaimer-strip">
                <p>
                  The newspaper ads provided by Pakistan Jobs Hub are collected from Pakistan&apos;s leading newspapers like Daily
                  Jang, Express, Nawai-i-Waqt, The News, Dawn and The Nation. Our aim is to facilitate job seekers from various
                  cities of Pakistan by providing all job advertisements on a single website. This is done as a public service in
                  good faith and we are not responsible for any incorrect, misrepresented or misleading advertisement.
                </p>
              </section>
            )}
            <Footer />
          </div>
        </div>
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
