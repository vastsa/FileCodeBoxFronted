import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useConfigStore } from '@/stores/configStore'
import type { LocalShareItem, LocalShareResult } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { getErrorMessage } from '@/utils/common'
import { buildRetrieveUrl } from '@/utils/share-url'

export function useLocalShare() {
  const { t } = useI18n()
  const alertStore = useAlertStore()
  const configStore = useConfigStore()

  const currentPath = ref('')
  const items = ref<LocalShareItem[]>([])
  const truncated = ref(false)
  const isLoading = ref(false)
  const isSharing = ref(false)
  const deletingPath = ref('')
  const showShareModal = ref(false)
  const sharingItem = ref<LocalShareItem | null>(null)
  const shareResult = ref<LocalShareResult | null>(null)
  const expireStyle = ref('day')
  const expireValue = ref(1)

  const expireOptions = computed(() => {
    const styles = configStore.config.expire_style?.length
      ? configStore.config.expire_style
      : ['day', 'hour', 'minute', 'forever', 'count']
    return styles.map((value) => ({
      value,
      label: t(`send.time.${value}`)
    }))
  })

  const breadcrumbs = computed(() => {
    if (!currentPath.value) return []
    const parts = currentPath.value.split('/').filter(Boolean)
    return parts.map((name, index) => ({
      name,
      path: parts.slice(0, index + 1).join('/')
    }))
  })

  const shareModalTitle = computed(() =>
    shareResult.value ? t('admin.localShare.resultTitle') : t('admin.localShare.shareTitle')
  )

  const loadDirectory = async (path: string) => {
    isLoading.value = true
    try {
      const response = await FileService.listLocalFiles(path)
      if (response.code !== 200 || !response.detail) {
        throw new Error(t('admin.localShare.loadFailed'))
      }
      currentPath.value = response.detail.path || ''
      items.value = response.detail.items || []
      truncated.value = Boolean(response.detail.truncated)
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, t('admin.localShare.loadFailed')), 'error')
    } finally {
      isLoading.value = false
    }
  }

  const openShare = (item: LocalShareItem) => {
    sharingItem.value = item
    shareResult.value = null
    expireStyle.value = expireOptions.value[0]?.value || 'day'
    expireValue.value = 1
    showShareModal.value = true
  }

  const closeShareModal = () => {
    showShareModal.value = false
    sharingItem.value = null
    shareResult.value = null
  }

  const confirmShare = async () => {
    if (!sharingItem.value) return
    isSharing.value = true
    try {
      const response = await FileService.shareLocalFile({
        filename: sharingItem.value.path,
        expire_value: expireStyle.value === 'forever' ? 1 : Math.max(1, Number(expireValue.value) || 1),
        expire_style: expireStyle.value
      })
      if (response.code !== 200 || !response.detail?.code) {
        throw new Error(t('admin.localShare.shareFailed'))
      }
      shareResult.value = response.detail
      alertStore.showAlert(
        t('admin.localShare.shareSuccess', { code: response.detail.code }),
        'success'
      )
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, t('admin.localShare.shareFailed')), 'error')
    } finally {
      isSharing.value = false
    }
  }

  const copyCode = async () => {
    if (!shareResult.value) return
    await copyToClipboard(shareResult.value.code, {
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  const copyLink = async () => {
    if (!shareResult.value) return
    await copyToClipboard(buildRetrieveUrl(shareResult.value.code), {
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  const removeFile = async (item: LocalShareItem) => {
    if (!window.confirm(t('admin.localShare.deleteConfirm', { name: item.path }))) {
      return
    }
    deletingPath.value = item.path
    try {
      const response = await FileService.deleteLocalFile(item.path)
      if (response.code !== 200) {
        throw new Error(t('admin.localShare.deleteFailed'))
      }
      alertStore.showAlert(t('admin.localShare.deleteSuccess'), 'success')
      await loadDirectory(currentPath.value)
    } catch (error) {
      alertStore.showAlert(getErrorMessage(error, t('admin.localShare.deleteFailed')), 'error')
    } finally {
      deletingPath.value = ''
    }
  }

  return {
    breadcrumbs,
    currentPath,
    deletingPath,
    expireOptions,
    expireStyle,
    expireValue,
    isLoading,
    isSharing,
    items,
    shareModalTitle,
    shareResult,
    sharingItem,
    showShareModal,
    truncated,
    closeShareModal,
    confirmShare,
    copyCode,
    copyLink,
    loadDirectory,
    openShare,
    removeFile
  }
}
