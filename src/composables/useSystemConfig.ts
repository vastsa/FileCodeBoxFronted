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
  fileSizeFormToBytes,
  secondsToSaveTimeForm,
  type FileSizeUnit,
  type SaveTimeUnit
} from '@/utils/config-form'

type ConfigFlagKey = 'enableChunk' | 's3_proxy' | 'openUpload' | 'showAdminAddr'

const SECONDS_PER_DAY = 24 * 60 * 60

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
  const storageLimit = ref(0)
  const storageLimitUnit = ref<FileSizeUnit>('GB')
  const saveTime = ref(1)
  const saveTimeUnit = ref<SaveTimeUnit>('天')
  const adminSessionDays = ref(30)

  const isLoading = computed(() => isRefreshing.value || isSaving.value)

  const buildSubmitPayload = (): Partial<ConfigState> => {
    const payload: Partial<ConfigState> = buildConfigSubmitPayload(
      config.value,
      { value: fileSize.value, unit: sizeUnit.value },
      { value: saveTime.value, unit: saveTimeUnit.value }
    )
    payload.adminSessionExpire = Math.round(adminSessionDays.value * SECONDS_PER_DAY)
    payload.storageLimit =
      storageLimit.value === 0 ? 0 : fileSizeFormToBytes(storageLimit.value, storageLimitUnit.value)

    if (!payload.admin_token) {
      delete payload.admin_token
    }

    return payload
  }

  const snapshotPayload = (payload: Partial<ConfigState>) => JSON.stringify(payload)

  const normalizeAllowedFileTypes = (value: unknown): string[] => {
    const rawTypes =
      typeof value === 'string'
        ? value.split(',')
        : Array.isArray(value)
          ? value
          : DEFAULT_CONFIG_STATE.allowed_file_types

    const normalized = rawTypes.map((item) => String(item).trim()).filter(Boolean)
    return normalized.length > 0 ? normalized : ['*']
  }

  const normalizeEditableConfig = (nextConfig: Partial<ConfigState>): ConfigState => {
    const allowedFileTypes = normalizeAllowedFileTypes(
      nextConfig.allowed_file_types ?? nextConfig.allowedFileTypes
    )
    const codeGenerateType = nextConfig.code_generate_type === 'secret' ? 'secret' : 'number'

    return {
      ...DEFAULT_CONFIG_STATE,
      ...nextConfig,
      allowed_file_types: allowedFileTypes,
      allowedFileTypes,
      code_generate_type: codeGenerateType,
      admin_token: ''
    }
  }

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

    const storageLimitForm = bytesToFileSizeForm(nextConfig.storageLimit)
    storageLimit.value = storageLimitForm.value
    storageLimitUnit.value = storageLimitForm.unit

    const saveTimeForm = secondsToSaveTimeForm(nextConfig.max_save_seconds)
    saveTime.value = saveTimeForm.value
    saveTimeUnit.value = saveTimeForm.unit
    adminSessionDays.value = Math.max(
      1,
      Math.round(nextConfig.adminSessionExpire / SECONDS_PER_DAY)
    )
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
    storageLimit,
    storageLimitUnit,
    saveTime,
    saveTimeUnit,
    adminSessionDays,

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
