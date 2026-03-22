const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const departmentDirectory = [
  {
    name: 'WAPDA',
    description: 'Water and power sector opportunities across operations, engineering, and administration.',
    aliases: ['WAPDA']
  },
  {
    name: 'NADRA',
    description: 'Identity, registration, and public service delivery jobs across Pakistan.',
    aliases: ['NADRA']
  },
  {
    name: 'FPSC',
    description: 'Federal Public Service Commission jobs and federal recruitment opportunities.',
    aliases: ['FPSC', 'Federal Public Service Commission']
  },
  {
    name: 'PPSC',
    description: 'Punjab Public Service Commission vacancies and provincial department recruitment.',
    aliases: ['PPSC', 'Punjab Public Service Commission']
  },
  {
    name: 'Punjab Police',
    description: 'Police department jobs for field operations, investigation, and administration.',
    aliases: ['Punjab Police']
  },
  {
    name: 'Pakistan Railways',
    description: 'Rail transport, workshop, technical, and administrative government jobs.',
    aliases: ['Pakistan Railways']
  },
  {
    name: 'Pakistan Army',
    description: 'Military and civilian support roles under Pakistan Army formations and branches.',
    aliases: ['Pakistan Army', 'GHQ', 'ISPR']
  },
  {
    name: 'Pakistan Air Force',
    description: 'Air force recruitment, technical, aviation, and support staff opportunities.',
    aliases: ['Pakistan Air Force', 'PAF']
  },
  {
    name: 'Pakistan Navy',
    description: 'Naval and maritime service careers including technical and support posts.',
    aliases: ['Pakistan Navy']
  },
  {
    name: 'Ministry of Interior',
    description: 'Federal interior ministry and attached department opportunities.',
    aliases: ['Ministry of Interior']
  },
  {
    name: 'Ministry of Defence',
    description: 'Defence ministry and attached organization jobs across Pakistan.',
    aliases: ['Ministry of Defence']
  },
  {
    name: 'Ministry of Railways',
    description: 'Railway policy, operations, and federal transport-related opportunities.',
    aliases: ['Ministry of Railways', 'Pakistan Railways']
  },
  {
    name: 'Ministry of Information Technology',
    description: 'Public-sector IT, digital transformation, and technical vacancies.',
    aliases: ['Ministry of Information Technology', 'Ministry of IT']
  },
  {
    name: 'HEC',
    description: 'Higher education policy, scholarship, and university administration jobs.',
    aliases: ['HEC', 'Higher Education Commission']
  },
  {
    name: 'COMSATS University',
    description: 'Public university teaching, research, and project-based academic jobs.',
    aliases: ['COMSATS University', 'COMSATS']
  },
  {
    name: 'Punjab Education Department',
    description: 'Teaching and education administration jobs across Punjab.',
    aliases: ['Punjab Education Department']
  },
  {
    name: 'Punjab Health Department',
    description: 'Public health and hospital support opportunities in Punjab.',
    aliases: ['Punjab Health Department']
  },
  {
    name: 'NTS',
    description: 'National Testing Service jobs and testing administration opportunities.',
    aliases: ['NTS', 'National Testing Service']
  },
  {
    name: 'Pakistan Engineering Council',
    description: 'Engineering regulation and professional council vacancies.',
    aliases: ['Pakistan Engineering Council', 'PEC']
  },
  {
    name: 'Election Commission of Pakistan',
    description: 'Election administration and public-sector support roles.',
    aliases: ['Election Commission of Pakistan', 'ECP']
  }
].map((department) => ({
  ...department,
  slug: slugify(department.name)
}))

export const findDepartmentBySlug = (slug) =>
  departmentDirectory.find((department) => department.slug === slug)

export const getDepartmentJobs = (jobs, department) => {
  if (!department) return []

  return jobs.filter((job) => {
    if (job.type !== 'government') return false

    const organization = (job.organization || '').toLowerCase()

    return department.aliases.some((alias) => organization.includes(alias.toLowerCase()))
  })
}
