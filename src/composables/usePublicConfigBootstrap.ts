import { ConfigService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useConfigStore } from '@/stores/configStore'

export function usePublicConfigBootstrap() {
  const alertStore = useAlertStore()
  const configStore = useConfigStore()

  const syncPublicConfig = async () => {
    const res = await ConfigService.getUserConfig()

    if (res.code !== 200 || !res.detail) {
      return
    }

    configStore.applyPublicMeta(res.detail.meta)
    const notifyMessage = configStore.applyRemoteConfig(res.detail.config)
    if (notifyMessage) {
      alertStore.showAlert(notifyMessage, 'success')
    }
  }

  return {
    syncPublicConfig
  }
}
