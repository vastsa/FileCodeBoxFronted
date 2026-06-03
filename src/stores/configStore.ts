import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ConfigState, PublicConfigMeta } from '@/types'
import {
  DEFAULT_PUBLIC_CONFIG,
  readNotifyKey,
  readStoredConfig,
  toPublicConfig,
  writeNotifyKey,
  writeStoredConfig,
  type PublicConfig
} from '@/utils/config-storage'

export const useConfigStore = defineStore('config', () => {
  const config = ref<PublicConfig>({
    ...DEFAULT_PUBLIC_CONFIG,
    ...toPublicConfig(readStoredConfig<Partial<ConfigState>>())
  })
  const publicMeta = ref<PublicConfigMeta>({})

  const uploadSizeLimit = computed(() => config.value.uploadSize)
  const appVersion = computed(() => publicMeta.value.version || '')

  const updateConfig = (nextConfig: Partial<ConfigState>) => {
    config.value = {
      ...DEFAULT_PUBLIC_CONFIG,
      ...config.value,
      ...toPublicConfig(nextConfig)
    }
    writeStoredConfig(config.value)
  }

  const applyRemoteConfig = (nextConfig: Partial<ConfigState>): string | null => {
    updateConfig(nextConfig)

    const { notify_title: notifyTitle, notify_content: notifyContent } = nextConfig
    if (!notifyTitle || !notifyContent) {
      return null
    }

    const notifyKey = notifyTitle + notifyContent
    if (readNotifyKey() === notifyKey) {
      return null
    }

    writeNotifyKey(notifyKey)
    return `${notifyTitle}: ${notifyContent}`
  }

  const applyPublicMeta = (nextMeta: PublicConfigMeta | undefined) => {
    if (!nextMeta) return

    publicMeta.value = {
      ...publicMeta.value,
      ...nextMeta
    }
  }

  const reloadStoredConfig = () => {
    config.value = {
      ...DEFAULT_PUBLIC_CONFIG,
      ...toPublicConfig(readStoredConfig<Partial<ConfigState>>())
    }
  }

  return {
    appVersion,
    config,
    publicMeta,
    uploadSizeLimit,
    applyPublicMeta,
    applyRemoteConfig,
    updateConfig,
    reloadStoredConfig
  }
})
