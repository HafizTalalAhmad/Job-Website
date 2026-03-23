const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const inferDepartmentScope = (department) => {
  const haystack = `${department.name} ${(department.aliases || []).join(' ')}`.toLowerCase()

  if (
    haystack.includes('army') ||
    haystack.includes('ghq') ||
    haystack.includes('ispr') ||
    haystack.includes('paf') ||
    haystack.includes('air force') ||
    haystack.includes('navy') ||
    haystack.includes('fwo') ||
    haystack.includes('nlc') ||
    haystack.includes('pof') ||
    haystack.includes('hit') ||
    haystack.includes('pac') ||
    haystack.includes('aps') ||
    haystack.includes('defence housing authority')
  ) {
    return 'Defence'
  }

  if (
    haystack.includes('punjab') ||
    haystack.includes('sindh') ||
    haystack.includes('khyber pakhtunkhwa') ||
    haystack.includes('balochistan')
  ) {
    return 'Provincial'
  }

  if (
    haystack.includes('bank') ||
    haystack.includes('wapda') ||
    haystack.includes('railways') ||
    haystack.includes('pso') ||
    haystack.includes('ogdcl') ||
    haystack.includes('sngpl') ||
    haystack.includes('ssgc') ||
    haystack.includes('ntdc') ||
    haystack.includes('tourism development corporation') ||
    haystack.includes('civil aviation') ||
    haystack.includes('airport authority')
  ) {
    return 'Public Sector'
  }

    return 'Federal'
}

