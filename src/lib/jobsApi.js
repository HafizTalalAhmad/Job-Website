const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const LOCAL_JOBS_KEY = 'jobs_hub_local_public_jobs'
const LOCAL_CONTACTS_KEY = 'jobs_hub_local_contact_messages'
const LOCAL_SUBSCRIBERS_KEY = 'jobs_hub_local_subscribers'

function isPlaceholder(value) {
  if (!value) return true
  const trimmed = String(value).trim()
  const lower = trimmed.toLowerCase()
  return (
    trimmed === '...' ||
    lower.includes('your_') ||
    lower.includes('your-project-id') ||
    trimmed.includes('<') ||
    trimmed.includes('>')
  )
}

const hasSupabaseConfig = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY)
)

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
}

function normalizeRequirements(requirements) {
  if (Array.isArray(requirements)) return requirements.filter(Boolean)
  if (typeof requirements === 'string') {
    return requirements
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords.filter(Boolean)
  if (typeof keywords === 'string') {
    return keywords
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
  return []
}

function composeLocation(city, province, country) {
  return [city, province, country].filter(Boolean).join(', ')
}

function mapRowToJob(row) {
  const positions = normalizeRequirements(row.job_positions || row.requirements)
  return {
    id: String(row.id),
    title: row.title,
    organization: row.organization,
    location: row.location,
    city: row.city,
    province: row.province || '',
    country: row.country || 'In Pakistan',
    category: row.category,
    industry: row.industry,
    type: row.type,
    employmentType: row.employment_type || '',
    source: row.source,
    postDate: row.post_date,
    deadline: row.deadline,
    summary: row.summary,
    description: row.description,
    requirements: positions,
    jobPositions: positions,
    applyProcedure: row.apply_procedure,
    applyLink: row.apply_link,
    keywords: normalizeKeywords(row.keywords),
    posterImage: row.poster_image || '',
    isFeatured: Boolean(row.is_featured)
  }
}

function readLocalJobs() {
  try {
    const raw = localStorage.getItem(LOCAL_JOBS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalJobs(jobs) {
  localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs))
}

function readLocalCollection(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function mapInputToLocalJob(jobInput) {
  const positions = normalizeRequirements(jobInput.jobPositions || jobInput.requirements)
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: jobInput.title,
    organization: jobInput.organization,
    location: jobInput.location || composeLocation(jobInput.city, jobInput.province || '', jobInput.country || 'In Pakistan'),
    city: jobInput.city,
    province: jobInput.province || '',
    country: jobInput.country || 'In Pakistan',
    category: jobInput.category,
    industry: jobInput.industry,
    type: jobInput.type,
    employmentType: jobInput.employmentType || '',
    source: jobInput.source || 'Website',
    postDate: jobInput.postDate,
    deadline: jobInput.deadline,
    summary: jobInput.summary,
    description: jobInput.description,
    requirements: positions,
    jobPositions: positions,
    applyProcedure: jobInput.applyProcedure,
    applyLink: jobInput.applyLink,
    keywords: normalizeKeywords(jobInput.keywords),
    posterImage: jobInput.posterImage || '',
    isFeatured: Boolean(jobInput.isFeatured)
  }
}

async function fetchPublicJobs() {
  if (!hasSupabaseConfig) return readLocalJobs()

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs_public?select=*&order=post_date.desc`,
    { headers: headers() }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`)
  }

  const rows = await response.json()
  return rows.map(mapRowToJob)
}

async function createPublicJob(jobInput) {
  if (!hasSupabaseConfig) {
    const localJob = mapInputToLocalJob(jobInput)
    const existingJobs = readLocalJobs()
    writeLocalJobs([localJob, ...existingJobs])
    return localJob
  }

  const requirements = normalizeRequirements(jobInput.requirements)
  const jobPositions = normalizeRequirements(jobInput.jobPositions || jobInput.requirements)
  const payload = {
    title: jobInput.title,
    organization: jobInput.organization,
    location: jobInput.location || composeLocation(jobInput.city, jobInput.province || '', jobInput.country || 'In Pakistan'),
    city: jobInput.city,
    province: jobInput.province || '',
    country: jobInput.country || 'In Pakistan',
    category: jobInput.category,
    industry: jobInput.industry,
    type: jobInput.type,
    employment_type: jobInput.employmentType || '',
    source: jobInput.source || 'Website',
    post_date: jobInput.postDate,
    deadline: jobInput.deadline,
    summary: jobInput.summary,
    description: jobInput.description,
    requirements,
    job_positions: jobPositions,
    apply_procedure: jobInput.applyProcedure,
    apply_link: jobInput.applyLink,
    keywords: normalizeKeywords(jobInput.keywords),
    poster_image: jobInput.posterImage || '',
    is_featured: Boolean(jobInput.isFeatured)
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs_public`,
    {
      method: 'POST',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to create job: ${response.status}`)
  }

  const rows = await response.json()
  return mapRowToJob(rows[0])
}

