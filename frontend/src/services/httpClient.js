import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT_MS } from '../config/apiConfig.js'

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustbridge_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed'

    return Promise.reject({
      message,
      status: error.response?.status || 0,
      details: error.response?.data || null,
    })
  },
)

export default httpClient
