import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import type { AdminUser } from '@/types'

export const useAdminStore = defineStore('admin', () => {
  // 状态
  const adminPassword = ref(localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || '')
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN) || '')
  const isLoggedIn = ref(false)
  const userInfo = ref<AdminUser | null>(null)
  
  // 计算属性
  const isAuthenticated = computed(() => {
    return isLoggedIn.value && !!token.value
  })
  
  // 方法
  const updateAdminPassword = (pwd: string) => {
    adminPassword.value = pwd
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, pwd)
  }
  
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
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
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  }
  
  const initAuth = () => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
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
    
    // 方法
    updateAdminPassword,
    setToken,
    setUserInfo,
    login,
    logout,
    initAuth
  }
})

// 保持向后兼容
export const useAdminData = useAdminStore