async function updatePublicJob(jobId, jobInput) {
  if (!hasSupabaseConfig) {
    const existingJobs = readLocalJobs()
    const updatedJobs = existingJobs.map((job) => {
      if (job.id !== jobId) return job
      const merged = { ...job, ...mapInputToLocalJob({ ...job, ...jobInput }), id: jobId }
      return merged
    })
    writeLocalJobs(updatedJobs)
    return updatedJobs.find((job) => job.id === jobId)
  }

  const requirements = normalizeRequirements(jobInput.requirements)
  const jobPositions = normalizeRequirements(jobInput.jobPositions || jobInput.requirements)
  const payload = {
    title: jobInput.title,
    organization: jobInput.organization,
    location: jobInput.location || composeLocation(jobInput.city, jobInput.province || '', jobInput.country || 'In Pakistan'),
    city: jobInput.city,
    province: jobInput.province || '',
    country: jobInput.country || 'In Pakistan',
    category: jobInput.category,
    industry: jobInput.industry,
    type: jobInput.type,
    employment_type: jobInput.employmentType || '',
    source: jobInput.source || 'Website',
    post_date: jobInput.postDate,
    deadline: jobInput.deadline,
    summary: jobInput.summary,
    description: jobInput.description,
    requirements,
    job_positions: jobPositions,
    apply_procedure: jobInput.applyProcedure,
    apply_link: jobInput.applyLink,
    keywords: normalizeKeywords(jobInput.keywords),
    poster_image: jobInput.posterImage || '',
    is_featured: Boolean(jobInput.isFeatured)
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs_public?id=eq.${encodeURIComponent(jobId)}`,
    {
      method: 'PATCH',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to update job: ${response.status}`)
  }

  const rows = await response.json()
  return mapRowToJob(rows[0])
}

async function deletePublicJob(jobId) {
  if (!hasSupabaseConfig) {
    const existingJobs = readLocalJobs()
    writeLocalJobs(existingJobs.filter((job) => job.id !== jobId))
    return true
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs_public?id=eq.${encodeURIComponent(jobId)}`,
    {
      method: 'DELETE',
      headers: {
        ...headers(),
        Prefer: 'return=minimal'
      }
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to delete job: ${response.status}`)
  }

  return true
}

async function createContactMessage(contactInput) {
  if (!hasSupabaseConfig) {
    const existing = readLocalCollection(LOCAL_CONTACTS_KEY)
    const localRow = mapContactRow({
      id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      full_name: contactInput.fullName,
      email: contactInput.email,
      subject: contactInput.subject,
      message: contactInput.message,
      is_read: false,
      reply_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: null
    })
    writeLocalCollection(LOCAL_CONTACTS_KEY, [localRow, ...existing])
    return localRow
  }

  const payload = {
    full_name: contactInput.fullName,
    email: contactInput.email,
    subject: contactInput.subject,
    message: contactInput.message
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/contact_messages`,
    {
      method: 'POST',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to submit contact message: ${response.status}`)
  }

  const rows = await response.json()
  return rows[0]
}

function mapContactRow(row) {
  return {
    id: String(row.id),
    fullName: row.full_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    isRead: Boolean(row.is_read),
    replyStatus: row.reply_status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function fetchContactMessages() {
  if (!hasSupabaseConfig) {
    return readLocalCollection(LOCAL_CONTACTS_KEY)
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/contact_messages?select=*&order=created_at.desc`,
    { headers: headers() }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to fetch contact messages: ${response.status}`)
  }

  const rows = await response.json()
  return rows.map(mapContactRow)
}

async function updateContactMessage(messageId, patchInput) {
  if (!hasSupabaseConfig) {
    const existing = readLocalCollection(LOCAL_CONTACTS_KEY)
    const updatedRows = existing.map((row) => {
      if (row.id !== messageId) return row
      return {
        ...row,
        isRead: typeof patchInput.isRead === 'boolean' ? patchInput.isRead : row.isRead,
        replyStatus: typeof patchInput.replyStatus === 'string' ? patchInput.replyStatus : row.replyStatus,
        updatedAt: new Date().toISOString()
      }
    })
    writeLocalCollection(LOCAL_CONTACTS_KEY, updatedRows)
    return updatedRows.find((row) => row.id === messageId)
  }

  const payload = {}
  if (typeof patchInput.isRead === 'boolean') payload.is_read = patchInput.isRead
  if (typeof patchInput.replyStatus === 'string') payload.reply_status = patchInput.replyStatus
  payload.updated_at = new Date().toISOString()

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/contact_messages?id=eq.${encodeURIComponent(messageId)}`,
    {
      method: 'PATCH',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to update contact message: ${response.status}`)
  }

  const rows = await response.json()
  return mapContactRow(rows[0])
}

