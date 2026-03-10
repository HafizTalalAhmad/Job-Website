const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const LOCAL_JOBS_KEY = 'jobs_hub_local_public_jobs'

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

export { hasSupabaseConfig, fetchPublicJobs, createPublicJob, updatePublicJob, deletePublicJob }
