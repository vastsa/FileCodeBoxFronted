import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ConfigService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { copyToClipboard } from '@/utils/clipboard'
import { getErrorMessage } from '@/utils/common'

export function useMcpSettings() {
  const { t } = useI18n()
  const alertStore = useAlertStore()
  const isLoading = ref(false)
  const isSaving = ref(false)
  const requireToken = ref(0)
  const guestUploadOpen = ref(1)

  const loadSettings = async () => {
    isLoading.value = true
    try {
      const response = await ConfigService.getConfig()
      if (response.code !== 200 || !response.detail) {
        throw new Error(t('admin.mcp.loadFailed'))
      }
      requireToken.value = response.detail.mcp_require_token === 1 ? 1 : 0
      guestUploadOpen.value = response.detail.open_upload === 0 ? 0 : 1
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, t('admin.mcp.loadFailed')), 'error')
    } finally {
      isLoading.value = false
    }
  }

  const toggleTokenRequirement = async () => {
    if (isSaving.value || isLoading.value) return
    const nextValue = requireToken.value === 1 ? 0 : 1
    isSaving.value = true
    try {
      const response = await ConfigService.updateConfig({ mcp_require_token: nextValue })
      if (response.code !== 200) throw new Error(t('admin.mcp.saveFailed'))
      requireToken.value = nextValue
      alertStore.showAlert(t('admin.mcp.saveSuccess'), 'success')
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, t('admin.mcp.saveFailed')), 'error')
    } finally {
      isSaving.value = false
    }
  }

  const copyText = (value: string) =>
    copyToClipboard(value, {
      successMsg: t('admin.mcp.copySuccess'),
      errorMsg: t('admin.mcp.copyFailed'),
      notify: (message, type) => alertStore.showAlert(message, type)
    })

  return {
    isLoading,
    isSaving,
    requireToken,
    guestUploadOpen,
    loadSettings,
    toggleTokenRequirement,
    copyText
  }
}
