import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'
import { deleteContactMessage, deleteSubscriber, fetchContactMessages, fetchSubscribers, triggerJobAlert, updateContactMessage, updateSubscriber } from '../lib/jobsApi'
import { fetchCurrentAdmin, hasSupabaseAuthConfig, loginAdmin, logoutAdmin } from '../lib/supabaseAuth'
import { departmentDirectory } from '../data/departments'

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
const employmentTypeOptions = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote']
const DEPARTMENTS_STORAGE_KEY = 'jobs_hub_custom_departments'
const COMPANIES_STORAGE_KEY = 'jobs_hub_custom_companies'
const CATEGORIES_STORAGE_KEY = 'jobs_hub_custom_categories'
const INDUSTRIES_STORAGE_KEY = 'jobs_hub_custom_industries'
const SOURCES_STORAGE_KEY = 'jobs_hub_custom_sources'
const CITY_RECORDS_STORAGE_KEY = 'jobs_hub_city_records'
const PROVINCES_STORAGE_KEY = 'jobs_hub_province_options'
const defaultDepartmentOptions = [...new Set(departmentDirectory.map((department) => department.name))].sort((a, b) =>
  a.localeCompare(b)
)
const defaultCompanyOptions = [
  '10Pearls',
  'Systems Limited',
  'NETSOL',
  'TRG Pakistan',
  'Jazz',
  'Telenor Pakistan',
  'Zong',
  'Ufone',
  'Engro',
  'HBL',
  'UBL',
  'Meezan Bank',
  'Packages Limited',
  'PTCL',
  'Daraz'
].sort((a, b) => a.localeCompare(b))
const defaultCategoryOptions = [
  'Administration',
  'Banking',
  'Data Entry',
  'Design',
  'Education',
  'Engineering',
  'Finance',
  'Healthcare',
  'Human Resources',
  'IT',
  'Management',
  'Marketing',
  'Operations',
  'Software Development',
  'Teaching'
].sort((a, b) => a.localeCompare(b))
const defaultIndustryOptions = [
  'Aviation',
  'Banking',
  'Defence',
  'Education',
  'Energy',
  'Finance',
  'Government',
  'Healthcare',
  'Information Technology',
  'Logistics',
  'Manufacturing',
  'Public Sector',
  'Telecom',
  'Transport'
].sort((a, b) => a.localeCompare(b))
const defaultSourceOptions = [
  'Dawn',
  'Daily Jang',
  'Express',
  'LinkedIn',
  'Mustakbil',
  'Nawaiwaqt',
  'Rozee',
  'The Nation',
  'The News',
  'Website'
].sort((a, b) => a.localeCompare(b))

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

const importTemplateRows = [
  {
    id: '',
    title: 'Assistant Director Operations',
    organization: 'WAPDA',
    city: 'Lahore',
    province: 'Punjab',
    country: 'In Pakistan',
    category: 'Operations',
    industry: 'Government',
    type: 'government',
    employmentType: 'Full Time',
    source: 'Daily Jang',
    postDate: '2026-03-24',
    deadline: '2026-04-10',
    summary: 'Oversee operational teams and coordinate regional power projects.',
    description: 'Manage teams, reporting, and field operations for power projects.',
    jobPositions: '3 Assistant Director Operations | 2 Operations Officer',
    keywords: 'WAPDA | Operations | Lahore',
    applyProcedure: 'Apply online and attach required documents before the deadline.',
    applyLink: 'https://example.com/apply',
    posterImage: '',
    isArchived: 'false',
    isFeatured: 'true'
  }
]

const importColumnOrder = [
  'id',
  'title',
  'organization',
  'city',
  'province',
  'country',
  'category',
  'industry',
  'type',
  'employmentType',
  'source',
  'postDate',
  'deadline',
  'summary',
  'description',
  'jobPositions',
  'keywords',
  'applyProcedure',
  'applyLink',
  'posterImage',
  'isArchived',
  'isFeatured'
]

function downloadCsv(filename, rows, columnOrder = null) {
  if (!rows.length) return
  const discoveredKeys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set())
  )
  const keys = columnOrder?.length
    ? [...columnOrder, ...discoveredKeys.filter((key) => !columnOrder.includes(key))]
    : discoveredKeys

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

function parseCsvText(text) {
  const rows = []
  let current = ''
  let row = []
  let insideQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  row.push(current)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)

  if (!rows.length) return []

  const headers = rows[0].map((cell) => cell.trim())
  return rows.slice(1).map((cells) =>
    headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || '').trim()
      return acc
    }, {})
  )
}

