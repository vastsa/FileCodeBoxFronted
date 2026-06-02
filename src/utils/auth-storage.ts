import { STORAGE_KEYS } from '@/constants'

export function readStoredAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || ''
}

export function writeStoredAdminPassword(password: string) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password)
}

export function readStoredToken(): string {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || ''
}

export function writeStoredToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}

export function clearStoredToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}
