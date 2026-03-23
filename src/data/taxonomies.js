import { formatDate, toDate } from '../utils/jobs'

const encodeValue = (value) => encodeURIComponent(value)

export const taxonomyConfig = {
  date: {
    mode: 'date',
    title: 'Jobs by Date',
    directoryTitle: 'Posting Dates Directory',
    heroKicker: 'Date Search',
    heroDescription: 'Choose a posting date first, then open the jobs published on that date.',
    helperTitle: 'How to Use Dates',
    helperSteps: [
      {
        title: 'Choose a Date',
        text: 'Pick the date you want to check from the list below.'
      },
      {
        title: 'Open Jobs',
        text: 'Click the date to see all jobs posted on that day.'
      },
      {
        title: 'Read Details',
        text: 'Click any blue headline to open the complete job detail page.'
      }
    ],
    searchPlaceholder: 'Search a posting date...',
    itemTitle: (item) => item.label,
    itemDescription: (item) => `${item.count} job${item.count === 1 ? '' : 's'} were posted on this date.`,
    jobsTitle: (item) => `Jobs Posted on ${item.label}`,
    jobsDescription: (item) => `These are the jobs that were published on ${item.label}.`,
    itemCountLabel: 'jobs',
    deriveItems: (jobs) => {
      const grouped = new Map()

      jobs.forEach((job) => {
        const key = job.postDate
        const current = grouped.get(key) || { value: key, label: formatDate(key), count: 0 }
        current.count += 1
        grouped.set(key, current)
      })

      return [...grouped.values()].sort((a, b) => toDate(b.value) - toDate(a.value))
    },
    matchJob: (job, value) => job.postDate === value
  },
  location: {
    mode: 'location',
    title: 'Jobs by Location',
    directoryTitle: 'Cities and Locations Directory',
    heroKicker: 'City Search',
    heroDescription: 'Choose a city first, then we will show the jobs available in that location.',
    helperTitle: 'How to Use Locations',
    helperSteps: [
      {
        title: 'Choose a City',
        text: 'Select the city you want jobs from, such as Lahore, Karachi, or Islamabad.'
      },
      {
        title: 'Open City Jobs',
        text: 'Click the city card to view only the jobs from that location.'
      },
      {
        title: 'Open Full Details',
        text: 'Use the next page to compare jobs and open full details easily.'
      }
    ],
    searchPlaceholder: 'Search a city...',
    itemTitle: (item) => item.label,
    itemDescription: (item) => `${item.province ? `${item.province}, ` : ''}${item.country || 'Pakistan' } | ${item.count } job${item.count === 1 ? '' : 's'}`,
    jobsTitle: (item) => `Jobs in ${item.label}`,
    jobsDescription: (item) => `These are the currently listed jobs for ${item.label}${item.province ? `, ${item.province}` : ''}.`,
    itemCountLabel: 'jobs',
    deriveItems: (jobs) => {
      const grouped = new Map()

      jobs.forEach((job) => {
        const key = job.city
        const current = grouped.get(key) || {
          value: key,
          label: key,
          province: job.province || '',
          country: job.country || 'In Pakistan',
          count: 0
        }
        current.count += 1
        grouped.set(key, current)
      })

      return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label))
    },
    matchJob: (job, value) => job.city === value
  },
  profession: {
    mode: 'profession',
    title: 'Jobs by Profession',
    directoryTitle: 'Profession Directory',
    heroKicker: 'Career Type',
    heroDescription: 'Choose a profession to quickly open jobs related to that field.',
    helperTitle: 'How to Use Professions',
    helperSteps: [
      {
        title: 'Choose a Profession',
        text: 'Select the profession or category that matches your background.'
      },
      {
        title: 'See Relevant Jobs',
        text: 'The next page will show jobs only from that profession.'
      },
      {
        title: 'Apply with Confidence',
        text: 'Open any job headline to read full requirements and application instructions.'
      }
    ],
    searchPlaceholder: 'Search a profession...',
    itemTitle: (item) => item.label,
    itemDescription: (item) => `${item.count} job${item.count === 1 ? '' : 's'} available in this profession.`,
    jobsTitle: (item) => `${item.label} Jobs`,
    jobsDescription: (item) => `These are the current jobs listed under the ${item.label} profession.`,
    itemCountLabel: 'jobs',
    deriveItems: (jobs) => {
      const grouped = new Map()

      jobs.forEach((job) => {
        const key = job.category
        const current = grouped.get(key) || { value: key, label: key, count: 0 }
        current.count += 1
        grouped.set(key, current)
      })

      return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label))
    },
    matchJob: (job, value) => job.category === value
  },
  industry: {
    mode: 'industry',
    title: 'Jobs by Industry',
    directoryTitle: 'Industry Directory',
    heroKicker: 'Sector Search',
    heroDescription: 'Choose an industry or sector first to open jobs from that area.',
    helperTitle: 'How to Use Industries',
    helperSteps: [
      {
        title: 'Choose an Industry',
        text: 'Pick a sector like education, banking, telecom, public sector, or software.'
      },
      {
        title: 'View Matching Jobs',
        text: 'Open the industry card to see only the jobs in that sector.'
      },
      {
        title: 'Check Details',
        text: 'Click any job headline to read deadlines, requirements, and poster details.'
      }
    ],
    searchPlaceholder: 'Search an industry...',
    itemTitle: (item) => item.label,
    itemDescription: (item) => `${item.count} job${item.count === 1 ? '' : 's'} available in this industry.`,
    jobsTitle: (item) => `${item.label} Jobs`,
    jobsDescription: (item) => `These are the current opportunities in the ${item.label} industry.`,
    itemCountLabel: 'jobs',
    deriveItems: (jobs) => {
      const grouped = new Map()

      jobs.forEach((job) => {
        const key = job.industry
        const current = grouped.get(key) || { value: key, label: key, count: 0 }
        current.count += 1
        grouped.set(key, current)
      })

      return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label))
    },
    matchJob: (job, value) => job.industry === value
  },
  newspaper: {
    mode: 'newspaper',
    title: 'Jobs by Newspaper',
    directoryTitle: 'Newspaper and Source Directory',
    heroKicker: 'Source Search',
    heroDescription: 'Choose a newspaper or source to open the jobs published from that source.',
    helperTitle: 'How to Use Sources',
    helperSteps: [
      {
        title: 'Choose a Newspaper',
        text: 'Select Jang, Dawn, Express, FPSC Ad, LinkedIn, or any other source listed below.'
      },
      {
        title: 'Open Source Jobs',
        text: 'The next page will show only the jobs from that newspaper or source.'
      },
      {
        title: 'Read Full Details',
        text: 'Open the blue job headline to see complete details and application information.'
      }
    ],
    searchPlaceholder: 'Search a newspaper or source...',
    itemTitle: (item) => item.label,
    itemDescription: (item) => `${item.count} job${item.count === 1 ? '' : 's'} available from this source.`,
    jobsTitle: (item) => `Jobs from ${item.label}`,
    jobsDescription: (item) => `These are the jobs currently listed from ${item.label}.`,
    itemCountLabel: 'jobs',
    deriveItems: (jobs) => {
      const grouped = new Map()

      jobs.forEach((job) => {
        const key = job.source
        const current = grouped.get(key) || { value: key, label: key, count: 0 }
        current.count += 1
        grouped.set(key, current)
      })

      return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label))
    },
    matchJob: (job, value) => job.source === value
  }
}

export const getTaxonomyConfig = (mode) => taxonomyConfig[mode]
export const encodeTaxonomyValue = encodeValue

