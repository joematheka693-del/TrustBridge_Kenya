import httpClient from './httpClient.js'

export async function signupUser(payload) {
  const response = await httpClient.post('/signup', payload)
  return response.data
}

export async function loginUser(payload) {
  const response = await httpClient.post('/login', payload)
  return response.data
}

export async function getProfile() {
  const response = await httpClient.get('/profile')
  return response.data
}

export async function checkProtectedAccess() {
  const response = await httpClient.get('/protected')
  return response.data
}
