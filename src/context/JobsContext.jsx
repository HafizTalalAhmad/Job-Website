import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { jobs as seedJobs } from '../data/jobs'
import {
  createPublicJob,
  deletePublicJob,
  fetchPublicJobs,
  hasSupabaseConfig,
  updatePublicJob
} from '../lib/jobsApi'

const JobsContext = createContext(null)

function dedupeJobs(allJobs) {
  const map = new Map()
  allJobs.forEach((job) => {
    map.set(job.id, job)
  })
  return [...map.values()]
}

function JobsProvider({ children }) {
  const [publicJobs, setPublicJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  useEffect(() => {
    let mounted = true

    setIsLoadingJobs(true)
    fetchPublicJobs()
      .then((rows) => {
        if (!mounted) return
        setPublicJobs(rows)
        setJobsError('')
      })
      .catch((error) => {
        if (!mounted) return
        setJobsError(error.message || 'Unable to load public jobs.')
      })
      .finally(() => {
        if (!mounted) return
        setIsLoadingJobs(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const allJobs = useMemo(() => dedupeJobs([...seedJobs, ...publicJobs]), [publicJobs])
  const jobs = useMemo(() => allJobs.filter((job) => !job.isArchived), [allJobs])
  const archivedJobs = useMemo(() => allJobs.filter((job) => job.isArchived), [allJobs])

  const addJob = async (jobInput) => {
    const created = await createPublicJob(jobInput)
    setPublicJobs((prev) => [created, ...prev])
    return created
  }

  const editJob = async (jobId, jobInput) => {
    const updated = await updatePublicJob(jobId, jobInput)
    setPublicJobs((prev) => prev.map((job) => (job.id === jobId ? updated : job)))
    return updated
  }

  const removeJob = async (jobId) => {
    await deletePublicJob(jobId)
    setPublicJobs((prev) => prev.filter((job) => job.id !== jobId))
  }

  return (
    <JobsContext.Provider
      value={{
        jobs,
        allJobs,
        archivedJobs,
        publicJobs,
        addJob,
        editJob,
        removeJob,
        isLoadingJobs,
        jobsError,
        hasSupabaseConfig
      }}
    >
      {children}
    </JobsContext.Provider>
  )
}

function useJobs() {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error('useJobs must be used within JobsProvider')
  return ctx
}

export { JobsProvider, useJobs }
