import { ref, computed } from 'vue'
import { ConfigService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { SystemConfig } from '@/types'
import { STORAGE_KEYS, DEFAULT_CONFIG } from '@/constants'

export function useSystemConfig() {
  const alertStore = useAlertStore()
  
  // 状态管理
  const config = ref<SystemConfig>({ ...DEFAULT_CONFIG })
  const isLoading = ref(false)
  
  // 从本地存储获取配置
  const getStoredConfig = (): SystemConfig | null => {
    try {
      const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG)
      if (storedConfig) {
        return JSON.parse(storedConfig)
      }
    } catch (error) {
      console.error('解析本地配置失败:', error)
    }
    return null
  }
  
  // 保存配置到本地存储
  const saveConfigToStorage = (configData: SystemConfig) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configData))
    } catch (error) {
      console.error('保存配置到本地存储失败:', error)
    }
  }
  
  // 获取系统配置
  const fetchConfig = async (): Promise<SystemConfig | null> => {
    try {
      isLoading.value = true
      
      const response = await ConfigService.getConfig()
      
      if (response.code === 200 && response.detail) {
        config.value = { ...DEFAULT_CONFIG, ...response.detail }
        saveConfigToStorage(config.value)
        
        // 处理通知
        if (response.detail.notify_title && response.detail.notify_content) {
          const notifyKey = response.detail.notify_title + response.detail.notify_content
          const lastNotify = localStorage.getItem(STORAGE_KEYS.NOTIFY)
          
          if (lastNotify !== notifyKey) {
            localStorage.setItem(STORAGE_KEYS.NOTIFY, notifyKey)
            alertStore.showAlert(
              `${response.detail.notify_title}: ${response.detail.notify_content}`,
              'success'
            )
          }
        }
        
        return config.value
      } else {
        throw new Error(response.message || '获取配置失败')
      }
    } catch (error) {
      // 如果网络请求失败，尝试使用本地存储的配置
      const storedConfig = getStoredConfig()
      if (storedConfig) {
        config.value = storedConfig
        return config.value
      }
      
      const errorMessage = error instanceof Error ? error.message : '获取配置失败'
      alertStore.showAlert(errorMessage, 'error')
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新系统配置
  const updateConfig = async (newConfig: Partial<SystemConfig>): Promise<boolean> => {
    try {
      isLoading.value = true
      
      const response = await ConfigService.updateConfig(newConfig)
      
      if (response.code === 200) {
        config.value = { ...config.value, ...newConfig }
        saveConfigToStorage(config.value)
        alertStore.showAlert('配置更新成功！', 'success')
        return true
      } else {
        throw new Error(response.message || '更新配置失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新配置失败'
      alertStore.showAlert(errorMessage, 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 初始化配置
  const initConfig = async () => {
    // 先尝试从本地存储加载
    const storedConfig = getStoredConfig()
    if (storedConfig) {
      config.value = storedConfig
    }
    
    // 然后从服务器获取最新配置
    await fetchConfig()
  }
  
  // 计算属性
  const maxFileSizeMB = computed(() => {
    return Math.round(config.value.maxFileSize / 1024 / 1024)
  })
  
  const isConfigLoaded = computed(() => {
    return config.value.name !== DEFAULT_CONFIG.name || !isLoading.value
  })
  
  return {
    // 状态
    config,
    isLoading,
    
    // 计算属性
    maxFileSizeMB,
    isConfigLoaded,
    
    // 方法
    fetchConfig,
    updateConfig,
    initConfig,
    getStoredConfig,
    saveConfigToStorage
  }
}