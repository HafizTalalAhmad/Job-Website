const dateFmt = new Intl.DateTimeFormat('en-PK', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

export const toDate = (value) => new Date(`${value}T00:00:00`)

export const formatDate = (value) => dateFmt.format(toDate(value))

export const getUniqueOptions = (jobs, key) => {
  return [...new Set(jobs.map((job) => job[key]))].sort((a, b) => a.localeCompare(b))
}

export const applyFilters = (jobs, filters) => {
  return jobs.filter((job) => {
    const keyword = filters.keyword.trim().toLowerCase()
    const keywordMatch =
      !keyword ||
      job.title.toLowerCase().includes(keyword) ||
      job.organization.toLowerCase().includes(keyword) ||
      job.summary.toLowerCase().includes(keyword) ||
      job.category.toLowerCase().includes(keyword) ||
      (job.province || '').toLowerCase().includes(keyword) ||
      (job.country || '').toLowerCase().includes(keyword) ||
      (job.employmentType || '').toLowerCase().includes(keyword) ||
      (job.keywords || []).join(' ').toLowerCase().includes(keyword) ||
      (job.jobPositions || job.requirements || []).join(' ').toLowerCase().includes(keyword)

    const locationMatch = !filters.location || job.city === filters.location
    const categoryMatch = !filters.category || job.category === filters.category
    const industryMatch = !filters.industry || job.industry === filters.industry
    const organizationMatch = !filters.organization || job.organization === filters.organization
    const typeMatch = !filters.type || job.type === filters.type
    const postDateMatch = !filters.postDate || job.postDate === filters.postDate

    return (
      keywordMatch &&
      locationMatch &&
      categoryMatch &&
      industryMatch &&
      organizationMatch &&
      typeMatch &&
      postDateMatch
    )
  })
}

export const sortJobs = (jobs, sortBy) => {
  const copy = [...jobs]

  if (sortBy === 'deadline') {
    return copy.sort((a, b) => toDate(a.deadline) - toDate(b.deadline))
  }

  if (sortBy === 'alphabetical') {
    return copy.sort((a, b) => a.title.localeCompare(b.title))
  }

  return copy.sort((a, b) => toDate(b.postDate) - toDate(a.postDate))
}

export const groupJobs = (jobs, groupBy) => {
  const grouped = {}

  jobs.forEach((job) => {
    const key = job[groupBy]
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(job)
  })

  return Object.entries(grouped).sort((a, b) => {
    if (groupBy === 'postDate') {
      return toDate(b[0]) - toDate(a[0])
    }

    return a[0].localeCompare(b[0])
  })
}

export const groupArchivesByMonth = (jobs) => {
  const groups = {}

  jobs.forEach((job) => {
    const date = toDate(job.postDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(job)
  })

  return Object.entries(groups)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([monthKey, monthJobs]) => ({
      monthKey,
      label: new Intl.DateTimeFormat('en-PK', {
        month: 'long',
        year: 'numeric'
      }).format(toDate(`${monthKey}-01`)),
      jobs: sortJobs(monthJobs, 'latest')
    }))
}
