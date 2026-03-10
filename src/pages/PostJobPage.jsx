import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'

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
  isFeatured: false
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
  const [passcode, setPasscode] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem('admin_unlocked') === '1')
  const [done, setDone] = useState(false)
  const [lastAction, setLastAction] = useState('create')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cityOptions = useMemo(
    () => [...new Set(cityRecords.map((row) => row.name))].sort((a, b) => a.localeCompare(b)),
    [cityRecords]
  )

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

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
        requirements: form.jobPositions
      }
      const created = isEditMode ? await editJob(editJobId, payload) : await addJob(payload)
      setLastAction(isEditMode ? 'edit' : 'create')
      setDone(true)
      setForm(initialState)
      setEditJobId('')
      setPositionTitle('')
      setPositionCount('')
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
      isFeatured: Boolean(job.isFeatured)
    })
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
  }

  const onUnlock = (event) => {
    event.preventDefault()
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
    sessionStorage.removeItem('admin_unlocked')
  }

  if (!isAuthorized) {
    return (
      <main className="container page-block">
        <Breadcrumbs />
        <section className="panel">
          <h1 className="panel-title">Admin Login</h1>
          <p className="panel-intro">Enter admin passcode to access job posting form.</p>
          <form className="contact-form" onSubmit={onUnlock}>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Admin Passcode"
              required
            />
            <button type="submit" className="load-more-btn">Unlock Admin</button>
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
          <h1 className="panel-title">Admin: Post a Job</h1>
          <button type="button" className="action-btn secondary" onClick={onLock}>Lock Admin</button>
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
              <button type="button" className="action-btn secondary" onClick={() => onChange('posterImage', '')}>Remove Image</button>
            </div>
          )}
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
        {publicJobs.length > 0 && (
          <div className="admin-job-list">
            {publicJobs.map((job) => (
              <article key={job.id} className="admin-job-item">
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.organization} | {job.city}, {job.province || '-'}, {job.country || 'In Pakistan'}</p>
                </div>
                <div className="admin-job-actions">
                  <button type="button" className="action-btn secondary" onClick={() => onEditRow(job)}>Edit</button>
                  <button type="button" className="action-btn" onClick={() => onDeleteRow(job)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default PostJobPage
