import { ref, computed } from 'vue'
import { ConfigService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useConfigStore } from '@/stores/configStore'
import type { ConfigState } from '@/types'
import { DEFAULT_CONFIG_STATE, readStoredConfig } from '@/utils/config-storage'
import { getErrorMessage } from '@/utils/common'
import {
  buildConfigSubmitPayload,
  bytesToFileSizeForm,
  secondsToSaveTimeForm,
  type FileSizeUnit,
  type SaveTimeUnit
} from '@/utils/config-form'

type ConfigFlagKey = 'enableChunk' | 's3_proxy' | 'openUpload'

export function useSystemConfig() {
  const alertStore = useAlertStore()
  const configStore = useConfigStore()

  // 状态管理
  const config = ref<ConfigState>({ ...DEFAULT_CONFIG_STATE })
  const isRefreshing = ref(false)
  const isSaving = ref(false)
  const savedPayloadSnapshot = ref('')
  const fileSize = ref(1)
  const sizeUnit = ref<FileSizeUnit>('MB')
  const saveTime = ref(1)
  const saveTimeUnit = ref<SaveTimeUnit>('天')

  const isLoading = computed(() => isRefreshing.value || isSaving.value)

  const buildSubmitPayload = (): Partial<ConfigState> => {
    const payload: Partial<ConfigState> = buildConfigSubmitPayload(
      config.value,
      { value: fileSize.value, unit: sizeUnit.value },
      { value: saveTime.value, unit: saveTimeUnit.value }
    )

    if (!payload.admin_token) {
      delete payload.admin_token
    }

    return payload
  }

  const snapshotPayload = (payload: Partial<ConfigState>) => JSON.stringify(payload)

  const normalizeEditableConfig = (nextConfig: Partial<ConfigState>): ConfigState => ({
    ...DEFAULT_CONFIG_STATE,
    ...nextConfig,
    admin_token: ''
  })

  const markConfigSaved = () => {
    savedPayloadSnapshot.value = snapshotPayload(buildSubmitPayload())
  }

  const isDirty = computed(() => {
    if (!savedPayloadSnapshot.value) {
      return false
    }

    return snapshotPayload(buildSubmitPayload()) !== savedPayloadSnapshot.value
  })

  // 从本地存储获取配置
  const getStoredConfig = (): ConfigState | null => {
    const storedConfig = readStoredConfig<Partial<ConfigState>>()
    return storedConfig ? normalizeEditableConfig(storedConfig) : null
  }

  // 保存配置到本地存储
  const saveConfigToStorage = (configData: ConfigState) => {
    configStore.updateConfig(configData)
  }

  // 获取系统配置
  const fetchConfig = async (): Promise<ConfigState | null> => {
    try {
      isRefreshing.value = true

      const response = await ConfigService.getConfig()

      if (response.code === 200 && response.detail) {
        config.value = normalizeEditableConfig(response.detail)
        const notifyMessage = configStore.applyRemoteConfig(config.value)
        if (notifyMessage) {
          alertStore.showAlert(notifyMessage, 'success')
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

      alertStore.showAlert(getErrorMessage(error, '获取配置失败'), 'error')
      return null
    } finally {
      isRefreshing.value = false
    }
  }

  // 更新系统配置
  const updateConfig = async (newConfig: Partial<ConfigState>): Promise<boolean> => {
    try {
      isSaving.value = true

      const response = await ConfigService.updateConfig(newConfig)

      if (response.code === 200) {
        config.value = normalizeEditableConfig({ ...config.value, ...newConfig })
        syncConfigForm(config.value)
        markConfigSaved()
        saveConfigToStorage(config.value)
        alertStore.showAlert('配置更新成功！', 'success')
        return true
      } else {
        throw new Error(response.message || '更新配置失败')
      }
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, '更新配置失败'), 'error')
      return false
    } finally {
      isSaving.value = false
    }
  }

  const toggleConfigFlag = (key: ConfigFlagKey) => {
    config.value[key] = config.value[key] === 1 ? 0 : 1
  }

  const syncConfigForm = (nextConfig: ConfigState) => {
    const sizeForm = bytesToFileSizeForm(nextConfig.uploadSize)
    fileSize.value = sizeForm.value
    sizeUnit.value = sizeForm.unit

    const saveTimeForm = secondsToSaveTimeForm(nextConfig.max_save_seconds)
    saveTime.value = saveTimeForm.value
    saveTimeUnit.value = saveTimeForm.unit
  }

  const refreshConfig = async () => {
    const latestConfig = await fetchConfig()
    if (latestConfig) {
      syncConfigForm(latestConfig)
      markConfigSaved()
    }
  }

  const submitConfig = () => {
    if (!isDirty.value || isSaving.value) {
      return Promise.resolve(false)
    }

    return updateConfig(buildSubmitPayload())
  }

  // 初始化配置
  const initConfig = async () => {
    // 先尝试从本地存储加载
    const storedConfig = getStoredConfig()
    if (storedConfig) {
      config.value = storedConfig
      syncConfigForm(storedConfig)
      markConfigSaved()
    }

    // 然后从服务器获取最新配置
    await refreshConfig()
  }

  // 计算属性
  const maxFileSizeMB = computed(() => {
    return Math.round(config.value.uploadSize / 1024 / 1024)
  })

  const isConfigLoaded = computed(() => {
    return config.value.name !== DEFAULT_CONFIG_STATE.name || !isLoading.value
  })

  return {
    // 状态
    config,
    isLoading,
    isRefreshing,
    isSaving,
    isDirty,
    fileSize,
    sizeUnit,
    saveTime,
    saveTimeUnit,

    // 计算属性
    maxFileSizeMB,
    isConfigLoaded,

    // 方法
    fetchConfig,
    updateConfig,
    refreshConfig,
    submitConfig,
    toggleConfigFlag,
    initConfig,
    getStoredConfig,
    saveConfigToStorage
  }
}
