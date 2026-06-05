import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useFileDataStore } from '@/stores/fileData'
import type { ReceivedFileRecord, ShareMetadataResponse, ShareSelectResponse } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { getErrorMessage } from '@/utils/common'
import { renderMarkdownPreview } from '@/utils/content-preview'
import { downloadReceivedRecord } from '@/utils/download-action'

type InputStatus = {
  readonly: boolean
  loading: boolean
}

export function useRetrieveFlow() {
  const { t } = useI18n()
  const alertStore = useAlertStore()
  const fileStore = useFileDataStore()
  const { receiveData: records } = storeToRefs(fileStore)

  const code = ref('')
  const inspectedFile = ref<ShareMetadataResponse | null>(null)
  const isInspecting = ref(false)
  const isRetrieving = ref(false)
  const inputStatus = ref<InputStatus>({
    readonly: false,
    loading: false
  })
  const error = ref('')
  const selectedRecord = ref<ReceivedFileRecord | null>(null)
  const previewMediaRecord = ref<ReceivedFileRecord | null>(null)
  const showDrawer = ref(false)
  const showPreview = ref(false)
  const showMediaPreview = ref(false)
  const renderedContent = ref('')
  const normalizedCode = computed(() => code.value.trim())
  const isWorking = computed(() => isInspecting.value || isRetrieving.value)
  const hasValidCode = computed(() => normalizedCode.value.length === 5)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 ' + t('fileSize.bytes')
    const k = 1024
    const sizes = [
      t('fileSize.bytes'),
      t('fileSize.kb'),
      t('fileSize.mb'),
      t('fileSize.gb'),
      t('fileSize.tb')
    ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const createRecord = (detail: ShareSelectResponse): ReceivedFileRecord => {
    const isText =
      typeof detail.is_text === 'boolean'
        ? detail.is_text
        : detail.type
          ? detail.type === 'text'
          : detail.name === 'Text' && !detail.text.startsWith('/share/download')
    const content = isText ? (detail.content ?? detail.text) : null
    const downloadUrl = isText ? null : (detail.download_url ?? detail.text)

    return {
      id: Date.now(),
      code: detail.code,
      filename: detail.name,
      size: formatFileSize(detail.size),
      downloadUrl,
      content,
      date: new Date().toLocaleString(),
      type: isText ? 'text' : 'file',
      remainingDownloads: detail.remaining_downloads
    }
  }

  const resetInspection = () => {
    inspectedFile.value = null
    error.value = ''
  }

  const inspectCode = async () => {
    if (!hasValidCode.value) {
      alertStore.showAlert(t('retrieve.messages.invalidCode'), 'error')
      return
    }

    isInspecting.value = true
    inputStatus.value.readonly = true
    inputStatus.value.loading = true
    error.value = ''

    try {
      const res = await FileService.inspectFile(normalizedCode.value)
      if (res.code === 200 && res.detail) {
        inspectedFile.value = res.detail
      } else {
        inspectedFile.value = null
        error.value = String(res.detail || res.message || '')
        alertStore.showAlert(t('retrieve.messages.retrieveFailure') + error.value, 'error')
      }
    } catch {
      inspectedFile.value = null
      error.value = t('retrieve.messages.previewUnavailable')
      alertStore.showAlert(error.value, 'warning')
    } finally {
      isInspecting.value = false
      inputStatus.value.readonly = false
      inputStatus.value.loading = false
    }
  }

  const handleSubmit = async () => {
    if (!hasValidCode.value) {
      alertStore.showAlert(t('retrieve.messages.invalidCode'), 'error')
      return
    }

    isRetrieving.value = true
    inputStatus.value.readonly = true
    inputStatus.value.loading = true
    error.value = ''

    try {
      const res = await FileService.selectFile(normalizedCode.value)
      if (res.code === 200 && res.detail) {
        const newFileData = createRecord(res.detail)
        const existingIndex = fileStore.receiveData.findIndex(
          (file) => file.code === newFileData.code
        )
        if (existingIndex !== -1) {
          fileStore.deleteReceiveData(existingIndex)
        }
        fileStore.addReceiveData(newFileData)
        selectedRecord.value = newFileData
        if (newFileData.content) {
          showPreview.value = true
        }
        inspectedFile.value = null
        alertStore.showAlert(t('retrieve.messages.retrieveSuccess'), 'success')
      } else {
        error.value = String(res.detail || '')
        alertStore.showAlert(t('retrieve.messages.retrieveFailure') + error.value, 'error')
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('retrieve.messages.unknownError'))
      error.value = errorMessage
      alertStore.showAlert(t('retrieve.messages.networkError') + errorMessage, 'error')
    } finally {
      isRetrieving.value = false
      inputStatus.value.readonly = false
      inputStatus.value.loading = false
      code.value = ''
    }
  }

  const copyContent = async () => {
    if (selectedRecord.value?.content) {
      await copyToClipboard(selectedRecord.value.content, {
        successMsg: t('fileRecord.contentCopied'),
        errorMsg: t('fileRecord.copyFailed'),
        notify: (message, type) => alertStore.showAlert(message, type)
      })
    }
  }

  const viewDetails = (record: ReceivedFileRecord) => {
    selectedRecord.value = record
  }

  const closeDetails = () => {
    selectedRecord.value = null
  }

  const deleteRecord = (id: number) => {
    const index = records.value.findIndex((record) => record.id === id)
    if (index !== -1) {
      fileStore.deleteReceiveData(index)
    }
  }

  const toggleDrawer = () => {
    showDrawer.value = !showDrawer.value
  }

  const downloadRecord = (record: ReceivedFileRecord) => {
    downloadReceivedRecord(record)
  }

  const showContentPreview = () => {
    showPreview.value = true
  }

  const closeContentPreview = () => {
    showPreview.value = false
  }

  const showFilePreview = () => {
    if (!selectedRecord.value) return
    previewMediaRecord.value = selectedRecord.value
    showMediaPreview.value = true
  }

  const closeFilePreview = () => {
    showMediaPreview.value = false
    previewMediaRecord.value = null
  }

  watch(
    () => selectedRecord.value?.content,
    async (content) => {
      if (content) {
        renderedContent.value = await renderMarkdownPreview(content)
      } else {
        renderedContent.value = ''
      }
    },
    { immediate: true }
  )

  watch(normalizedCode, (nextCode) => {
    if (inspectedFile.value && inspectedFile.value.code !== nextCode) {
      resetInspection()
    }

    if (nextCode.length < 5 && error.value) {
      error.value = ''
    }
  })

  return {
    code,
    inspectedFile,
    isInspecting,
    isRetrieving,
    isWorking,
    hasValidCode,
    inputStatus,
    error,
    records,
    selectedRecord,
    previewMediaRecord,
    showDrawer,
    showPreview,
    showMediaPreview,
    renderedContent,
    closeFilePreview,
    closeContentPreview,
    closeDetails,
    copyContent,
    deleteRecord,
    downloadRecord,
    handleSubmit,
    inspectCode,
    resetInspection,
    showFilePreview,
    showContentPreview,
    toggleDrawer,
    viewDetails
  }
}
