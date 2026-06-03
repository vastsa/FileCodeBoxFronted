import { ref, computed } from 'vue'
import { ConfigService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useConfigStore } from '@/stores/configStore'
import type {
  ConfigDiagnosticItem,
  ConfigDiagnosticsResponse,
  ConfigDiagnosticSeverity,
  ConfigDiagnosticSummary,
  ConfigState
} from '@/types'
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

type NormalizedConfigDiagnostics = {
  items: ConfigDiagnosticItem[]
  diagnosticItems: ConfigDiagnosticItem[]
  diagnostic_items: ConfigDiagnosticItem[]
  summary: ConfigDiagnosticSummary
  diagnosticSummary: ConfigDiagnosticSummary
  diagnostic_summary: ConfigDiagnosticSummary
}

type ConfigDiagnosticsSource =
  | (Partial<ConfigState> &
      ConfigDiagnosticsResponse & {
        diagnostics?: ConfigDiagnosticsResponse
      })
  | null
  | undefined

const diagnosticSeverities: ConfigDiagnosticSeverity[] = ['danger', 'warning', 'success', 'neutral']

const emptyDiagnosticSummary = (): ConfigDiagnosticSummary => ({
  total: 0,
  dangerCount: 0,
  warningCount: 0,
  successCount: 0,
  neutralCount: 0,
  strongestSeverity: 'success'
})

const emptyConfigDiagnostics = (): NormalizedConfigDiagnostics => {
  const items: ConfigDiagnosticItem[] = []
  const summary = emptyDiagnosticSummary()
  return {
    items,
    diagnosticItems: items,
    diagnostic_items: items,
    summary,
    diagnosticSummary: summary,
    diagnostic_summary: summary
  }
}

const normalizeDiagnosticSeverity = (severity: string | undefined): ConfigDiagnosticSeverity =>
  diagnosticSeverities.includes(severity as ConfigDiagnosticSeverity)
    ? (severity as ConfigDiagnosticSeverity)
    : 'neutral'

const normalizeConfigDiagnostics = (
  value: ConfigDiagnosticsSource
): NormalizedConfigDiagnostics => {
  const diagnostics = value?.diagnostics
  const items = (
    diagnostics?.items ??
    diagnostics?.diagnosticItems ??
    diagnostics?.diagnostic_items ??
    value?.items ??
    value?.diagnosticItems ??
    value?.diagnostic_items ??
    []
  )
    .filter((item) => item && item.key)
    .map((item) => ({
      ...item,
      count: Number(item.count || 0),
      priority: Number(item.priority || 0),
      severity: normalizeDiagnosticSeverity(item.severity),
      fields: item.fields || (item.field ? [String(item.field)] : [])
    }))

  const rawSummary =
    diagnostics?.summary ??
    diagnostics?.diagnosticSummary ??
    diagnostics?.diagnostic_summary ??
    value?.summary ??
    value?.diagnosticSummary ??
    value?.diagnostic_summary ??
    {}
  const summary: ConfigDiagnosticSummary = {
    total: Number(rawSummary.total ?? items.length),
    dangerCount: Number(rawSummary.dangerCount ?? rawSummary.danger_count ?? 0),
    danger_count: Number(rawSummary.dangerCount ?? rawSummary.danger_count ?? 0),
    warningCount: Number(rawSummary.warningCount ?? rawSummary.warning_count ?? 0),
    warning_count: Number(rawSummary.warningCount ?? rawSummary.warning_count ?? 0),
    successCount: Number(rawSummary.successCount ?? rawSummary.success_count ?? 0),
    success_count: Number(rawSummary.successCount ?? rawSummary.success_count ?? 0),
    neutralCount: Number(rawSummary.neutralCount ?? rawSummary.neutral_count ?? 0),
    neutral_count: Number(rawSummary.neutralCount ?? rawSummary.neutral_count ?? 0),
    strongestSeverity: normalizeDiagnosticSeverity(
      rawSummary.strongestSeverity ?? rawSummary.strongest_severity
    ),
    strongest_severity: normalizeDiagnosticSeverity(
      rawSummary.strongestSeverity ?? rawSummary.strongest_severity
    )
  }

  return {
    items,
    diagnosticItems: items,
    diagnostic_items: items,
    summary,
    diagnosticSummary: summary,
    diagnostic_summary: summary
  }
}

const stripDiagnosticFields = (nextConfig: Partial<ConfigState>): Partial<ConfigState> => {
  const {
    diagnostics: _diagnostics,
    diagnosticItems: _diagnosticItems,
    diagnostic_items: _diagnosticItemsSnake,
    diagnosticSummary: _diagnosticSummary,
    diagnostic_summary: _diagnosticSummarySnake,
    ...editableConfig
  } = nextConfig
  return editableConfig
}

export function useSystemConfig() {
  const alertStore = useAlertStore()
  const configStore = useConfigStore()

  // 状态管理
  const config = ref<ConfigState>({ ...DEFAULT_CONFIG_STATE })
  const isRefreshing = ref(false)
  const isSaving = ref(false)
  const isDiagnosticsRefreshing = ref(false)
  const savedPayloadSnapshot = ref('')
  const configDiagnostics = ref<NormalizedConfigDiagnostics>(emptyConfigDiagnostics())
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

  const normalizeEditableConfig = (nextConfig: Partial<ConfigState>): ConfigState => {
    const editableConfig = stripDiagnosticFields(nextConfig)
    return {
      ...DEFAULT_CONFIG_STATE,
      ...editableConfig,
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

  const refreshDiagnostics = async (showError = true) => {
    try {
      isDiagnosticsRefreshing.value = true
      const response = await ConfigService.getDiagnostics()
      if (response.code === 200 && response.detail) {
        configDiagnostics.value = normalizeConfigDiagnostics(response.detail)
      } else {
        throw new Error(response.message || '获取配置诊断失败')
      }
    } catch (error) {
      if (showError) {
        alertStore.showAlert(getErrorMessage(error, '获取配置诊断失败'), 'error')
      }
    } finally {
      isDiagnosticsRefreshing.value = false
    }
  }

  // 获取系统配置
  const fetchConfig = async (): Promise<ConfigState | null> => {
    try {
      isRefreshing.value = true

      const response = await ConfigService.getConfig()

      if (response.code === 200 && response.detail) {
        configDiagnostics.value = normalizeConfigDiagnostics(response.detail)
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
        configDiagnostics.value = emptyConfigDiagnostics()
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
        await refreshDiagnostics(false)
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

  const configDiagnosticItems = computed(() => configDiagnostics.value.items)
  const configDiagnosticSummary = computed(() => configDiagnostics.value.summary)

  const isConfigLoaded = computed(() => {
    return config.value.name !== DEFAULT_CONFIG_STATE.name || !isLoading.value
  })

  return {
    // 状态
    config,
    isLoading,
    isRefreshing,
    isSaving,
    isDiagnosticsRefreshing,
    isDirty,
    configDiagnosticItems,
    configDiagnosticSummary,
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
    refreshDiagnostics,
    submitConfig,
    toggleConfigFlag,
    initConfig,
    getStoredConfig,
    saveConfigToStorage
  }
}
