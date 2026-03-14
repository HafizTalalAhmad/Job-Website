import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'
import { deleteContactMessage, deleteSubscriber, fetchContactMessages, fetchSubscribers, triggerJobAlert, updateContactMessage, updateSubscriber } from '../lib/jobsApi'
import { fetchCurrentAdmin, hasSupabaseAuthConfig, loginAdmin, logoutAdmin } from '../lib/supabaseAuth'

const defaultCityRecords = [
  { name: 'Lahore', province: 'Punjab' },
  { name: 'Karachi', province: 'Sindh' },
  { name: 'Islamabad', province: 'Punjab' },
  { name: 'Rawalpindi', province: 'Punjab' },
  { name: 'Peshawar', province: 'KPK' },
  { name: 'Quetta', province: 'Balochistan' },
  { name: 'Multan', province: 'Punjab' },
  { name: 'Faisalabad', province: 'Punjab' }
]

const defaultProvinceOptions = ['Punjab', 'Sindh', 'Balochistan', 'KPK']
const countryOptions = ['In Pakistan']
const employmentTypeOptions = ['Full Time', 'Part Time', 'Contract']

const initialState = {
  title: '',
  organization: '',
  city: '',
  province: '',
  country: '',
  category: '',
  industry: '',
  type: '',
  employmentType: '',
  source: 'Website',
  postDate: '',
  deadline: '',
  summary: '',
  description: '',
  jobPositions: '',
  keywords: '',
  requirements: '',
  applyProcedure: '',
  applyLink: '',
  posterImage: '',
  posterPath: '',
  isArchived: false,
  isFeatured: false
}

