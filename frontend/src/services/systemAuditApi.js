import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getSystemAudit() {
  const response = await httpClient.get('/system-audit')
  return unwrapData(response)
}
