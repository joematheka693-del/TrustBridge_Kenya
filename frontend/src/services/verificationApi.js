import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getVerificationRequests(params = {}) {
  const response = await httpClient.get('/verification-requests', { params })
  return unwrapData(response)
}

export async function getVerificationRequestById(requestId) {
  const response = await httpClient.get(`/verification-requests/${requestId}`)
  return unwrapData(response)
}

export async function createVerificationRequest(payload) {
  const response = await httpClient.post('/verification-requests', payload)
  return unwrapData(response)
}

export async function updateVerificationRequestStatus(requestId, payload) {
  const response = await httpClient.patch(`/verification-requests/${requestId}/status`, payload)
  return unwrapData(response)
}

export async function deleteVerificationRequest(requestId) {
  const response = await httpClient.delete(`/verification-requests/${requestId}`)
  return unwrapData(response)
}
