import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getJobs(params = {}) {
  const response = await httpClient.get('/jobs', { params })
  return unwrapData(response)
}

export async function getJobById(jobId) {
  const response = await httpClient.get(`/jobs/${jobId}`)
  return unwrapData(response)
}

export async function createJob(payload) {
  const response = await httpClient.post('/jobs', payload)
  return unwrapData(response)
}

export async function updateJob(jobId, payload) {
  const response = await httpClient.put(`/jobs/${jobId}`, payload)
  return unwrapData(response)
}

export async function deleteJob(jobId) {
  const response = await httpClient.delete(`/jobs/${jobId}`)
  return unwrapData(response)
}
