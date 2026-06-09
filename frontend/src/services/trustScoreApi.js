import httpClient from './httpClient.js'
import { unwrapApiData } from './responseNormalizer.js'

export async function getMyTrustScore() {
  const response = await httpClient.get('/trust-score')
  return unwrapApiData(response)
}

export async function getUserTrustScore(userId) {
  const response = await httpClient.get(`/trust-score/${userId}`)
  return unwrapApiData(response)
}

export async function getTrustScoreEvents() {
  const response = await httpClient.get('/trust-score/events')
  return unwrapApiData(response)
}

export async function createTrustScoreEvent(payload) {
  const response = await httpClient.post('/trust-score/events', payload)
  return unwrapApiData(response)
}
