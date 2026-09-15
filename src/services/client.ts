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
// 寄件口令使用独立凭证，不能被管理员拦截器覆盖；401 也不应注销管理员会话。
export const publicApiClient = axios.create(clientOptions)
publicApiClient.interceptors.response.use((response) => response.data)

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

/** 寄件凭证仅附加到当前上传实例，不覆盖管理员请求，也不落入持久化存储。 */
export function createDeliveryUploadClient(getToken: () => string) {
  const client = axios.create(clientOptions)
  client.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${getToken()}`
    return config
  })
  client.interceptors.response.use((response) => response.data)
  return client
}
