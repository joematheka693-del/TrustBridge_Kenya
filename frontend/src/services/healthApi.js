import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getBackendHealth() {
  const response = await httpClient.get('/health')
  return unwrapData(response)
}

export async function getDatabaseHealth() {
  const response = await httpClient.get('/health/database')
  return unwrapData(response)
}
