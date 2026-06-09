import { createContext, useContext, useMemo, useState } from 'react'
import { demoJobs } from '../data/demoJobs.js'

const JobContext = createContext(null)

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(demoJobs)
  const [lastCreatedJob, setLastCreatedJob] = useState(null)
  const [jobSource, setJobSource] = useState('preview')

  const addPreviewJob = (job) => {
    const nextJob = {
      id: job.id || `local-${Date.now()}`,
      status: job.status || 'draft',
      skills: Array.isArray(job.skills) ? job.skills : [],
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      ...job,
    }

    setJobs((currentJobs) => [nextJob, ...currentJobs])
    setLastCreatedJob(nextJob)
    return nextJob
  }

  const findJob = (jobId) => jobs.find((job) => job.id === jobId)

  const value = useMemo(
    () => ({
      jobs,
      setJobs,
      jobSource,
      setJobSource,
      lastCreatedJob,
      addPreviewJob,
      findJob,
    }),
    [jobs, jobSource, lastCreatedJob],
  )

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>
}

export function useJobs() {
  const context = useContext(JobContext)

  if (!context) {
    throw new Error('useJobs must be used inside JobProvider')
  }

  return context
}
