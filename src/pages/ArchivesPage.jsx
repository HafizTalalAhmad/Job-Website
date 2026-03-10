import React, { useMemo, useState } from 'react'
import { groupArchivesByMonth } from '../utils/jobs'
import ArchiveList from '../components/ArchiveList'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'

function ArchivesPage() {
  const { jobs } = useJobs()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const rangedJobs = useMemo(() => {
    return jobs.filter((job) => {
      const inDateRange =
        (!fromDate || job.postDate >= fromDate) &&
        (!toDate || job.postDate <= toDate)

      return inDateRange
    })
  }, [fromDate, toDate])

  const archiveGroups = groupArchivesByMonth(rangedJobs)

  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel">
        <h1 className="panel-title">Jobs Archive</h1>
        <p className="panel-intro">Browse old jobs month by month.</p>
        <div className="archive-filter-row">
          <label>
            From Date
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label>
            To Date
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
        </div>
      </section>
      <ArchiveList archiveGroups={archiveGroups} />
    </main>
  )
}

export default ArchivesPage
