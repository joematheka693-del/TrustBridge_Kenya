import httpClient from './httpClient.js'
import { unwrapApiData } from './responseNormalizer.js'

export async function getApplications(params = {}) {
  const response = await httpClient.get('/applications', { params })
  return unwrapApiData(response)
}

export async function getApplicationById(applicationId) {
  const response = await httpClient.get(`/applications/${applicationId}`)
  return unwrapApiData(response)
}

export async function createApplication(payload) {
  const response = await httpClient.post('/applications', payload)
  return unwrapApiData(response)
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await httpClient.patch(`/applications/${applicationId}/status`, { status })
  return unwrapApiData(response)
}

export async function deleteApplication(applicationId) {
  const response = await httpClient.delete(`/applications/${applicationId}`)
  return unwrapApiData(response)
}
