import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getAdminOverview() {
  const response = await httpClient.get('/admin/overview')
  return unwrapData(response)
}

export async function getAdminUsers(params = {}) {
  const response = await httpClient.get('/admin/users', { params })
  return unwrapData(response)
}

export async function getAdminActivity() {
  const response = await httpClient.get('/admin/activity')
  return unwrapData(response)
}

export async function updateUserRole(userId, role) {
  const response = await httpClient.patch(`/admin/users/${userId}/role`, { role })
  return unwrapData(response)
}

export async function updateUserStatus(userId, status) {
  const response = await httpClient.patch(`/admin/users/${userId}/status`, { status })
  return unwrapData(response)
}

export async function deleteAdminUser(userId) {
  const response = await httpClient.delete(`/admin/users/${userId}`)
  return unwrapData(response)
}

export async function updateAdminJobStatus(jobId, status) {
  const response = await httpClient.patch(`/admin/jobs/${jobId}/status`, { status })
  return unwrapData(response)
}

export async function createAdminTrustEvent(payload) {
  const response = await httpClient.post('/admin/trust-events', payload)
  return unwrapData(response)
}
