export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000)

export const FRONTEND_MODE = import.meta.env.MODE || 'development'