const makeDepartmentLogoText = (name) => {
  const parts = name
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'PK'

  if (parts[0].length <= 5 && parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase()
  }

  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

const officialLogo = (href) => href

const departmentSeed = [
  {
    name: 'WAPDA',
    description: 'Water and power sector opportunities across operations, engineering, and administration.',
    aliases: ['WAPDA'],
    logo: officialLogo('https://wapda.gov.pk/favicon.ico')
  },
  {
    name: 'NADRA',
    description: 'Identity, registration, and public service delivery jobs across Pakistan.',
    aliases: ['NADRA'],
    logo: officialLogo('https://www.nadra.gov.pk/favicon.ico')
  },
  {
    name: 'FPSC',
    description: 'Federal Public Service Commission jobs and federal recruitment opportunities.',
    aliases: ['FPSC', 'Federal Public Service Commission'],
    logo: officialLogo('https://www.fpsc.gov.pk/favicon.ico')
  },
  {
    name: 'PPSC',
    description: 'Punjab Public Service Commission vacancies and provincial department recruitment.',
    aliases: ['PPSC', 'Punjab Public Service Commission'],
    logo: officialLogo('https://www.ppsc.gop.pk/favicon.ico')
  },
  {
    name: 'Punjab Police',
    description: 'Police department jobs for field operations, investigation, and administration.',
    aliases: ['Punjab Police'],
    logo: officialLogo('https://www.punjabpolice.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Railways',
    description: 'Rail transport, workshop, technical, and administrative government jobs.',
    aliases: ['Pakistan Railways'],
    logo: officialLogo('https://www.pakrail.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Army',
    description: 'Military and civilian support roles under Pakistan Army formations and branches.',
    aliases: ['Pakistan Army', 'GHQ', 'ISPR'],
    logo: officialLogo('https://www.joinpakarmy.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Air Force',
    description: 'Air force recruitment, technical, aviation, and support staff opportunities.',
    aliases: ['Pakistan Air Force', 'PAF'],
    logo: officialLogo('https://joinpaf.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Navy',
    description: 'Naval and maritime service careers including technical and support posts.',
    aliases: ['Pakistan Navy'],
    logo: officialLogo('https://www.paknavy.gov.pk/favicon.ico')
  },
  {
    name: 'Ministry of Interior',
    description: 'Federal interior ministry and attached department opportunities.',
    aliases: ['Ministry of Interior'],
    logo: officialLogo('https://www.interior.gov.pk/favicon.ico')
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
    aliases: ['HEC', 'Higher Education Commission'],
    logo: officialLogo('https://www.hec.gov.pk/favicon.ico')
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
    aliases: ['NTS', 'National Testing Service'],
    logo: officialLogo('https://www.nts.org.pk/favicon.ico')
  },
  {
    name: 'Pakistan Engineering Council',
    description: 'Engineering regulation and professional council vacancies.',
    aliases: ['Pakistan Engineering Council', 'PEC']
  },
  {
    name: 'Election Commission of Pakistan',
    description: 'Election administration and public-sector support roles.',
    aliases: ['Election Commission of Pakistan', 'ECP'],
    logo: officialLogo('https://www.ecp.gov.pk/favicon.ico')
  },
  {
    name: 'State Bank of Pakistan',
    description: 'Central banking, finance, regulation, compliance, and policy careers.',
    aliases: ['State Bank of Pakistan', 'SBP'],
    logo: officialLogo('https://www.sbp.org.pk/favicon.ico')
  },
  {
    name: 'National Bank of Pakistan',
    description: 'Public-sector banking jobs in operations, branch services, IT, and management.',
    aliases: ['National Bank of Pakistan', 'NBP']
  },
  {
    name: 'Bank of Punjab',
    description: 'Provincial banking roles in finance, retail operations, and digital services.',
    aliases: ['Bank of Punjab', 'BOP']
  },
  {
    name: 'First Women Bank',
    description: 'Public banking opportunities in operations, customer service, and administration.',
    aliases: ['First Women Bank', 'FWBL']
  },
  {
    name: 'Zarai Taraqiati Bank',
    description: 'Agriculture finance and development banking jobs across Pakistan.',
    aliases: ['Zarai Taraqiati Bank', 'ZTBL']
  },
  {
    name: 'Pakistan Army',
    description: 'Military and civilian support roles under Pakistan Army formations and branches.',
    aliases: ['Pakistan Army', 'GHQ', 'ISPR', 'Army']
  },
  {
    name: 'Pakistan Air Force',
    description: 'Air force recruitment, technical, aviation, and support staff opportunities.',
    aliases: ['Pakistan Air Force', 'PAF']
  },
  {
    name: 'Pakistan Navy',
    description: 'Naval and maritime service careers including technical and support posts.',
    aliases: ['Pakistan Navy', 'Navy']
  },
  {
    name: 'Frontier Works Organization',
    description: 'Defence-linked infrastructure and engineering jobs across Pakistan.',
    aliases: ['Frontier Works Organization', 'FWO']
  },
  {
    name: 'National Logistics Cell',
    description: 'Transport, engineering, logistics, and defence-linked support careers.',
    aliases: ['National Logistics Cell', 'NLC']
  },
  {
    name: 'Pakistan Ordnance Factories',
    description: 'Defence production, technical, engineering, and manufacturing roles.',
    aliases: ['Pakistan Ordnance Factories', 'POF']
  },
  {
    name: 'Heavy Industries Taxila',
    description: 'Heavy engineering and defence manufacturing jobs in Taxila.',
    aliases: ['Heavy Industries Taxila', 'HIT']
  },
  {
    name: 'Pakistan Aeronautical Complex',
    description: 'Aviation engineering, maintenance, and production opportunities.',
    aliases: ['Pakistan Aeronautical Complex', 'PAC Kamra', 'PAC']
  },
  {
    name: 'Army Public Schools and Colleges',
    description: 'Teaching, school administration, and support opportunities in APS institutions.',
    aliases: ['Army Public School', 'Army Public Schools', 'APS', 'APSC']
  },
  {
    name: 'Defence Housing Authority',
    description: 'Public-sector real estate, administration, and engineering roles in DHA projects.',
    aliases: ['Defence Housing Authority', 'DHA']
  },
  {
    name: 'Ministry of Finance',
    description: 'Federal finance, budgeting, policy, treasury, and governance roles.',
    aliases: ['Ministry of Finance']
  },
  {
    name: 'Ministry of Foreign Affairs',
    description: 'Diplomatic support, foreign service, protocol, and federal administration roles.',
    aliases: ['Ministry of Foreign Affairs', 'MOFA']
  },
  {
    name: 'Ministry of Planning and Development',
    description: 'Planning, development, economics, project monitoring, and policy jobs.',
    aliases: ['Ministry of Planning and Development', 'Planning Commission']
  },
  {
    name: 'Ministry of Commerce',
    description: 'Trade policy, commerce, administration, and economic support opportunities.',
    aliases: ['Ministry of Commerce']
  },
  {
    name: 'Ministry of Communications',
    description: 'Roads, transport, postal, and communications-related public jobs.',
    aliases: ['Ministry of Communications']
  },
  {
    name: 'Ministry of Energy',
    description: 'Energy planning, power, petroleum, and technical administration roles.',
    aliases: ['Ministry of Energy']
  },
  {
    name: 'Ministry of Water Resources',
    description: 'Water management, irrigation, dams, and engineering opportunities.',
    aliases: ['Ministry of Water Resources']
  },
  {
    name: 'Ministry of Science and Technology',
    description: 'Research, innovation, standards, labs, and science administration jobs.',
    aliases: ['Ministry of Science and Technology', 'MOST']
  },
  {
    name: 'Ministry of National Health Services',
    description: 'Public health, hospitals, regulation, and healthcare administration opportunities.',
    aliases: ['Ministry of National Health Services', 'NHSR&C']
  },
  {
    name: 'Ministry of Education',
    description: 'Federal education, curriculum, administration, and academic support roles.',
    aliases: ['Ministry of Education', 'Federal Education']
  },
  {
    name: 'Ministry of Human Rights',
    description: 'Human rights policy, legal, advocacy, and administration jobs.',
    aliases: ['Ministry of Human Rights']
  },
  {
    name: 'Ministry of Climate Change',
    description: 'Environment, climate, forestry, and conservation policy opportunities.',
    aliases: ['Ministry of Climate Change']
  },
  {
    name: 'Ministry of Maritime Affairs',
    description: 'Ports, shipping, maritime administration, and related public-sector jobs.',
    aliases: ['Ministry of Maritime Affairs']
  },
  {
    name: 'Ministry of Housing and Works',
    description: 'Public works, estates, housing, engineering, and admin roles.',
    aliases: ['Ministry of Housing and Works']
  },
  {
    name: 'Punjab Education Department',
    description: 'Teaching and education administration jobs across Punjab.',
    aliases: ['Punjab Education Department', 'School Education Department Punjab']
  },
  {
    name: 'Punjab Health Department',
    description: 'Public health and hospital support opportunities in Punjab.',
    aliases: ['Punjab Health Department', 'Specialized Healthcare', 'Primary and Secondary Healthcare']
  },
  {
    name: 'Punjab Revenue Department',
    description: 'Revenue, land record, tehsil, and provincial administration jobs.',
    aliases: ['Punjab Revenue Department', 'Board of Revenue Punjab']
  },
  {
    name: 'Punjab Public Service Commission',
    description: 'Provincial department recruitment and competitive examination jobs.',
    aliases: ['Punjab Public Service Commission', 'PPSC']
  },
  {
    name: 'Sindh Public Service Commission',
    description: 'Sindh government recruitment opportunities through competitive examinations.',
    aliases: ['Sindh Public Service Commission', 'SPSC']
  },
  {
    name: 'Khyber Pakhtunkhwa Public Service Commission',
    description: 'KP provincial department jobs and commission-based recruitment.',
    aliases: ['Khyber Pakhtunkhwa Public Service Commission', 'KPPSC']
  },
  {
    name: 'Balochistan Public Service Commission',
    description: 'Balochistan commission-based recruitment and provincial service opportunities.',
    aliases: ['Balochistan Public Service Commission', 'BPSC']
  },
  {
    name: 'Islamabad Police',
    description: 'Federal police jobs in operations, investigation, and public safety.',
    aliases: ['Islamabad Police']
  },
  {
    name: 'National Highway and Motorway Police',
    description: 'Motorway policing and traffic management careers.',
    aliases: ['National Highway and Motorway Police', 'NHMP', 'Motorway Police'],
    logo: officialLogo('https://nhmp.gov.pk/favicon.ico')
  },
  {
    name: 'FIA',
    description: 'Federal Investigation Agency jobs in investigation, cybercrime, and administration.',
    aliases: ['Federal Investigation Agency', 'FIA'],
    logo: officialLogo('https://www.fia.gov.pk/favicon.ico')
  },
  {
    name: 'ASF',
    description: 'Airport Security Force jobs in operations, inspection, and airport security.',
    aliases: ['Airport Security Force', 'ASF'],
    logo: officialLogo('https://www.asf.gov.pk/favicon.ico')
  },
  {
    name: 'ANF',
    description: 'Anti Narcotics Force jobs in enforcement, intelligence, and support services.',
    aliases: ['Anti Narcotics Force', 'ANF'],
    logo: officialLogo('https://www.anf.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Railways',
    description: 'Rail transport, workshop, technical, and administrative government jobs.',
    aliases: ['Pakistan Railways', 'Railways']
  },
  {
    name: 'Pakistan Post',
    description: 'Postal operations, logistics, finance, and public service positions.',
    aliases: ['Pakistan Post']
  },
  {
    name: 'National Highway Authority',
    description: 'Road infrastructure, engineering, and transport project opportunities.',
    aliases: ['National Highway Authority', 'NHA'],
    logo: officialLogo('https://nha.gov.pk/favicon.ico')
  },
  {
    name: 'OGDCL',
    description: 'Oil and gas exploration, engineering, finance, and administration roles.',
    aliases: ['Oil and Gas Development Company', 'OGDCL']
  },
  {
    name: 'PSO',
    description: 'Energy supply, retail operations, technical, and corporate opportunities.',
    aliases: ['Pakistan State Oil', 'PSO']
  },
  {
    name: 'Sui Northern Gas Pipelines',
    description: 'Gas distribution, engineering, technical, and field support jobs.',
    aliases: ['Sui Northern Gas Pipelines', 'SNGPL']
  },
  {
    name: 'Sui Southern Gas Company',
    description: 'Gas utility opportunities in engineering, operations, and administration.',
    aliases: ['Sui Southern Gas Company', 'SSGC']
  },
  {
    name: 'National Transmission and Dispatch Company',
    description: 'Power transmission, grid operations, engineering, and support roles.',
    aliases: ['National Transmission and Dispatch Company', 'NTDC']
  },
  {
    name: 'Pakistan Atomic Energy Commission',
    description: 'Scientific, technical, healthcare, and administrative roles in atomic energy.',
    aliases: ['Pakistan Atomic Energy Commission', 'PAEC'],
    logo: officialLogo('https://www.paec.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Engineering Council',
    description: 'Engineering regulation and professional council vacancies.',
    aliases: ['Pakistan Engineering Council', 'PEC']
  },
  {
    name: 'National Testing Service',
    description: 'Testing administration and education assessment support opportunities.',
    aliases: ['NTS', 'National Testing Service']
  },
  {
    name: 'Higher Education Commission',
    description: 'Higher education policy, scholarship, and university administration jobs.',
    aliases: ['HEC', 'Higher Education Commission']
  },
  {
    name: 'Allama Iqbal Open University',
    description: 'Distance learning, teaching, examinations, and administration opportunities.',
    aliases: ['Allama Iqbal Open University', 'AIOU'],
    logo: officialLogo('https://www.aiou.edu.pk/favicon.ico')
  },
  {
    name: 'Virtual University',
    description: 'Digital education, academic support, administration, and IT roles.',
    aliases: ['Virtual University', 'VU'],
    logo: officialLogo('https://www.vu.edu.pk/favicon.ico')
  },
  {
    name: 'COMSATS University',
    description: 'Public university teaching, research, and project-based academic jobs.',
    aliases: ['COMSATS University', 'COMSATS']
  },
  {
    name: 'NUST',
    description: 'Public university jobs in teaching, research, engineering, and administration.',
    aliases: ['National University of Sciences and Technology', 'NUST'],
    logo: officialLogo('https://nust.edu.pk/favicon.ico')
  },
  {
    name: 'Punjab University',
    description: 'Teaching, research, examinations, and university support roles.',
    aliases: ['University of the Punjab', 'Punjab University', 'PU']
  },
  {
    name: 'University of Karachi',
    description: 'Academic, research, and university administration opportunities.',
    aliases: ['University of Karachi', 'UOK']
  },
  {
    name: 'University of Peshawar',
    description: 'Teaching and university support jobs in Khyber Pakhtunkhwa.',
    aliases: ['University of Peshawar']
  },
  {
    name: 'Bahauddin Zakariya University',
    description: 'Public university jobs in teaching, research, and administration.',
    aliases: ['Bahauddin Zakariya University', 'BZU']
  },
  {
    name: 'Government College University',
    description: 'Public university opportunities in faculty, research, and campus administration.',
    aliases: ['Government College University', 'GCU']
  },
  {
    name: 'LUMHS and Public Medical Universities',
    description: 'Medical education and hospital-linked public university roles.',
    aliases: ['LUMHS', 'Dow University', 'King Edward Medical University', 'KEMU']
  },
  {
    name: 'Pakistan Bait-ul-Mal',
    description: 'Social welfare, outreach, administration, and support opportunities.',
    aliases: ['Pakistan Bait-ul-Mal', 'PBM'],
    logo: officialLogo('https://www.pbm.gov.pk/favicon.ico')
  },
  {
    name: 'BISP',
    description: 'Social protection, field support, payments, and administration jobs.',
    aliases: ['Benazir Income Support Programme', 'BISP'],
    logo: officialLogo('https://www.bisp.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Tourism Development Corporation',
    description: 'Tourism, hospitality, operations, and administration opportunities.',
    aliases: ['Pakistan Tourism Development Corporation', 'PTDC']
  },
  {
    name: 'Pakistan Civil Aviation Authority',
    description: 'Civil aviation, airport operations, technical, and regulatory positions.',
    aliases: ['Pakistan Civil Aviation Authority', 'PCAA', 'CAA'],
    logo: officialLogo('https://pcaa.gov.pk/favicon.ico')
  },
  {
    name: 'Pakistan Airport Authority',
    description: 'Airport management, aviation services, and public aviation support jobs.',
    aliases: ['Pakistan Airport Authority', 'PAA'],
    logo: officialLogo('https://www.paa.gov.pk/favicon.ico')
  },
  {
    name: 'Election Commission of Pakistan',
    description: 'Election administration and public-sector support roles.',
    aliases: ['Election Commission of Pakistan', 'ECP']
  },
  {
    name: 'National Database and Registration Authority',
    description: 'Identity management, citizen registration, and public service operations.',
    aliases: ['National Database and Registration Authority', 'NADRA']
  }
]

export const departmentDirectory = [...new Map(
  departmentSeed.map((department) => [
    department.name,
    {
      ...department,
      slug: slugify(department.name),
      scope: inferDepartmentScope(department),
      logoText: makeDepartmentLogoText(department.name)
    }
  ])
).values()]

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
