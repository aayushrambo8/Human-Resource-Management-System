import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { TokenResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const ACCESS_TOKEN_KEY = 'hrms.accessToken'
const REFRESH_TOKEN_KEY = 'hrms.refreshToken'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

export function saveTokens(tokens: TokenResponse) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasSession() {
  return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY) && sessionStorage.getItem(REFRESH_TOKEN_KEY))
}

export function getSessionEmail() {
  return sessionStorage.getItem('hrms.email') ?? ''
}

export function saveSessionEmail(email: string) {
  sessionStorage.setItem('hrms.email', email)
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshRequest: Promise<TokenResponse> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)
    const original = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined
    const url = original?.url ?? ''
    const isAuthRequest = ['/api/auth/login', '/api/auth/bootstrap', '/api/auth/refresh'].some((path) =>
      url.includes(path),
    )
    if (error.response?.status !== 401 || !original || original.retried || isAuthRequest) {
      return Promise.reject(error)
    }

    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      clearTokens()
      window.dispatchEvent(new Event('hrms:session-expired'))
      return Promise.reject(error)
    }

    original.retried = true
    try {
      refreshRequest ??= axios
        .post<TokenResponse>(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          saveTokens(data)
          return data
        })
        .finally(() => {
          refreshRequest = null
        })
      const tokens = await refreshRequest
      original.headers.Authorization = `Bearer ${tokens.accessToken}`
      return api(original)
    } catch (refreshError) {
      clearTokens()
      window.dispatchEvent(new Event('hrms:session-expired'))
      return Promise.reject(refreshError)
    }
  },
)

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Could not connect to the HRMS server. Check that the backend is running.'
    if (error.response.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.response.status === 403) return 'You do not have permission to view this information.'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
  }
  return error instanceof Error ? error.message : fallback
}
