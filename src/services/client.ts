import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_STATUS_CODES, TIME_CONSTANTS } from '@/constants'
import type { ApiErrorPayload } from '@/types'
import { clearStoredToken, hasValidStoredAdminSession, readStoredToken } from '@/utils/auth-storage'

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'filecodebox:auth:unauthorized',
  SETUP_REQUIRED: 'filecodebox:setup:required'
} as const

const rawBaseURL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_DEV

export const apiBaseURL = typeof rawBaseURL === 'string' ? rawBaseURL.replace(/\/+$/, '') : ''

const clientOptions = {
  baseURL: apiBaseURL,
  timeout: TIME_CONSTANTS.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
}

const apiClient = axios.create(clientOptions)
export const rawApiClient = axios.create(clientOptions)

const attachAuthToken = (config: InternalAxiosRequestConfig) => {
  if (hasValidStoredAdminSession()) {
    const token = readStoredToken()
    config.headers.Authorization = `Bearer ${token}`
  } else {
    clearStoredToken()
  }
  return config
}

const getSetupPath = (payload?: ApiErrorPayload) => {
  const detail = payload?.detail
  if (detail && typeof detail === 'object' && typeof detail.setup === 'string') {
    return detail.setup
  }
  return ''
}

const handleAuthError = (error: AxiosError<ApiErrorPayload>) => {
  if (error.response?.status === API_STATUS_CODES.SETUP_REQUIRED) {
    window.dispatchEvent(
      new CustomEvent(AUTH_EVENTS.SETUP_REQUIRED, {
        detail: { setupPath: getSetupPath(error.response.data) }
      })
    )
  }

  if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED) {
    clearStoredToken()
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED))
  }
  return Promise.reject(error)
}

apiClient.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error))

rawApiClient.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error))

apiClient.interceptors.response.use((response) => response.data, handleAuthError)

rawApiClient.interceptors.response.use((response) => response, handleAuthError)

export default apiClient
