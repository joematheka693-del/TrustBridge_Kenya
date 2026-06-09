import httpClient from './httpClient.js'

function unwrapData(response) {
  return response.data?.data || response.data
}

export async function getTalentProfiles(params = {}) {
  const response = await httpClient.get('/talent', { params })
  return unwrapData(response)
}

export async function getTalentProfile(profileId) {
  const response = await httpClient.get(`/talent/${profileId}`)
  return unwrapData(response)
}

export async function createTalentProfile(profileData) {
  const response = await httpClient.post('/talent', profileData)
  return unwrapData(response)
}

export async function updateTalentProfile(profileId, profileData) {
  const response = await httpClient.put(`/talent/${profileId}`, profileData)
  return unwrapData(response)
}

export async function deleteTalentProfile(profileId) {
  const response = await httpClient.delete(`/talent/${profileId}`)
  return unwrapData(response)
}