function mapSubscriberRow(row) {
  return {
    id: String(row.id),
    email: row.email,
    isActive: row.is_active !== false,
    source: row.source || 'website',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function fetchSubscribers() {
  if (!hasSupabaseConfig) {
    return readLocalCollection(LOCAL_SUBSCRIBERS_KEY)
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?select=*&order=created_at.desc`,
    { headers: headers() }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to fetch subscribers: ${response.status}`)
  }

  const rows = await response.json()
  return rows.map(mapSubscriberRow)
}

async function createSubscriber(subscriberInput) {
  const normalizedEmail = String(subscriberInput.email || '').trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  if (!hasSupabaseConfig) {
    const existing = readLocalCollection(LOCAL_SUBSCRIBERS_KEY)
    const matched = existing.find((row) => row.email.toLowerCase() === normalizedEmail)
    if (matched) {
      const updated = {
        ...matched,
        isActive: true,
        source: subscriberInput.source || matched.source || 'website',
        updatedAt: new Date().toISOString()
      }
      const rows = existing.map((row) => (row.id === matched.id ? updated : row))
      writeLocalCollection(LOCAL_SUBSCRIBERS_KEY, rows)
      return updated
    }

    const localRow = {
      id: `subscriber-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalizedEmail,
      isActive: true,
      source: subscriberInput.source || 'website',
      createdAt: new Date().toISOString(),
      updatedAt: null
    }
    writeLocalCollection(LOCAL_SUBSCRIBERS_KEY, [localRow, ...existing])
    return localRow
  }

  const existingResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?select=*&email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
    { headers: headers() }
  )

  if (!existingResponse.ok) {
    const message = await existingResponse.text()
    throw new Error(message || `Failed to check subscriber: ${existingResponse.status}`)
  }

  const existingRows = await existingResponse.json()
  if (existingRows.length > 0) {
    return updateSubscriber(existingRows[0].id, {
      isActive: true,
      source: subscriberInput.source || existingRows[0].source || 'website'
    })
  }

  const payload = {
    email: normalizedEmail,
    is_active: true,
    source: subscriberInput.source || 'website'
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers`,
    {
      method: 'POST',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to create subscriber: ${response.status}`)
  }

  const rows = await response.json()
  return mapSubscriberRow(rows[0])
}

async function updateSubscriber(subscriberId, patchInput) {
  if (!hasSupabaseConfig) {
    const existing = readLocalCollection(LOCAL_SUBSCRIBERS_KEY)
    const updatedRows = existing.map((row) => {
      if (row.id !== subscriberId) return row
      return {
        ...row,
        isActive: typeof patchInput.isActive === 'boolean' ? patchInput.isActive : row.isActive,
        source: patchInput.source || row.source,
        updatedAt: new Date().toISOString()
      }
    })
    writeLocalCollection(LOCAL_SUBSCRIBERS_KEY, updatedRows)
    return updatedRows.find((row) => row.id === subscriberId)
  }

  const payload = {
    updated_at: new Date().toISOString()
  }
  if (typeof patchInput.isActive === 'boolean') payload.is_active = patchInput.isActive
  if (typeof patchInput.source === 'string') payload.source = patchInput.source

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?id=eq.${encodeURIComponent(subscriberId)}`,
    {
      method: 'PATCH',
      headers: {
        ...headers(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to update subscriber: ${response.status}`)
  }

  const rows = await response.json()
  return mapSubscriberRow(rows[0])
}

async function deleteSubscriber(subscriberId) {
  if (!hasSupabaseConfig) {
    const existing = readLocalCollection(LOCAL_SUBSCRIBERS_KEY)
    writeLocalCollection(
      LOCAL_SUBSCRIBERS_KEY,
      existing.filter((row) => row.id !== subscriberId)
    )
    return true
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?id=eq.${encodeURIComponent(subscriberId)}`,
    {
      method: 'DELETE',
      headers: {
        ...headers(),
        Prefer: 'return=minimal'
      }
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to delete subscriber: ${response.status}`)
  }

  return true
}

export {
  hasSupabaseConfig,
  fetchPublicJobs,
  createPublicJob,
  updatePublicJob,
  deletePublicJob,
  createContactMessage,
  fetchContactMessages,
  updateContactMessage,
  fetchSubscribers,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber
}