function splitImportList(value) {
  if (!value) return []
  return value
    .split(/\r?\n|\|/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseImportBoolean(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'y'].includes(normalized)
}

function PostJobPage() {
  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE
  const navigate = useNavigate()
  const { publicJobs, addJob, editJob, removeJob, hasSupabaseConfig } = useJobs()
  const [form, setForm] = useState(initialState)
  const [editJobId, setEditJobId] = useState('')
  const [cityRecords, setCityRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(CITY_RECORDS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const records = Array.isArray(parsed) ? parsed.filter((row) => row?.name && row?.province) : []
      return records.length ? records.sort((a, b) => a.name.localeCompare(b.name)) : defaultCityRecords
    } catch {
      return defaultCityRecords
    }
  })
  const [provinceOptions, setProvinceOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(PROVINCES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const provinces = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return provinces.length ? provinces.sort((a, b) => a.localeCompare(b)) : defaultProvinceOptions
    } catch {
      return defaultProvinceOptions
    }
  })
  const [departmentOptions, setDepartmentOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const custom = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return [...new Set([...defaultDepartmentOptions, ...custom])].sort((a, b) => a.localeCompare(b))
    } catch {
      return defaultDepartmentOptions
    }
  })
  const [newDepartment, setNewDepartment] = useState('')
  const [selectedDepartmentOption, setSelectedDepartmentOption] = useState('')
  const [editedDepartmentName, setEditedDepartmentName] = useState('')
  const [companyOptions, setCompanyOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(COMPANIES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const custom = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return [...new Set([...defaultCompanyOptions, ...custom])].sort((a, b) => a.localeCompare(b))
    } catch {
      return defaultCompanyOptions
    }
  })
  const [newCompany, setNewCompany] = useState('')
  const [selectedCompanyOption, setSelectedCompanyOption] = useState('')
  const [editedCompanyName, setEditedCompanyName] = useState('')
  const [categoryOptions, setCategoryOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const custom = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return [...new Set([...defaultCategoryOptions, ...custom])].sort((a, b) => a.localeCompare(b))
    } catch {
      return defaultCategoryOptions
    }
  })
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategoryOption, setSelectedCategoryOption] = useState('')
  const [editedCategoryName, setEditedCategoryName] = useState('')
  const [industryOptions, setIndustryOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(INDUSTRIES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const custom = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return [...new Set([...defaultIndustryOptions, ...custom])].sort((a, b) => a.localeCompare(b))
    } catch {
      return defaultIndustryOptions
    }
  })
  const [newIndustry, setNewIndustry] = useState('')
  const [selectedIndustryOption, setSelectedIndustryOption] = useState('')
  const [editedIndustryName, setEditedIndustryName] = useState('')
  const [sourceOptions, setSourceOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(SOURCES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      const custom = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      return [...new Set([...defaultSourceOptions, ...custom])].sort((a, b) => a.localeCompare(b))
    } catch {
      return defaultSourceOptions
    }
  })
  const [newSource, setNewSource] = useState('')
  const [selectedSourceOption, setSelectedSourceOption] = useState('')
  const [editedSourceName, setEditedSourceName] = useState('')
  const [managementModal, setManagementModal] = useState('')
  const [managementSearch, setManagementSearch] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newCityProvince, setNewCityProvince] = useState('')
  const [newProvince, setNewProvince] = useState('')
  const [selectedCityOption, setSelectedCityOption] = useState('')
  const [editedCityName, setEditedCityName] = useState('')
  const [editedCityProvince, setEditedCityProvince] = useState('')
  const [selectedProvinceOption, setSelectedProvinceOption] = useState('')
  const [editedProvinceName, setEditedProvinceName] = useState('')
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
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [pendingImportRows, setPendingImportRows] = useState([])
  const [pendingImportFileName, setPendingImportFileName] = useState('')
  const [skippedImportKeys, setSkippedImportKeys] = useState([])
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

  const getUsageCount = (type, value) => {
    if (!value) return 0
    switch (type) {
      case 'department':
        return publicJobs.filter((job) => job.organization === value && job.type === 'government').length
      case 'company':
        return publicJobs.filter((job) => job.organization === value && job.type === 'private').length
      case 'category':
        return publicJobs.filter((job) => job.category === value).length
      case 'industry':
        return publicJobs.filter((job) => job.industry === value).length
      case 'source':
        return publicJobs.filter((job) => job.source === value).length
      case 'city':
        return publicJobs.filter((job) => job.city === value).length
      case 'province':
        return publicJobs.filter((job) => job.province === value).length
      default:
        return 0
    }
  }

  const managementItems = useMemo(() => {
    const keyword = managementSearch.trim().toLowerCase()
    const withMeta = (value, detail, builtIn = false, usageCount = 0) => ({
      value,
      detail,
      builtIn,
      usageCount
    })
    const baseItems = (() => {
      switch (managementModal) {
        case 'department':
          return departmentOptions.map((value) =>
            withMeta(
              value,
              `${getUsageCount('department', value)} jobs`,
              defaultDepartmentOptions.includes(value),
              getUsageCount('department', value)
            )
          )
        case 'company':
          return companyOptions.map((value) =>
            withMeta(
              value,
              `${getUsageCount('company', value)} jobs`,
              defaultCompanyOptions.includes(value),
              getUsageCount('company', value)
            )
          )
        case 'category':
          return categoryOptions.map((value) =>
            withMeta(
              value,
              `${getUsageCount('category', value)} jobs`,
              defaultCategoryOptions.includes(value),
              getUsageCount('category', value)
            )
          )
        case 'industry':
          return industryOptions.map((value) =>
            withMeta(
              value,
              `${getUsageCount('industry', value)} jobs`,
              defaultIndustryOptions.includes(value),
              getUsageCount('industry', value)
            )
          )
        case 'source':
          return sourceOptions.map((value) =>
            withMeta(
              value,
              `${getUsageCount('source', value)} jobs`,
              defaultSourceOptions.includes(value),
              getUsageCount('source', value)
            )
          )
        case 'city':
          return cityRecords.map((row) =>
            withMeta(row.name, `${row.province} | ${getUsageCount('city', row.name)} jobs`, true, getUsageCount('city', row.name))
          )
        case 'province':
          return provinceOptions.map((value) =>
            withMeta(
              value,
              `${cityRecords.filter((row) => row.province === value).length} cities | ${getUsageCount('province', value)} jobs`,
              defaultProvinceOptions.includes(value),
              getUsageCount('province', value)
            )
          )
        default:
          return []
      }
    })()

    if (!keyword) return baseItems
    return baseItems.filter(
      (item) => item.value.toLowerCase().includes(keyword) || item.detail.toLowerCase().includes(keyword)
    )
  }, [
    managementSearch,
    managementModal,
    departmentOptions,
    companyOptions,
    categoryOptions,
    industryOptions,
    sourceOptions,
    cityRecords,
    provinceOptions,
    publicJobs
  ])

  useEffect(() => {
    const customDepartments = departmentOptions.filter((name) => !defaultDepartmentOptions.includes(name))
    localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(customDepartments))
  }, [departmentOptions])

  useEffect(() => {
    const customCompanies = companyOptions.filter((name) => !defaultCompanyOptions.includes(name))
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(customCompanies))
  }, [companyOptions])

  useEffect(() => {
    const customCategories = categoryOptions.filter((name) => !defaultCategoryOptions.includes(name))
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(customCategories))
  }, [categoryOptions])

  useEffect(() => {
    const customIndustries = industryOptions.filter((name) => !defaultIndustryOptions.includes(name))
    localStorage.setItem(INDUSTRIES_STORAGE_KEY, JSON.stringify(customIndustries))
  }, [industryOptions])

  useEffect(() => {
    const customSources = sourceOptions.filter((name) => !defaultSourceOptions.includes(name))
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(customSources))
  }, [sourceOptions])

  useEffect(() => {
    localStorage.setItem(CITY_RECORDS_STORAGE_KEY, JSON.stringify(cityRecords))
  }, [cityRecords])

  useEffect(() => {
    localStorage.setItem(PROVINCES_STORAGE_KEY, JSON.stringify(provinceOptions))
  }, [provinceOptions])

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
  const importPreviewRows = useMemo(
    () =>
      pendingImportRows.map((row, index) => {
        const warnings = []
        const existingJob = row.id ? publicJobs.find((job) => job.id === row.id) : null
        const duplicateTitle = publicJobs.find(
          (job) =>
            job.title.toLowerCase() === row.title.toLowerCase() &&
            job.organization.toLowerCase() === row.organization.toLowerCase() &&
            job.id !== row.id
        )

        if (!existingJob && row.id) warnings.push('ID not found; this row will create a new job')
        if (duplicateTitle) warnings.push('Similar job title already exists')
        if (!provinceOptions.includes(row.province)) warnings.push('Province will be added to lists')
        if (!cityRecords.some((city) => city.name.toLowerCase() === row.city.toLowerCase() && city.province === row.province)) {
          warnings.push('City/province combination will be added')
        }
        if (row.type === 'government' && !departmentOptions.some((item) => item.toLowerCase() === row.organization.toLowerCase())) {
          warnings.push('Department will be added to lists')
        }
        if (row.type === 'private' && !companyOptions.some((item) => item.toLowerCase() === row.organization.toLowerCase())) {
          warnings.push('Company will be added to lists')
        }
        if (!categoryOptions.some((item) => item.toLowerCase() === row.category.toLowerCase())) warnings.push('Category will be added to lists')
        if (!industryOptions.some((item) => item.toLowerCase() === row.industry.toLowerCase())) warnings.push('Industry will be added to lists')
        if (!sourceOptions.some((item) => item.toLowerCase() === row.source.toLowerCase())) warnings.push('Source will be added to lists')

        const key = row.id || `${row.title}-${row.organization}-${index}`
        const isSkipped = skippedImportKeys.includes(key)
        const status = isSkipped ? 'skipped' : warnings.length ? 'review' : 'ready'

        return {
          ...row,
          key,
          mode: existingJob ? 'Update' : 'Create',
          warnings,
          status,
          isSkipped
        }
      }),
    [pendingImportRows, publicJobs, provinceOptions, cityRecords, departmentOptions, companyOptions, categoryOptions, industryOptions, sourceOptions, skippedImportKeys]
  )
  const importRowsToSaveCount = useMemo(
    () => importPreviewRows.filter((row) => !row.isSkipped).length,
    [importPreviewRows]
  )
  const importSkippedCount = useMemo(
    () => importPreviewRows.filter((row) => row.isSkipped).length,
    [importPreviewRows]
  )

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

  const downloadImportTemplate = () => {
    downloadCsv('job-import-template.csv', importTemplateRows, importColumnOrder)
  }

  const exportJobsTemplateCsv = () => {
    const rows = publicJobs.map((job) => ({
      id: job.id || '',
      title: job.title || '',
      organization: job.organization || '',
      city: job.city || '',
      province: job.province || '',
      country: job.country || 'In Pakistan',
      category: job.category || '',
      industry: job.industry || '',
      type: job.type || '',
      employmentType: job.employmentType || '',
      source: job.source || '',
      postDate: job.postDate || '',
      deadline: job.deadline || '',
      summary: job.summary || '',
      description: job.description || '',
      jobPositions: (job.jobPositions || job.requirements || []).join(' | '),
      keywords: (job.keywords || []).join(' | '),
      applyProcedure: job.applyProcedure || '',
      applyLink: job.applyLink || '',
      posterImage: job.posterImage || '',
      isArchived: String(Boolean(job.isArchived)),
      isFeatured: String(Boolean(job.isFeatured))
    }))
    downloadCsv('jobs-template-format.csv', rows, importColumnOrder)
  }

  const normalizeImportedRow = (row, rowIndex) => {
    const normalized = {
      id: row.id || '',
      title: row.title || '',
      organization: row.organization || '',
      city: row.city || '',
      province: row.province || '',
      country: row.country || 'In Pakistan',
      category: row.category || '',
      industry: row.industry || '',
      type: (row.type || '').toLowerCase(),
      employmentType: row.employmentType || '',
      source: row.source || '',
      postDate: row.postDate || '',
      deadline: row.deadline || '',
      summary: row.summary || '',
      description: row.description || '',
      jobPositions: splitImportList(row.jobPositions),
      keywords: splitImportList(row.keywords),
      applyProcedure: row.applyProcedure || '',
      applyLink: row.applyLink || '',
      posterImage: row.posterImage || '',
      posterPath: row.posterPath || '',
      isArchived: parseImportBoolean(row.isArchived),
      isFeatured: parseImportBoolean(row.isFeatured)
    }

    const requiredFields = [
      'title',
      'organization',
      'city',
      'province',
      'category',
      'industry',
      'type',
      'employmentType',
      'source',
      'postDate',
      'deadline',
      'summary',
      'description',
      'applyProcedure',
      'applyLink'
    ]

    const missing = requiredFields.filter((field) => !normalized[field])
    if (missing.length) {
      throw new Error(`Row ${rowIndex}: missing required fields -> ${missing.join(', ')}`)
    }
    if (!['government', 'private'].includes(normalized.type)) {
      throw new Error(`Row ${rowIndex}: type must be government or private`)
    }
    if (!employmentTypeOptions.includes(normalized.employmentType)) {
      throw new Error(`Row ${rowIndex}: invalid employmentType "${normalized.employmentType}"`)
    }
    if (!isValidUrl(normalized.applyLink)) {
      throw new Error(`Row ${rowIndex}: applyLink must be a valid http/https URL`)
    }

    return normalized
  }

  const applyImportedLists = (rows) => {
    const importedDepartments = rows.filter((row) => row.type === 'government').map((row) => row.organization)
    const importedCompanies = rows.filter((row) => row.type === 'private').map((row) => row.organization)
    const importedCategories = rows.map((row) => row.category)
    const importedIndustries = rows.map((row) => row.industry)
    const importedSources = rows.map((row) => row.source)
    const importedProvinces = rows.map((row) => row.province)
    const importedCities = rows.map((row) => ({ name: row.city, province: row.province }))

    setDepartmentOptions((prev) => [...new Set([...prev, ...importedDepartments])].sort((a, b) => a.localeCompare(b)))
    setCompanyOptions((prev) => [...new Set([...prev, ...importedCompanies])].sort((a, b) => a.localeCompare(b)))
    setCategoryOptions((prev) => [...new Set([...prev, ...importedCategories])].sort((a, b) => a.localeCompare(b)))
    setIndustryOptions((prev) => [...new Set([...prev, ...importedIndustries])].sort((a, b) => a.localeCompare(b)))
    setSourceOptions((prev) => [...new Set([...prev, ...importedSources])].sort((a, b) => a.localeCompare(b)))
    setProvinceOptions((prev) => [...new Set([...prev, ...importedProvinces])].sort((a, b) => a.localeCompare(b)))
    setCityRecords((prev) => {
      const map = new Map(prev.map((row) => [`${row.name.toLowerCase()}|${row.province.toLowerCase()}`, row]))
      importedCities.forEach((row) => {
        if (row.name && row.province) {
          map.set(`${row.name.toLowerCase()}|${row.province.toLowerCase()}`, row)
        }
      })
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
    })
  }

  const onImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setDone(false)
    setImportResult(null)
    setPendingImportRows([])
    setPendingImportFileName('')
    setSkippedImportKeys([])
    setIsImporting(true)

    try {
      const text = await file.text()
      const parsedRows = parseCsvText(text)
      if (!parsedRows.length) {
        throw new Error('The selected CSV file is empty.')
      }

      const normalizedRows = parsedRows.map((row, index) => normalizeImportedRow(row, index + 2))
      setPendingImportRows(normalizedRows)
      setPendingImportFileName(file.name)
    } catch (importError) {
      setError(importError.message || 'Unable to import jobs from the selected file.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const onConfirmImport = async () => {
    const rowsToImport = importPreviewRows.filter((row) => !row.isSkipped)
    if (!rowsToImport.length) return

    setIsImporting(true)
    setError('')
    setImportResult(null)

    try {
      applyImportedLists(rowsToImport)

      let created = 0
      let updated = 0

      for (const row of rowsToImport) {
        const payload = {
          ...row,
          requirements: row.jobPositions,
          posterFile: null
        }

        const existingJob = row.id ? publicJobs.find((job) => job.id === row.id) : null
        if (existingJob) {
          await editJob(existingJob.id, payload)
          updated += 1
        } else {
          await addJob(payload)
          created += 1
        }
      }

      setImportResult({
        created,
        updated,
        total: rowsToImport.length,
        fileName: pendingImportFileName
      })
      setPendingImportRows([])
      setPendingImportFileName('')
      setSkippedImportKeys([])
    } catch (importError) {
      setError(importError.message || 'Unable to import jobs from the selected file.')
    } finally {
      setIsImporting(false)
    }
  }

  const onCancelImport = () => {
    setPendingImportRows([])
    setPendingImportFileName('')
    setSkippedImportKeys([])
    setImportResult(null)
    setError('')
  }

  const onToggleSkipImportRow = (rowKey) => {
    setSkippedImportKeys((prev) =>
      prev.includes(rowKey) ? prev.filter((item) => item !== rowKey) : [...prev, rowKey]
    )
  }

  const onSkipAllImportRows = () => {
    setSkippedImportKeys(importPreviewRows.map((row) => row.key))
  }

  const onClearSkippedImportRows = () => {
    setSkippedImportKeys([])
  }

  const downloadImportReviewReport = () => {
    if (!importPreviewRows.length) return

    const rows = importPreviewRows.map((row) => ({
      mode: row.mode,
      status: row.status === 'ready' ? 'Ready' : row.status === 'review' ? 'Review' : 'Skipped',
      title: row.title,
      organization: row.organization,
      type: row.type,
      city: row.city,
      province: row.province,
      category: row.category,
      source: row.source,
      skip: row.isSkipped ? 'Yes' : 'No',
      warnings: row.warnings.join(' | ')
    }))

    downloadCsv('job-import-review-report.csv', rows, [
      'mode',
      'status',
      'title',
      'organization',
      'type',
      'city',
      'province',
      'category',
      'source',
      'skip',
      'warnings'
    ])
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
    const cleanCity = (newCity || trimmedManagementSearch).trim()
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
    setManagementSearch('')
    setError('')
  }

  const onAddProvince = () => {
    const cleanProvince = (newProvince || trimmedManagementSearch).trim()
    if (!cleanProvince) return
    if (!provinceOptions.includes(cleanProvince)) {
      setProvinceOptions((prev) => [...prev, cleanProvince].sort((a, b) => a.localeCompare(b)))
    }
    setForm((prev) => ({ ...prev, province: cleanProvince }))
    setNewCityProvince(cleanProvince)
    setNewProvince('')
    setManagementSearch('')
  }

  const onSelectCityOption = (value) => {
    setSelectedCityOption(value)
    const found = cityRecords.find((row) => row.name === value)
    setEditedCityName(found?.name || '')
    setEditedCityProvince(found?.province || '')
  }

  const onRenameCity = async () => {
    const currentName = selectedCityOption.trim()
    const nextName = editedCityName.trim()
    const nextProvince = editedCityProvince.trim()

    if (!currentName || !nextName || !nextProvince) return

    const duplicate = cityRecords.some(
      (row) => row.name.toLowerCase() === nextName.toLowerCase() && row.name.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A city with this name already exists.')
      return
    }

    if (!provinceOptions.includes(nextProvince)) {
      setError('Please select a valid province for the city.')
      return
    }

    setError('')
    setCityRecords((prev) =>
      prev
        .map((row) => (row.name === currentName ? { name: nextName, province: nextProvince } : row))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    setSelectedCityOption(nextName)
    setEditedCityName(nextName)
    setEditedCityProvince(nextProvince)

    const matchingJobs = publicJobs.filter((job) => job.city === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        city: nextName,
        province: nextProvince,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.city === currentName) {
      setForm((prev) => ({ ...prev, city: nextName, province: nextProvince }))
    }
  }

  const onDeleteCity = () => {
    const currentName = selectedCityOption.trim()
    if (!currentName) return

    const linkedJobs = publicJobs.filter((job) => job.city === currentName)
    if (linkedJobs.length) {
      setError('This city is used in posted jobs, so it can be renamed but not deleted.')
      return
    }

    setCityRecords((prev) => prev.filter((row) => row.name !== currentName))
    setSelectedCityOption('')
    setEditedCityName('')
    setEditedCityProvince('')
    if (form.city === currentName) {
      setForm((prev) => ({ ...prev, city: '', province: '' }))
    }
    setError('')
  }

  const onSelectProvinceOption = (value) => {
    setSelectedProvinceOption(value)
    setEditedProvinceName(value)
  }

  const onRenameProvince = async () => {
    const currentName = selectedProvinceOption.trim()
    const nextName = editedProvinceName.trim()
    if (!currentName || !nextName) return

    const duplicate = provinceOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A province with this name already exists.')
      return
    }

    setError('')
    setProvinceOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedProvinceOption(nextName)
    setEditedProvinceName(nextName)
    setCityRecords((prev) =>
      prev
        .map((row) => (row.province === currentName ? { ...row, province: nextName } : row))
        .sort((a, b) => a.name.localeCompare(b.name))
    )

    const matchingJobs = publicJobs.filter((job) => job.province === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        province: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.province === currentName) {
      setForm((prev) => ({ ...prev, province: nextName }))
    }
    if (newCityProvince === currentName) {
      setNewCityProvince(nextName)
    }
  }

  const onDeleteProvince = () => {
    const currentName = selectedProvinceOption.trim()
    if (!currentName) return

    const linkedJobs = publicJobs.filter((job) => job.province === currentName)
    const linkedCities = cityRecords.filter((row) => row.province === currentName)
    if (linkedJobs.length || linkedCities.length) {
      setError('This province is used in cities or posted jobs, so it can be renamed but not deleted.')
      return
    }

    if (defaultProvinceOptions.includes(currentName)) {
      setError('Built-in provinces can be renamed, but they cannot be deleted.')
      return
    }

    setProvinceOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedProvinceOption('')
    setEditedProvinceName('')
    if (form.province === currentName) {
      setForm((prev) => ({ ...prev, province: '' }))
    }
    setError('')
  }

  const openManagementModal = (type) => {
    setError('')
    setManagementSearch('')
    setManagementModal(type)
  }

  const closeManagementModal = () => {
    setManagementModal('')
    setManagementSearch('')
  }

  const modalTitleMap = {
    department: 'Manage Government Departments',
    company: 'Manage Private Companies',
    category: 'Manage Professions / Categories',
    industry: 'Manage Industries',
    source: 'Manage Sources / Newspapers',
    city: 'Manage Cities',
    province: 'Manage Provinces'
  }

  const modalNoteMap = {
    department: 'Keep department names consistent so Jobs by Departments stays clean and easy to browse.',
    company: 'Use one clear company name per employer so private jobs stay organized.',
    category: 'Profession and category names power category pages and public job browsing.',
    industry: 'Industry labels help users filter jobs in a more meaningful way.',
    source: 'Source and newspaper names should stay short, clear, and consistent.',
    city: 'City names and province mapping help jobs appear in the correct location pages.',
    province: 'Province names affect both jobs and city records, so keep them clean and stable.'
  }

  const selectedManagementValue = (() => {
    switch (managementModal) {
      case 'department':
        return selectedDepartmentOption
      case 'company':
        return selectedCompanyOption
      case 'category':
        return selectedCategoryOption
      case 'industry':
        return selectedIndustryOption
      case 'source':
        return selectedSourceOption
      case 'city':
        return selectedCityOption
      case 'province':
        return selectedProvinceOption
      default:
        return ''
    }
  })()

  const trimmedManagementSearch = managementSearch.trim()
  const exactManagementItem = trimmedManagementSearch
    ? managementItems.find((item) => item.value.toLowerCase() === trimmedManagementSearch.toLowerCase())
    : null
  const selectedManagementItem = managementItems.find((item) => item.value === selectedManagementValue) || null
  const isSelectedDeleteBlocked = (() => {
    if (!selectedManagementItem) return true

    switch (managementModal) {
      case 'department':
        return defaultDepartmentOptions.includes(selectedManagementItem.value) || selectedManagementItem.usageCount > 0
      case 'company':
        return defaultCompanyOptions.includes(selectedManagementItem.value) || selectedManagementItem.usageCount > 0
      case 'category':
        return defaultCategoryOptions.includes(selectedManagementItem.value) || selectedManagementItem.usageCount > 0
      case 'industry':
        return defaultIndustryOptions.includes(selectedManagementItem.value) || selectedManagementItem.usageCount > 0
      case 'source':
        return defaultSourceOptions.includes(selectedManagementItem.value) || selectedManagementItem.usageCount > 0
      case 'city':
        return selectedManagementItem.usageCount > 0
      case 'province':
        return (
          defaultProvinceOptions.includes(selectedManagementItem.value) ||
          selectedManagementItem.usageCount > 0 ||
          cityRecords.some((row) => row.province === selectedManagementItem.value)
        )
      default:
        return true
    }
  })()

  const renderManagementList = (onSelect) => (
    <div className="admin-modal-library-card">
      <div className="admin-modal-library-head">
        <div>
          <h3>Existing Items</h3>
          <p>Select one item to load it into the edit controls.</p>
        </div>
        <span className="admin-modal-count">{managementItems.length} items</span>
      </div>
      <div className="admin-list-preview">
        {managementItems.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`admin-list-chip ${selectedManagementValue === item.value ? 'is-selected' : ''}`}
            onClick={() => onSelect(item.value)}
          >
            <div className="admin-list-chip-top">
              <span>{item.value}</span>
              <div className="admin-list-chip-badges">
                <em className={`admin-chip-badge ${item.builtIn ? 'is-built-in' : 'is-custom'}`}>
                  {item.builtIn ? 'Built-in' : 'Custom'}
                </em>
                <em className={`admin-chip-badge ${item.usageCount ? 'is-used' : 'is-unused'}`}>
                  {item.usageCount ? `Used in ${item.usageCount}` : 'Unused'}
                </em>
              </div>
            </div>
            <small>{item.detail}</small>
          </button>
        ))}
      </div>
    </div>
  )

  const renderSearchStateCard = (label, onAdd, onSelectExisting) => {
    if (!trimmedManagementSearch) {
      return (
        <div className="admin-modal-state-card">
          <strong>Start by searching this list</strong>
          <p>Type a name above to find an existing item. If it does not exist, you can add it from here.</p>
        </div>
      )
    }

    if (exactManagementItem) {
      return (
        <div className="admin-modal-state-card is-match">
          <strong>{exactManagementItem.value} is already in the list</strong>
          <p>Select it to rename it or check whether it can be deleted.</p>
          <div className="admin-modal-state-actions">
            <button type="button" className="action-btn secondary" onClick={() => onSelectExisting(exactManagementItem.value)}>
              Use This {label}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="admin-modal-state-card is-add">
        <strong>"{trimmedManagementSearch}" is not in the list yet</strong>
        <p>Add it now to make it available in the admin form.</p>
        <div className="admin-modal-state-actions">
          <button type="button" className="action-btn secondary" onClick={onAdd}>
            Add {label}
          </button>
        </div>
      </div>
    )
  }

  const onAddDepartment = () => {
    const cleanDepartment = (newDepartment || trimmedManagementSearch).trim()
    if (!cleanDepartment) return

    const existing = departmentOptions.find((item) => item.toLowerCase() === cleanDepartment.toLowerCase())
    const finalDepartment = existing || cleanDepartment

    if (!existing) {
      setDepartmentOptions((prev) => [...prev, cleanDepartment].sort((a, b) => a.localeCompare(b)))
    }

    setForm((prev) => ({ ...prev, organization: finalDepartment }))
    setNewDepartment('')
    setManagementSearch('')
    setError('')
  }

  const onAddCompany = () => {
    const cleanCompany = (newCompany || trimmedManagementSearch).trim()
    if (!cleanCompany) return

    const existing = companyOptions.find((item) => item.toLowerCase() === cleanCompany.toLowerCase())
    const finalCompany = existing || cleanCompany

    if (!existing) {
      setCompanyOptions((prev) => [...prev, cleanCompany].sort((a, b) => a.localeCompare(b)))
    }

    setForm((prev) => ({ ...prev, organization: finalCompany }))
    setNewCompany('')
    setManagementSearch('')
    setError('')
  }

  const onAddCategory = () => {
    const cleanCategory = (newCategory || trimmedManagementSearch).trim()
    if (!cleanCategory) return

    const existing = categoryOptions.find((item) => item.toLowerCase() === cleanCategory.toLowerCase())
    const finalCategory = existing || cleanCategory

    if (!existing) {
      setCategoryOptions((prev) => [...prev, cleanCategory].sort((a, b) => a.localeCompare(b)))
    }

    setForm((prev) => ({ ...prev, category: finalCategory }))
    setNewCategory('')
    setManagementSearch('')
    setError('')
  }

  const onAddIndustry = () => {
    const cleanIndustry = (newIndustry || trimmedManagementSearch).trim()
    if (!cleanIndustry) return

    const existing = industryOptions.find((item) => item.toLowerCase() === cleanIndustry.toLowerCase())
    const finalIndustry = existing || cleanIndustry

    if (!existing) {
      setIndustryOptions((prev) => [...prev, cleanIndustry].sort((a, b) => a.localeCompare(b)))
    }

    setForm((prev) => ({ ...prev, industry: finalIndustry }))
    setNewIndustry('')
    setManagementSearch('')
    setError('')
  }

  const onAddSource = () => {
    const cleanSource = (newSource || trimmedManagementSearch).trim()
    if (!cleanSource) return

    const existing = sourceOptions.find((item) => item.toLowerCase() === cleanSource.toLowerCase())
    const finalSource = existing || cleanSource

    if (!existing) {
      setSourceOptions((prev) => [...prev, cleanSource].sort((a, b) => a.localeCompare(b)))
    }

    setForm((prev) => ({ ...prev, source: finalSource }))
    setNewSource('')
    setManagementSearch('')
    setError('')
  }

  const onSelectDepartmentOption = (value) => {
    setSelectedDepartmentOption(value)
    setEditedDepartmentName(value)
  }

  const onRenameDepartment = async () => {
    const currentName = selectedDepartmentOption.trim()
    const nextName = editedDepartmentName.trim()

    if (!currentName || !nextName) return
    const duplicate = departmentOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A department with this name already exists.')
      return
    }

    setError('')
    setDepartmentOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedDepartmentOption(nextName)
    setEditedDepartmentName(nextName)

    const matchingJobs = publicJobs.filter((job) => job.organization === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        organization: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.organization === currentName) {
      setForm((prev) => ({ ...prev, organization: nextName }))
    }
  }

  const onDeleteDepartmentOption = async () => {
    const currentName = selectedDepartmentOption.trim()
    if (!currentName) return
    const linkedJobs = publicJobs.filter((job) => job.organization === currentName)
    if (linkedJobs.length) {
      setError('This department is used in posted jobs, so it can be renamed but not deleted.')
      return
    }

    if (defaultDepartmentOptions.includes(currentName)) {
      setError('Built-in departments can be renamed, but they cannot be deleted.')
      return
    }

    setDepartmentOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedDepartmentOption('')
    setEditedDepartmentName('')
    if (form.organization === currentName) {
      setForm((prev) => ({ ...prev, organization: '' }))
    }
    setError('')
  }

  const onSelectCompanyOption = (value) => {
    setSelectedCompanyOption(value)
    setEditedCompanyName(value)
  }

  const onRenameCompany = async () => {
    const currentName = selectedCompanyOption.trim()
    const nextName = editedCompanyName.trim()

    if (!currentName || !nextName) return
    const duplicate = companyOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A company with this name already exists.')
      return
    }

    setError('')
    setCompanyOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedCompanyOption(nextName)
    setEditedCompanyName(nextName)

    const matchingJobs = publicJobs.filter((job) => job.organization === currentName && job.type === 'private')
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        organization: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.organization === currentName) {
      setForm((prev) => ({ ...prev, organization: nextName }))
    }
  }

  const onDeleteCompanyOption = () => {
    const currentName = selectedCompanyOption.trim()
    if (!currentName) return
    const linkedJobs = publicJobs.filter((job) => job.organization === currentName && job.type === 'private')
    if (linkedJobs.length) {
      setError('This company is used in posted private jobs, so it can be renamed but not deleted.')
      return
    }

    if (defaultCompanyOptions.includes(currentName)) {
      setError('Built-in companies can be renamed, but they cannot be deleted.')
      return
    }

    setCompanyOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedCompanyOption('')
    setEditedCompanyName('')
    if (form.organization === currentName) {
      setForm((prev) => ({ ...prev, organization: '' }))
    }
    setError('')
  }

  const onSelectCategoryOption = (value) => {
    setSelectedCategoryOption(value)
    setEditedCategoryName(value)
  }

  const onRenameCategory = async () => {
    const currentName = selectedCategoryOption.trim()
    const nextName = editedCategoryName.trim()
    if (!currentName || !nextName) return

    const duplicate = categoryOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A profession/category with this name already exists.')
      return
    }

    setError('')
    setCategoryOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedCategoryOption(nextName)
    setEditedCategoryName(nextName)

    const matchingJobs = publicJobs.filter((job) => job.category === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        category: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.category === currentName) {
      setForm((prev) => ({ ...prev, category: nextName }))
    }
  }

  const onDeleteCategoryOption = () => {
    const currentName = selectedCategoryOption.trim()
    if (!currentName) return
    const linkedJobs = publicJobs.filter((job) => job.category === currentName)
    if (linkedJobs.length) {
      setError('This profession/category is used in posted jobs, so it can be renamed but not deleted.')
      return
    }
    if (defaultCategoryOptions.includes(currentName)) {
      setError('Built-in profession/category names can be renamed, but they cannot be deleted.')
      return
    }
    setCategoryOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedCategoryOption('')
    setEditedCategoryName('')
    if (form.category === currentName) {
      setForm((prev) => ({ ...prev, category: '' }))
    }
    setError('')
  }

  const onSelectIndustryOption = (value) => {
    setSelectedIndustryOption(value)
    setEditedIndustryName(value)
  }

  const onRenameIndustry = async () => {
    const currentName = selectedIndustryOption.trim()
    const nextName = editedIndustryName.trim()
    if (!currentName || !nextName) return

    const duplicate = industryOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('An industry with this name already exists.')
      return
    }

    setError('')
    setIndustryOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedIndustryOption(nextName)
    setEditedIndustryName(nextName)

    const matchingJobs = publicJobs.filter((job) => job.industry === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        industry: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.industry === currentName) {
      setForm((prev) => ({ ...prev, industry: nextName }))
    }
  }

  const onDeleteIndustryOption = () => {
    const currentName = selectedIndustryOption.trim()
    if (!currentName) return
    const linkedJobs = publicJobs.filter((job) => job.industry === currentName)
    if (linkedJobs.length) {
      setError('This industry is used in posted jobs, so it can be renamed but not deleted.')
      return
    }
    if (defaultIndustryOptions.includes(currentName)) {
      setError('Built-in industry names can be renamed, but they cannot be deleted.')
      return
    }
    setIndustryOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedIndustryOption('')
    setEditedIndustryName('')
    if (form.industry === currentName) {
      setForm((prev) => ({ ...prev, industry: '' }))
    }
    setError('')
  }

  const onSelectSourceOption = (value) => {
    setSelectedSourceOption(value)
    setEditedSourceName(value)
  }

  const onRenameSource = async () => {
    const currentName = selectedSourceOption.trim()
    const nextName = editedSourceName.trim()
    if (!currentName || !nextName) return

    const duplicate = sourceOptions.some(
      (item) => item.toLowerCase() === nextName.toLowerCase() && item.toLowerCase() !== currentName.toLowerCase()
    )
    if (duplicate) {
      setError('A source/newspaper with this name already exists.')
      return
    }

    setError('')
    setSourceOptions((prev) => prev.map((item) => (item === currentName ? nextName : item)).sort((a, b) => a.localeCompare(b)))
    setSelectedSourceOption(nextName)
    setEditedSourceName(nextName)

    const matchingJobs = publicJobs.filter((job) => job.source === currentName)
    for (const job of matchingJobs) {
      await editJob(job.id, {
        ...job,
        source: nextName,
        posterImage: job.posterImage || '',
        posterPath: job.posterPath || ''
      })
    }

    if (form.source === currentName) {
      setForm((prev) => ({ ...prev, source: nextName }))
    }
  }

  const onDeleteSourceOption = () => {
    const currentName = selectedSourceOption.trim()
    if (!currentName) return
    const linkedJobs = publicJobs.filter((job) => job.source === currentName)
    if (linkedJobs.length) {
      setError('This source/newspaper is used in posted jobs, so it can be renamed but not deleted.')
      return
    }
    if (defaultSourceOptions.includes(currentName)) {
      setError('Built-in source/newspaper names can be renamed, but they cannot be deleted.')
      return
    }
    setSourceOptions((prev) => prev.filter((item) => item !== currentName))
    setSelectedSourceOption('')
    setEditedSourceName('')
    if (form.source === currentName) {
      setForm((prev) => ({ ...prev, source: '' }))
    }
    setError('')
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

    if (job.organization && !departmentOptions.some((item) => item.toLowerCase() === job.organization.toLowerCase())) {
      setDepartmentOptions((prev) => [...prev, job.organization].sort((a, b) => a.localeCompare(b)))
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
          <button type="button" className="action-btn secondary" onClick={exportJobsTemplateCsv}>Export CSV</button>
        </div>
        <p className="panel-intro">Fill the form to publish a new public job post.</p>
        <p className="admin-form-note">
          To make a job appear properly on all website tabs, please complete the main browse fields carefully:
          Department / Organization, City, Province, Profession / Category, Industry, Source / Newspaper, Post Date,
          Type, and Type of Job. These fields power the pages for Departments, Location, Profession, Industry,
          Newspaper, and Date.
        </p>
        {!hasSupabaseConfig && (
          <p className="panel-intro">
            Local mode is active. Jobs will be saved in this browser only. Add Supabase env values for shared/public database storage.
          </p>
        )}

        <section className="admin-management-block admin-management-card admin-import-card">
          <div className="admin-management-head">
            <div>
              <h2 className="panel-title admin-subtitle">Import Jobs</h2>
              <p className="admin-management-copy">
                Download the CSV template, fill the required columns, then import it here. If an existing job `id`
                is included, that job will be updated. If no `id` is present, a new job will be created.
              </p>
            </div>
          </div>
          <div className="admin-import-actions">
            <button type="button" className="action-btn secondary" onClick={downloadImportTemplate}>
              Download Template
            </button>
            <label className="admin-import-upload">
              <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
              <input type="file" accept=".csv,text/csv" onChange={onImportFile} disabled={isImporting} />
            </label>
          </div>
          <div className="admin-import-note">
            Required columns: `title`, `organization`, `city`, `province`, `category`, `industry`, `type`,
            `employmentType`, `source`, `postDate`, `deadline`, `summary`, `description`, `applyProcedure`, and
            `applyLink`. Optional columns: `id`, `keywords`, `jobPositions`, `posterImage`, `isArchived`, `isFeatured`.
          </div>
          {!!pendingImportRows.length && (
            <div className="admin-import-preview">
              <div className="admin-import-preview-head">
                <div>
                  <h3>Review Import Before Saving</h3>
                  <p>
                    File: <strong>{pendingImportFileName}</strong> | Rows: <strong>{importPreviewRows.length}</strong> | Importing:{' '}
                    <strong>{importRowsToSaveCount}</strong> | Skipped: <strong>{importSkippedCount}</strong>
                  </p>
                </div>
                <div className="admin-import-preview-actions">
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={onSkipAllImportRows}
                    disabled={isImporting || !importPreviewRows.length || importSkippedCount === importPreviewRows.length}
                  >
                    Skip All
                  </button>
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={onClearSkippedImportRows}
                    disabled={isImporting || !importSkippedCount}
                  >
                    Clear Skipped
                  </button>
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={downloadImportReviewReport}
                    disabled={!importPreviewRows.length}
                  >
                    Download Review Report
                  </button>
                  <button type="button" className="action-btn secondary" onClick={onCancelImport} disabled={isImporting}>
                    Cancel
                  </button>
                  <button type="button" className="load-more-btn" onClick={onConfirmImport} disabled={isImporting || !importRowsToSaveCount}>
                    {isImporting ? 'Importing...' : 'Import Now'}
                  </button>
                </div>
              </div>
              <div className="admin-import-preview-table-wrap">
                <table className="admin-import-preview-table">
                  <thead>
                    <tr>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Title</th>
                      <th>Organization</th>
                      <th>Type</th>
                      <th>City</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Warnings</th>
                      <th>Skip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreviewRows.map((row, index) => {
                      return (
                        <tr key={row.key} className={row.isSkipped ? 'is-skipped' : ''}>
                          <td>{row.mode}</td>
                          <td>
                            <span className={`admin-import-status is-${row.status}`}>
                              {row.status === 'ready' ? 'Ready' : row.status === 'review' ? 'Review' : 'Skipped'}
                            </span>
                          </td>
                          <td>{row.title}</td>
                          <td>{row.organization}</td>
                          <td>{row.type}</td>
                          <td>{row.city}</td>
                          <td>{row.category}</td>
                          <td>{row.source}</td>
                          <td>
                            {row.warnings.length ? (
                              <ul className="admin-import-warnings">
                                {row.warnings.map((warning) => (
                                  <li key={warning}>{warning}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="admin-import-clear">Ready</span>
                            )}
                          </td>
                          <td>
                            <label className="admin-import-skip">
                              <input
                                type="checkbox"
                                checked={row.isSkipped}
                                onChange={() => onToggleSkipImportRow(row.key)}
                              />
                              <span>Skip</span>
                            </label>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {importResult && (
            <div className="admin-import-result">
              Imported <strong>{importResult.total}</strong> rows from <strong>{importResult.fileName}</strong>:
              created <strong>{importResult.created}</strong>, updated <strong>{importResult.updated}</strong>.
            </div>
          )}
        </section>

        <section className="admin-management-block admin-management-card">
          <div className="admin-management-head">
            <div>
              <h2 className="panel-title admin-subtitle">Manage Lists</h2>
              <p className="admin-management-copy">
                Keep departments, companies, categories, industries, sources, cities, and provinces organized in one place.
                If a list item is already used in posted jobs, it can be renamed but not deleted.
              </p>
            </div>
          </div>
          <div className="admin-management-actions">
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('department')}>
              Departments
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('company')}>
              Companies
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('category')}>
              Categories
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('industry')}>
              Industries
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('source')}>
              Sources
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('city')}>
              Cities
            </button>
            <button type="button" className="action-btn secondary" onClick={() => openManagementModal('province')}>
              Provinces
            </button>
          </div>
        </section>

        <form className="contact-form" onSubmit={onSubmit}>
          <input value={form.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Job Title" required />
          <select value={form.type} onChange={(e) => onChange('type', e.target.value)} required>
            <option value="">Select Category Type</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
          {form.type === 'government' ? (
            <>
              <div className="admin-lov-row admin-department-row">
                <select value={form.organization} onChange={(e) => onChange('organization', e.target.value)} required>
                  <option value="">Select Government Department</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </>
          ) : form.type === 'private' ? (
            <>
              <div className="admin-lov-row admin-department-row">
                <select value={form.organization} onChange={(e) => onChange('organization', e.target.value)} required>
                  <option value="">Select Private Company</option>
                  {companyOptions.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <input
              value={form.organization}
              onChange={(e) => onChange('organization', e.target.value)}
              placeholder="Organization / Company"
              required
            />
          )}
          <div className="admin-lov-row">
            <select value={form.city} onChange={(e) => onCitySelect(e.target.value)} required>
              <option value="">Select City</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="admin-lov-row">
            <select value={form.province} onChange={(e) => onChange('province', e.target.value)} required>
              <option value="">Select Province</option>
              {provinceOptions.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          <select value={form.country} onChange={(e) => onChange('country', e.target.value)} required>
            <option value="">Select Country</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <div className="admin-lov-row admin-department-row">
            <select value={form.category} onChange={(e) => onChange('category', e.target.value)} required>
              <option value="">Select Profession / Category</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="admin-lov-row admin-department-row">
            <select value={form.industry} onChange={(e) => onChange('industry', e.target.value)} required>
              <option value="">Select Industry</option>
              {industryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <select value={form.employmentType} onChange={(e) => onChange('employmentType', e.target.value)} required>
            <option value="">Select Type of Job</option>
            {employmentTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="admin-lov-row admin-department-row">
            <select value={form.source} onChange={(e) => onChange('source', e.target.value)} required>
              <option value="">Select Source / Newspaper</option>
              {sourceOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
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
            value={form.jobPositions}
            onChange={(e) => onChange('jobPositions', e.target.value)}
            placeholder="Job Positions (one per line)"
            rows="5"
            required
          />
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
      {managementModal && (
        <div className="bookmark-toast-shell admin-popup-shell">
          <div className="bookmark-modal admin-management-modal">
            <div className="admin-modal-kicker">Admin List Manager</div>
            <div className="admin-modal-header">
              <div className="admin-modal-copy">
                <h2>{modalTitleMap[managementModal]}</h2>
                <p>{modalNoteMap[managementModal]}</p>
              </div>
              <button type="button" className="action-btn secondary admin-modal-close" onClick={closeManagementModal}>
                Close
              </button>
            </div>
            <div className="admin-modal-search-row">
              <input
                value={managementSearch}
                onChange={(e) => setManagementSearch(e.target.value)}
                placeholder="Search this list..."
              />
            </div>

            {managementModal === 'department' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Department Actions</h3>
                    <p>Search first. If the department exists, select it from the list below to rename it or review delete availability.</p>
                  </div>
                  {renderSearchStateCard('Department', onAddDepartment, onSelectDepartmentOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Department</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This department can be renamed, but it cannot be deleted while it is built-in or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedDepartmentName}
                          onChange={(e) => setEditedDepartmentName(e.target.value)}
                          placeholder="Rename Selected Department"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameDepartment}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteDepartmentOption} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectDepartmentOption)}
              </div>
            )}

            {managementModal === 'company' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Company Actions</h3>
                    <p>Search for a company first. If it already exists, select it from the list to rename it or delete it when unused.</p>
                  </div>
                  {renderSearchStateCard('Company', onAddCompany, onSelectCompanyOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Company</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This company can be renamed, but it cannot be deleted while it is built-in or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedCompanyName}
                          onChange={(e) => setEditedCompanyName(e.target.value)}
                          placeholder="Rename Selected Company"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameCompany}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteCompanyOption} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectCompanyOption)}
              </div>
            )}

            {managementModal === 'category' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Category Actions</h3>
                    <p>Search for a profession/category. Add it if missing, or select it from the list to edit it.</p>
                  </div>
                  {renderSearchStateCard('Category', onAddCategory, onSelectCategoryOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Category</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This category can be renamed, but it cannot be deleted while it is built-in or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedCategoryName}
                          onChange={(e) => setEditedCategoryName(e.target.value)}
                          placeholder="Rename Selected Category"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameCategory}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteCategoryOption} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectCategoryOption)}
              </div>
            )}

            {managementModal === 'industry' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Industry Actions</h3>
                    <p>Keep industry names clean and reusable. Select an existing item below if you want to rename or remove it.</p>
                  </div>
                  {renderSearchStateCard('Industry', onAddIndustry, onSelectIndustryOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Industry</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This industry can be renamed, but it cannot be deleted while it is built-in or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedIndustryName}
                          onChange={(e) => setEditedIndustryName(e.target.value)}
                          placeholder="Rename Selected Industry"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameIndustry}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteIndustryOption} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectIndustryOption)}
              </div>
            )}

            {managementModal === 'source' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Source Actions</h3>
                    <p>Search the newspaper/source list first. Add only when the name is genuinely missing.</p>
                  </div>
                  {renderSearchStateCard('Source', onAddSource, onSelectSourceOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Source</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This source can be renamed, but it cannot be deleted while it is built-in or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedSourceName}
                          onChange={(e) => setEditedSourceName(e.target.value)}
                          placeholder="Rename Selected Source"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameSource}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteSourceOption} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectSourceOption)}
              </div>
            )}

            {managementModal === 'city' && (
              <div className="admin-modal-layout admin-modal-layout-wide">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>City Actions</h3>
                    <p>Search for a city first. If it is missing, add it with its province. If it exists, select it from the list to edit it.</p>
                  </div>
                  {!exactManagementItem && trimmedManagementSearch ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Add New City</strong>
                        <span>{trimmedManagementSearch}</span>
                      </div>
                      <div className="admin-lov-row admin-modal-city-row">
                        <select value={newCityProvince} onChange={(e) => setNewCityProvince(e.target.value)}>
                          <option value="">Select Province for New City</option>
                          {provinceOptions.map((province) => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        <button type="button" className="action-btn secondary" onClick={onAddCity}>Add City</button>
                      </div>
                    </div>
                  ) : null}
                  {exactManagementItem && !selectedManagementItem ? renderSearchStateCard('City', onAddCity, onSelectCityOption) : null}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected City</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This city can be renamed, but it cannot be deleted while it is being used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-modal-city-row">
                        <input
                          value={editedCityName}
                          onChange={(e) => setEditedCityName(e.target.value)}
                          placeholder="Rename Selected City"
                        />
                        <select value={editedCityProvince} onChange={(e) => setEditedCityProvince(e.target.value)}>
                          <option value="">Select Province for City</option>
                          {provinceOptions.map((province) => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameCity}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteCity} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectCityOption)}
              </div>
            )}

            {managementModal === 'province' && (
              <div className="admin-modal-layout">
                <div className="admin-modal-editor-card">
                  <div className="admin-modal-card-head">
                    <h3>Province Actions</h3>
                    <p>Search for a province first. If it already exists, select it below to rename it or review delete availability.</p>
                  </div>
                  {renderSearchStateCard('Province', onAddProvince, onSelectProvinceOption)}
                  {selectedManagementItem ? (
                    <div className="admin-modal-selected-edit">
                      <div className="admin-modal-selected-head">
                        <strong>Selected Province</strong>
                        <span>{selectedManagementItem.value}</span>
                      </div>
                      {isSelectedDeleteBlocked ? (
                        <p className="admin-modal-selection-note">This province can be renamed, but it cannot be deleted while it is built-in, linked to cities, or used in jobs.</p>
                      ) : null}
                      <div className="admin-lov-row admin-department-row">
                        <input
                          value={editedProvinceName}
                          onChange={(e) => setEditedProvinceName(e.target.value)}
                          placeholder="Rename Selected Province"
                        />
                        <div className="admin-inline-actions">
                          <button type="button" className="action-btn secondary" onClick={onRenameProvince}>
                            Rename
                          </button>
                          <button type="button" className="action-btn" onClick={onDeleteProvince} disabled={isSelectedDeleteBlocked}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {renderManagementList(onSelectProvinceOption)}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}
    </main>
  )
}

export default PostJobPage
