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

const readTokenPayloadExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || '')) as { exp?: unknown }
    const expiresAt = Number(payload.exp)
    return Number.isFinite(expiresAt) ? expiresAt : null
  } catch {
    return null
  }
}

export function readStoredTokenExpiresAt(): number | null {
  const storedValue = Number(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT))
  if (Number.isFinite(storedValue) && storedValue > 0) return storedValue
  return readTokenPayloadExpiration(readStoredToken())
}

export function hasValidStoredAdminSession(): boolean {
  const token = readStoredToken()
  const expiresAt = readStoredTokenExpiresAt()
  return !!token && expiresAt !== null && expiresAt > Date.now() / 1000
}

export function writeStoredToken(token: string, expiresAt?: number) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  const normalizedExpiresAt = Number(expiresAt) || readTokenPayloadExpiration(token)
  if (normalizedExpiresAt) {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(normalizedExpiresAt))
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
}

export function clearStoredToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
}
