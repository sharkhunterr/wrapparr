const BASE_URL = "/api/v1"

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem("wrapparr_token", token)
  } else {
    localStorage.removeItem("wrapparr_token")
  }
}

export function getAccessToken() {
  return localStorage.getItem("wrapparr_token")
}

export function clearAccessToken() {
  localStorage.removeItem("wrapparr_token")
}

async function refreshToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) {
    clearAccessToken()
    window.location.href = "/login"
    throw new Error("Session expiree")
  }
  const data = await res.json()
  setAccessToken(data.access_token)
  return data.access_token
}

export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = { ...options.headers }
  const token = getAccessToken()

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
    options.body = JSON.stringify(options.body)
  }

  let res = await fetch(url, { ...options, headers, credentials: "include" })

  if (res.status === 401 && token) {
    try {
      const newToken = await refreshToken()
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(url, { ...options, headers, credentials: "include" })
    } catch {
      throw new Error("Session expiree")
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `Erreur ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}
