import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types'
import {
  clearStoredAuth,
  clearStoredToken,
  hasValidStoredAdminSession,
  readStoredAdminPassword,
  readStoredToken,
  readStoredTokenExpiresAt,
  writeStoredAdminPassword,
  writeStoredToken
} from '@/utils/auth-storage'

export const useAdminStore = defineStore('admin', () => {
  const MAX_TIMER_DELAY = 2_147_483_647
  let expirationTimer: ReturnType<typeof setTimeout> | null = null

  // 状态
  const storedSessionIsValid = hasValidStoredAdminSession()
  if (!storedSessionIsValid) clearStoredToken()
  const adminPassword = ref(readStoredAdminPassword())
  const token = ref(storedSessionIsValid ? readStoredToken() : '')
  const expiresAt = ref(storedSessionIsValid ? readStoredTokenExpiresAt() : null)
  const isLoggedIn = ref(!!token.value)
  const userInfo = ref<AdminUser | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => {
    return isLoggedIn.value && !!token.value
  })
  const hasToken = computed(() => !!token.value)

  const clearExpirationTimer = () => {
    if (expirationTimer) clearTimeout(expirationTimer)
    expirationTimer = null
  }

  const scheduleExpiration = (sessionExpiresAt: number | null) => {
    clearExpirationTimer()
    if (!sessionExpiresAt) return

    const remaining = sessionExpiresAt * 1000 - Date.now()
    if (remaining <= 0) {
      logout()
      return
    }
    expirationTimer = setTimeout(
      () => scheduleExpiration(sessionExpiresAt),
      Math.min(remaining, MAX_TIMER_DELAY)
    )
  }

  // 方法
  const updateAdminPassword = (pwd: string) => {
    adminPassword.value = pwd
    writeStoredAdminPassword(pwd)
  }

  const setToken = (newToken: string, newExpiresAt?: number) => {
    token.value = newToken
    expiresAt.value = newExpiresAt ?? null
    writeStoredToken(newToken, newExpiresAt)
    scheduleExpiration(expiresAt.value)
  }

  const setUserInfo = (user: AdminUser) => {
    userInfo.value = user
    isLoggedIn.value = true
    setToken(user.token, user.expires_at)
  }

  const login = (user: AdminUser) => {
    setUserInfo(user)
  }

  const logout = () => {
    clearExpirationTimer()
    adminPassword.value = ''
    token.value = ''
    expiresAt.value = null
    isLoggedIn.value = false
    userInfo.value = null

    clearStoredAuth()
  }

  const initAuth = () => {
    if (hasValidStoredAdminSession()) {
      const storedToken = readStoredToken()
      token.value = storedToken
      expiresAt.value = readStoredTokenExpiresAt()
      isLoggedIn.value = true
      scheduleExpiration(expiresAt.value)
    } else {
      logout()
    }
  }

  scheduleExpiration(expiresAt.value)

  return {
    // 状态
    adminPassword,
    token,
    expiresAt,
    isLoggedIn,
    userInfo,

    // 计算属性
    isAuthenticated,
    hasToken,

    // 方法
    updateAdminPassword,
    setToken,
    setUserInfo,
    login,
    logout,
    initAuth
  }
})