function downloadCsv(filename, rows) {
  if (!rows.length) return
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set())
  )

  const escapeCell = (value) => {
    const stringValue = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  const csv = [
    keys.map(escapeCell).join(','),
    ...rows.map((row) => keys.map((key) => escapeCell(row[key])).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function PostJobPage() {
  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE
  const navigate = useNavigate()
  const { publicJobs, addJob, editJob, removeJob, hasSupabaseConfig } = useJobs()
  const [form, setForm] = useState(initialState)
  const [editJobId, setEditJobId] = useState('')
  const [cityRecords, setCityRecords] = useState(defaultCityRecords)
  const [provinceOptions, setProvinceOptions] = useState(defaultProvinceOptions)
  const [newCity, setNewCity] = useState('')
  const [newCityProvince, setNewCityProvince] = useState('')
  const [newProvince, setNewProvince] = useState('')
  const [positionTitle, setPositionTitle] = useState('')
  const [positionCount, setPositionCount] = useState('')
  const [posterFile, setPosterFile] = useState(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [passcode, setPasscode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(!hasSupabaseAuthConfig && sessionStorage.getItem('admin_unlocked') === '1')
  const [isCheckingAuth, setIsCheckingAuth] = useState(hasSupabaseAuthConfig)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [done, setDone] = useState(false)
  const [lastAction, setLastAction] = useState('create')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState([])
  const [messagesError, setMessagesError] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageReadFilter, setMessageReadFilter] = useState('all')
  const [messageReplyFilter, setMessageReplyFilter] = useState('all')
  const [messageSearch, setMessageSearch] = useState('')
  const [subscribers, setSubscribers] = useState([])
  const [subscribersError, setSubscribersError] = useState('')
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false)
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState('all')
  const [subscriberSearch, setSubscriberSearch] = useState('')

  const cityOptions = useMemo(
    () => [...new Set(cityRecords.map((row) => row.name))].sort((a, b) => a.localeCompare(b)),
    [cityRecords]
  )

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const filteredMessages = useMemo(() => {
    const keyword = messageSearch.trim().toLowerCase()

    return messages.filter((item) => {
      const readMatch =
        messageReadFilter === 'all' ||
        (messageReadFilter === 'read' && item.isRead) ||
        (messageReadFilter === 'unread' && !item.isRead)

      const replyMatch =
        messageReplyFilter === 'all' ||
        (item.replyStatus || 'pending') === messageReplyFilter

      const keywordMatch =
        !keyword ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.subject.toLowerCase().includes(keyword) ||
        item.message.toLowerCase().includes(keyword)

      return readMatch && replyMatch && keywordMatch
    })
  }, [messages, messageReadFilter, messageReplyFilter, messageSearch])

  const filteredSubscribers = useMemo(() => {
    const keyword = subscriberSearch.trim().toLowerCase()
    return subscribers.filter((item) => {
      const statusMatch =
        subscriberStatusFilter === 'all' ||
        (subscriberStatusFilter === 'active' && item.isActive) ||
        (subscriberStatusFilter === 'inactive' && !item.isActive)

      const keywordMatch =
        !keyword ||
        item.email.toLowerCase().includes(keyword) ||
        (item.source || '').toLowerCase().includes(keyword)

      return statusMatch && keywordMatch
    })
  }, [subscribers, subscriberSearch, subscriberStatusFilter])

  const liveJobs = useMemo(() => publicJobs.filter((job) => !job.isArchived), [publicJobs])
  const archivedJobs = useMemo(() => publicJobs.filter((job) => job.isArchived), [publicJobs])

  const dashboardStats = useMemo(
    () => ({
      totalLiveJobs: jobsCount(publicJobs),
      totalArchivedJobs: jobsCount(archivedJobs),
      totalMessages: messages.length,
      unreadMessages: messages.filter((item) => !item.isRead).length,
      activeSubscribers: subscribers.filter((item) => item.isActive).length
    }),
    [publicJobs, archivedJobs, messages, subscribers]
  )

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const onCitySelect = (cityName) => {
    const found = cityRecords.find((row) => row.name === cityName)
    setForm((prev) => ({
      ...prev,
      city: cityName,
      province: found?.province || prev.province
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setDone(false)

    if (!form.city) {
      setError('Please select City.')
      return
    }
    if (!form.province) {
      setError('Please select Province.')
      return
    }
    if (!form.country) {
      setError('Please select Country.')
      return
    }
    if (!form.type) {
      setError('Please select Category Type.')
      return
    }
    if (!form.employmentType) {
      setError('Please select Type of Job.')
      return
    }
    if (!isValidUrl(form.applyLink)) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setIsSubmitting(true)
    try {
      const isEditMode = Boolean(editJobId)
      const payload = {
        ...form,
        requirements: form.jobPositions,
        posterFile
      }
      const created = isEditMode ? await editJob(editJobId, payload) : await addJob(payload)
      if (!isEditMode) {
        triggerJobAlert(created).catch(() => {})
      }
      setLastAction(isEditMode ? 'edit' : 'create')
      setDone(true)
      setForm(initialState)
      setEditJobId('')
      setPositionTitle('')
      setPositionCount('')
      setPosterFile(null)
      setTimeout(() => navigate(`/job/${created.id}`), 500)
    } catch (submitError) {
      setError(submitError.message || 'Unable to post job.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPosterUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange('posterImage', reader.result || '')
    }
    reader.readAsDataURL(file)
    setPosterFile(file)
  }

  const onAddCity = () => {
    const cleanCity = newCity.trim()
    if (!cleanCity || !newCityProvince) {
      setError('Add New City and select Province for that city first.')
      return
    }

    const exists = cityRecords.some((row) => row.name.toLowerCase() === cleanCity.toLowerCase())
    if (exists) {
      onCitySelect(cleanCity)
      setNewCity('')
      setNewCityProvince('')
      return
    }

    setCityRecords((prev) => [...prev, { name: cleanCity, province: newCityProvince }])
    setForm((prev) => ({ ...prev, city: cleanCity, province: newCityProvince }))
    setNewCity('')
    setNewCityProvince('')
    setError('')
  }

  const onAddProvince = () => {
    const cleanProvince = newProvince.trim()
    if (!cleanProvince) return
    if (!provinceOptions.includes(cleanProvince)) {
      setProvinceOptions((prev) => [...prev, cleanProvince].sort((a, b) => a.localeCompare(b)))
    }
    setForm((prev) => ({ ...prev, province: cleanProvince }))
    setNewCityProvince(cleanProvince)
    setNewProvince('')
  }

  const onAddPosition = () => {
    const cleanTitle = positionTitle.trim()
    const cleanCount = positionCount.trim()
    if (!cleanTitle) return
    const line = cleanCount ? `${cleanCount} ${cleanTitle}` : cleanTitle
    const next = form.jobPositions ? `${form.jobPositions}\n${line}` : line
    setForm((prev) => ({ ...prev, jobPositions: next }))
    setPositionTitle('')
    setPositionCount('')
  }

  const onEditRow = (job) => {
    const cityName = job.city || ''
    const provinceName = job.province || ''

    if (cityName && provinceName) {
      const mapped = cityRecords.some(
        (row) => row.name.toLowerCase() === cityName.toLowerCase() && row.province === provinceName
      )
      if (!mapped) {
        setCityRecords((prev) => [...prev, { name: cityName, province: provinceName }])
      }
    }

    if (provinceName && !provinceOptions.includes(provinceName)) {
      setProvinceOptions((prev) => [...prev, provinceName].sort((a, b) => a.localeCompare(b)))
    }

    setEditJobId(job.id)
    setForm({
      title: job.title || '',
      organization: job.organization || '',
      city: cityName,
      province: provinceName,
      country: job.country || 'In Pakistan',
      category: job.category || '',
      industry: job.industry || '',
      type: job.type || '',
      employmentType: job.employmentType || '',
      source: job.source || 'Website',
      postDate: job.postDate || '',
      deadline: job.deadline || '',
      summary: job.summary || '',
      description: job.description || '',
      jobPositions: (job.jobPositions || job.requirements || []).join('\n'),
      keywords: (job.keywords || []).join('\n'),
      requirements: '',
      applyProcedure: job.applyProcedure || '',
      applyLink: job.applyLink || '',
      posterImage: job.posterImage || '',
      posterPath: job.posterPath || '',
      isArchived: Boolean(job.isArchived),
      isFeatured: Boolean(job.isFeatured)
    })
    setPosterFile(null)
  }

  const onDeleteRow = async (job) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return
    try {
      await removeJob(job.id)
      if (editJobId === job.id) {
        setEditJobId('')
        setForm(initialState)
      }
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete job.')
    }
  }

  const onCancelEdit = () => {
    setEditJobId('')
    setForm(initialState)
    setPositionTitle('')
    setPositionCount('')
    setPosterFile(null)
  }

  const onToggleArchive = async (job) => {
    try {
      await editJob(job.id, {
        ...job,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || '',
        isArchived: !job.isArchived
      })
    } catch (archiveError) {
      setError(archiveError.message || 'Unable to update archive status.')
    }
  }

  const onUnlock = async (event) => {
    event.preventDefault()
    setError('')

    if (hasSupabaseAuthConfig) {
      try {
        const session = await loginAdmin(adminEmail, adminPassword)
        setCurrentAdmin(session.user || null)
        setIsAuthorized(true)
        setAdminPassword('')
      } catch (loginError) {
        setError(loginError.message || 'Invalid admin credentials.')
      }
      return
    }

    if (!ADMIN_PASSCODE) {
      setError('Set VITE_ADMIN_PASSCODE in your .env file first.')
      return
    }
    if (passcode !== ADMIN_PASSCODE) {
      setError('Invalid admin passcode.')
      return
    }
    setError('')
    setIsAuthorized(true)
    sessionStorage.setItem('admin_unlocked', '1')
  }

  const onLock = () => {
    setIsAuthorized(false)
    setCurrentAdmin(null)
    setAdminPassword('')
    if (hasSupabaseAuthConfig) {
      logoutAdmin()
    } else {
      sessionStorage.removeItem('admin_unlocked')
    }
  }

  function jobsCount(list) {
    return Array.isArray(list) ? list.length : 0
  }

  const loadMessages = async () => {
    setMessagesError('')
    setIsLoadingMessages(true)
    try {
      const rows = await fetchContactMessages()
      setMessages(rows)
    } catch (loadError) {
      setMessagesError(loadError.message || 'Unable to load contact messages.')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadSubscribers = async () => {
    setSubscribersError('')
    setIsLoadingSubscribers(true)
    try {
      const rows = await fetchSubscribers()
      setSubscribers(rows)
    } catch (loadError) {
      setSubscribersError(loadError.message || 'Unable to load subscribers.')
    } finally {
      setIsLoadingSubscribers(false)
    }
  }

  const onToggleRead = async (item) => {
    try {
      const updated = await updateContactMessage(item.id, { isRead: !item.isRead })
      setMessages((prev) => prev.map((row) => (row.id === item.id ? updated : row)))
    } catch (updateError) {
      setMessagesError(updateError.message || 'Unable to update read status.')
    }
  }

  const onReplyStatusChange = async (item, nextStatus) => {
    try {
      const updated = await updateContactMessage(item.id, { replyStatus: nextStatus })
      setMessages((prev) => prev.map((row) => (row.id === item.id ? updated : row)))
    } catch (updateError) {
      setMessagesError(updateError.message || 'Unable to update reply status.')
    }
  }

  const onDeleteMessage = async (item) => {
    if (!window.confirm(`Delete message from "${item.email}"?`)) return
    try {
      await deleteContactMessage(item.id)
      setMessages((prev) => prev.filter((row) => row.id !== item.id))
    } catch (deleteError) {
      setMessagesError(deleteError.message || 'Unable to delete message.')
    }
  }

  const onToggleSubscriber = async (item) => {
    try {
      const updated = await updateSubscriber(item.id, { isActive: !item.isActive })
      setSubscribers((prev) => prev.map((row) => (row.id === item.id ? updated : row)))
    } catch (updateError) {
      setSubscribersError(updateError.message || 'Unable to update subscriber.')
    }
  }

  const onDeleteSubscriber = async (item) => {
    if (!window.confirm(`Delete subscriber "${item.email}"?`)) return
    try {
      await deleteSubscriber(item.id)
      setSubscribers((prev) => prev.filter((row) => row.id !== item.id))
    } catch (deleteError) {
      setSubscribersError(deleteError.message || 'Unable to delete subscriber.')
    }
  }

  useEffect(() => {
    let mounted = true
    if (!hasSupabaseAuthConfig) {
      setIsCheckingAuth(false)
      return undefined
    }

    fetchCurrentAdmin()
      .then((user) => {
        if (!mounted) return
        setCurrentAdmin(user)
        setIsAuthorized(Boolean(user))
      })
      .finally(() => {
        if (!mounted) return
        setIsCheckingAuth(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    loadMessages()
    loadSubscribers()
  }, [isAuthorized])

  if (isCheckingAuth) {
    return (
      <main className="container page-block">
        <Breadcrumbs />
        <section className="panel">
          <h1 className="panel-title">Admin Login</h1>
          <p className="panel-intro">Checking admin session...</p>
        </section>
      </main>
    )
  }

  if (!isAuthorized) {
    return (
      <main className="container page-block">
        <Breadcrumbs />
        <section className="panel">
          <h1 className="panel-title">Admin Login</h1>
          <p className="panel-intro">
            {hasSupabaseAuthConfig
              ? 'Sign in with your Supabase admin account to manage jobs, messages, and subscribers.'
              : 'Enter admin passcode to access job posting form.'}
          </p>
          <form className="contact-form" onSubmit={onUnlock}>
            {hasSupabaseAuthConfig ? (
              <>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Admin Email"
                  required
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin Password"
                  required
                />
                <button type="submit" className="load-more-btn">Sign In</button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Admin Passcode"
                  required
                />
                <button type="submit" className="load-more-btn">Unlock Admin</button>
              </>
            )}
          </form>
          {error && <p className="form-error">{error}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel">
        <div className="panel-head-row">
          <h1 className="panel-title">Admin Dashboard</h1>
          <div className="admin-toolbar">
            {currentAdmin?.email && <span className="panel-intro">Signed in as {currentAdmin.email}</span>}
            <button type="button" className="action-btn secondary" onClick={onLock}>Lock Admin</button>
          </div>
        </div>
        <div className="admin-stats-grid">
          <article className="admin-stat-card">
            <strong>{dashboardStats.totalLiveJobs}</strong>
            <span>Live Jobs</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.totalArchivedJobs}</strong>
            <span>Archived Jobs</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.totalMessages}</strong>
            <span>Total Messages</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.unreadMessages}</strong>
            <span>Unread Messages</span>
          </article>
          <article className="admin-stat-card">
            <strong>{dashboardStats.activeSubscribers}</strong>
            <span>Active Subscribers</span>
          </article>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head-row">
          <h2 className="panel-title">Contact Messages</h2>
          <div className="admin-toolbar">
            <button type="button" className="action-btn secondary" onClick={() => downloadCsv('contact-messages.csv', messages)}>
              Export CSV
            </button>
            <button type="button" className="action-btn secondary" onClick={loadMessages}>
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-message-filters">
          <select value={messageReadFilter} onChange={(e) => setMessageReadFilter(e.target.value)}>
            <option value="all">All Read Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
          <select value={messageReplyFilter} onChange={(e) => setMessageReplyFilter(e.target.value)}>
            <option value="all">All Reply Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
          <input
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
            placeholder="Search by name, email, subject..."
          />
        </div>

        {isLoadingMessages && <p className="panel-intro">Loading messages...</p>}
        {messagesError && <p className="form-error">{messagesError}</p>}
        {!isLoadingMessages && !filteredMessages.length && <p className="panel-intro">No contact messages found.</p>}

        <div className="admin-message-list">
          {filteredMessages.map((item) => (
            <article key={item.id} className="admin-message-item">
              <div className="admin-message-head">
                <h3>{item.subject}</h3>
                <span className={`msg-read-badge ${item.isRead ? 'is-read' : 'is-unread'}`}>
                  {item.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <p className="admin-message-meta">
                {item.fullName} | {item.email} | {new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="admin-message-body">{item.message}</p>
              <div className="admin-message-actions">
                <button type="button" className="action-btn secondary" onClick={() => onToggleRead(item)}>
                  {item.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
                <select
                  value={item.replyStatus || 'pending'}
                  onChange={(e) => onReplyStatusChange(item, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
                <button type="button" className="action-btn" onClick={() => onDeleteMessage(item)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head-row">
          <h2 className="panel-title">Subscribers</h2>
          <div className="admin-toolbar">
            <button type="button" className="action-btn secondary" onClick={() => downloadCsv('subscribers.csv', subscribers)}>
              Export CSV
            </button>
            <button type="button" className="action-btn secondary" onClick={loadSubscribers}>
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-message-filters">
          <select value={subscriberStatusFilter} onChange={(e) => setSubscriberStatusFilter(e.target.value)}>
            <option value="all">All Subscribers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            value={subscriberSearch}
            onChange={(e) => setSubscriberSearch(e.target.value)}
            placeholder="Search by email or source..."
          />
        </div>

        {isLoadingSubscribers && <p className="panel-intro">Loading subscribers...</p>}
        {subscribersError && <p className="form-error">{subscribersError}</p>}
        {!isLoadingSubscribers && !filteredSubscribers.length && <p className="panel-intro">No subscribers found.</p>}

        <div className="admin-message-list">
          {filteredSubscribers.map((item) => (
            <article key={item.id} className="admin-message-item">
              <div className="admin-message-head">
                <h3>{item.email}</h3>
                <span className={`msg-read-badge ${item.isActive ? 'is-read' : 'is-unread'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="admin-message-meta">
                Source: {item.source || 'website'} | Added: {new Date(item.createdAt).toLocaleString()}
              </p>
              <div className="admin-message-actions">
                <button type="button" className="action-btn secondary" onClick={() => onToggleSubscriber(item)}>
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" className="action-btn" onClick={() => onDeleteSubscriber(item)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head-row">
          <h1 className="panel-title">Admin: Post a Job</h1>
          <button type="button" className="action-btn secondary" onClick={() => downloadCsv('jobs.csv', publicJobs)}>Export CSV</button>
        </div>
        <p className="panel-intro">Fill the form to publish a new public job post.</p>
        {!hasSupabaseConfig && (
          <p className="panel-intro">
            Local mode is active. Jobs will be saved in this browser only. Add Supabase env values for shared/public database storage.
          </p>
        )}

        <form className="contact-form" onSubmit={onSubmit}>
          <input value={form.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Job Title" required />
          <input value={form.organization} onChange={(e) => onChange('organization', e.target.value)} placeholder="Organization / Company" required />
          <div className="admin-lov-row">
            <select value={form.city} onChange={(e) => onCitySelect(e.target.value)} required>
              <option value="">Select City</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Add New City" />
            <select value={newCityProvince} onChange={(e) => setNewCityProvince(e.target.value)}>
              <option value="">Select Province for New City</option>
              {provinceOptions.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <button type="button" className="action-btn secondary" onClick={onAddCity}>Add City</button>
          </div>
          <div className="admin-lov-row">
            <select value={form.province} onChange={(e) => onChange('province', e.target.value)} required>
              <option value="">Select Province</option>
              {provinceOptions.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <input value={newProvince} onChange={(e) => setNewProvince(e.target.value)} placeholder="Add New Province" />
            <button type="button" className="action-btn secondary" onClick={onAddProvince}>Add Province</button>
          </div>
          <select value={form.country} onChange={(e) => onChange('country', e.target.value)} required>
            <option value="">Select Country</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <input value={form.category} onChange={(e) => onChange('category', e.target.value)} placeholder="Profession / Category" required />
          <input value={form.industry} onChange={(e) => onChange('industry', e.target.value)} placeholder="Industry" required />
          <select value={form.type} onChange={(e) => onChange('type', e.target.value)} required>
            <option value="">Select Category Type</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
          <select value={form.employmentType} onChange={(e) => onChange('employmentType', e.target.value)} required>
            <option value="">Select Type of Job</option>
            {employmentTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input value={form.source} onChange={(e) => onChange('source', e.target.value)} placeholder="Source (e.g., Jang, Dawn, Website)" required />
          <label>
            Post Date
            <input type="date" value={form.postDate} onChange={(e) => onChange('postDate', e.target.value)} required />
          </label>
          <label>
            Deadline
            <input type="date" value={form.deadline} onChange={(e) => onChange('deadline', e.target.value)} required />
          </label>
          <textarea value={form.summary} onChange={(e) => onChange('summary', e.target.value)} placeholder="Short Summary" rows="2" required />
          <textarea value={form.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Full Job Description" rows="5" required />
          <textarea
            value={form.jobPositions}
            onChange={(e) => onChange('jobPositions', e.target.value)}
            placeholder="Job Positions (one per line)"
            rows="5"
            required
          />
          <div className="admin-position-row">
            <input
              type="number"
              min="1"
              value={positionCount}
              onChange={(e) => setPositionCount(e.target.value)}
              placeholder="No. of Positions"
            />
            <input
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              placeholder="Position Title"
            />
            <button type="button" className="action-btn secondary" onClick={onAddPosition}>Add Position Line</button>
          </div>
          <textarea
            value={form.keywords}
            onChange={(e) => onChange('keywords', e.target.value)}
            placeholder="Keywords (one per line)"
            rows="4"
          />
          <textarea value={form.applyProcedure} onChange={(e) => onChange('applyProcedure', e.target.value)} placeholder="How to Apply" rows="3" required />
          <input type="url" value={form.applyLink} onChange={(e) => onChange('applyLink', e.target.value)} placeholder="Apply Link URL" required />
          <label>
            Job Poster Image
            <input type="file" accept="image/*" onChange={onPosterUpload} />
          </label>
          {form.posterImage && (
            <div className="admin-poster-preview">
              <img src={form.posterImage} alt="Poster preview" />
              <button
                type="button"
                className="action-btn secondary"
                onClick={() => {
                  onChange('posterImage', '')
                  onChange('posterPath', '')
                  setPosterFile(null)
                }}
              >
                Remove Image
              </button>
            </div>
          )}
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isArchived}
              onChange={(e) => onChange('isArchived', e.target.checked)}
            />
            Save as Archive
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => onChange('isFeatured', e.target.checked)}
            />
            Mark as Featured
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="load-more-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editJobId ? 'Update Job' : 'Publish Job'}
            </button>
            {editJobId && (
              <button type="button" className="action-btn secondary" onClick={onCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {done && <p className="form-success">{lastAction === 'edit' ? 'Job updated successfully.' : 'Job posted successfully.'}</p>}
        {error && <p className="form-error">{error}</p>}
      </section>

      <section className="panel">
        <h2 className="panel-title">Manage Posted Jobs</h2>
        {!publicJobs.length && <p className="panel-intro">No admin-posted jobs yet.</p>}

        {!!liveJobs.length && (
          <>
            <div className="panel-head-row">
              <h3 className="panel-title admin-subtitle">Live Jobs</h3>
              <span>{liveJobs.length} live</span>
            </div>
            <div className="admin-job-list">
              {liveJobs.map((job) => (
                <article key={job.id} className="admin-job-item">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.organization} | {job.city}, {job.province || '-'}, {job.country || 'In Pakistan'}</p>
                  </div>
                  <div className="admin-job-actions">
                    <button type="button" className="action-btn secondary" onClick={() => onEditRow(job)}>Edit</button>
                    <button type="button" className="action-btn secondary" onClick={() => onToggleArchive(job)}>
                      Archive
                    </button>
                    <button type="button" className="action-btn" onClick={() => onDeleteRow(job)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {!!archivedJobs.length && (
          <>
            <div className="panel-head-row admin-section-gap">
              <h3 className="panel-title admin-subtitle">Archived Jobs</h3>
              <span>{archivedJobs.length} archived</span>
            </div>
            <div className="admin-job-list">
              {archivedJobs.map((job) => (
                <article key={job.id} className="admin-job-item admin-job-item-archived">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.organization} | {job.city}, {job.province || '-'}, {job.country || 'In Pakistan'}</p>
                  </div>
                  <div className="admin-job-actions">
                    <button type="button" className="action-btn secondary" onClick={() => onEditRow(job)}>Edit</button>
                    <button type="button" className="action-btn secondary" onClick={() => onToggleArchive(job)}>
                      Unarchive
                    </button>
                    <button type="button" className="action-btn" onClick={() => onDeleteRow(job)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default PostJobPage
