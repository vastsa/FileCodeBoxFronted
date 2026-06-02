import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_STATUS_CODES, TIME_CONSTANTS } from '@/constants'
import type { ApiErrorPayload } from '@/types'
import { clearStoredToken, readStoredToken } from '@/utils/auth-storage'

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'filecodebox:auth:unauthorized'
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
  const token = readStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const handleAuthError = (error: AxiosError<ApiErrorPayload>) => {
  if (error.response?.status === API_STATUS_CODES.UNAUTHORIZED) {
    clearStoredToken()
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED))
  }
  return Promise.reject(error)
}

apiClient.interceptors.request.use(
  attachAuthToken,
  (error) => Promise.reject(error)
)

rawApiClient.interceptors.request.use(
  attachAuthToken,
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  handleAuthError
)

rawApiClient.interceptors.response.use((response) => response, handleAuthError)

export default apiClient
