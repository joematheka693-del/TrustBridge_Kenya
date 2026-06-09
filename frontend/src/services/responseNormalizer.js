export function unwrapApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}

export function pickList(payload, keys = []) {
  if (Array.isArray(payload)) return payload

  for (const key of keys) {
    const value = payload?.[key]
    if (Array.isArray(value)) return value
  }

  return []
}

export function pickMessage(error, fallback = 'Request failed. Confirm the backend is running and the API URL is correct.') {
  return error?.message || error?.normalizedMessage || fallback
}
