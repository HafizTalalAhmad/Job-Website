const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const ADMIN_SESSION_KEY = 'jobs_hub_admin_session'

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

const hasSupabaseAuthConfig = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY)
)

function getStoredAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setStoredAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

function clearStoredAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

function getAdminAccessToken() {
  return getStoredAdminSession()?.access_token || ''
}

async function loginAdmin(email, password) {
  if (!hasSupabaseAuthConfig) {
    throw new Error('Supabase Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Invalid admin credentials.')
  }

  const session = await response.json()
  setStoredAdminSession(session)
  return session
}

async function fetchCurrentAdmin() {
  if (!hasSupabaseAuthConfig) return null
  const accessToken = getAdminAccessToken()
  if (!accessToken) return null

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    clearStoredAdminSession()
    return null
  }

  return response.json()
}

function logoutAdmin() {
  clearStoredAdminSession()
}

export {
  hasSupabaseAuthConfig,
  getStoredAdminSession,
  getAdminAccessToken,
  loginAdmin,
  fetchCurrentAdmin,
  logoutAdmin
}
