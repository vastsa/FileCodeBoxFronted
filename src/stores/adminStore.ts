import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types'
import {
  clearStoredAuth,
  readStoredAdminPassword,
  readStoredToken,
  writeStoredAdminPassword,
  writeStoredToken
} from '@/utils/auth-storage'

export const useAdminStore = defineStore('admin', () => {
  // 状态
  const adminPassword = ref(readStoredAdminPassword())
  const token = ref(readStoredToken())
  const isLoggedIn = ref(false)
  const userInfo = ref<AdminUser | null>(null)
  
  // 计算属性
  const isAuthenticated = computed(() => {
    return isLoggedIn.value && !!token.value
  })
  const hasToken = computed(() => !!token.value)
  
  // 方法
  const updateAdminPassword = (pwd: string) => {
    adminPassword.value = pwd
    writeStoredAdminPassword(pwd)
  }
  
  const setToken = (newToken: string) => {
    token.value = newToken
    writeStoredToken(newToken)
  }
  
  const setUserInfo = (user: AdminUser) => {
    userInfo.value = user
    isLoggedIn.value = true
    setToken(user.token)
  }
  
  const login = (user: AdminUser) => {
    setUserInfo(user)
  }
  
  const logout = () => {
    adminPassword.value = ''
    token.value = ''
    isLoggedIn.value = false
    userInfo.value = null
    
    clearStoredAuth()
  }
  
  const initAuth = () => {
    const storedToken = readStoredToken()
    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
    }
  }
  
  return {
    // 状态
    adminPassword,
    token,
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
