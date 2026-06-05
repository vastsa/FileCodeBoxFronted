import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAlertStore } from '@/stores/alertStore'
import { useAdminStore } from '@/stores/adminStore'
import { useConfigStore } from '@/stores/configStore'
import { useFileDataStore } from '@/stores/fileData'
import type { SendType, SentFileRecord, UploadProgress } from '@/types'
import { getClipboardFile, insertTextAtSelection } from '@/utils/clipboard-paste'
import { getErrorMessage } from '@/utils/common'
import { getStorageUnit } from '@/utils/convert'
import { calculateFileHash } from '@/utils/file-processing'
import { buildSentRecord, isExpirationWithinLimit } from '@/utils/send-record'
import { createSentRecordActions } from '@/utils/sent-record-actions'
import { useSendSubmit } from './useSendSubmit'

export function useSendFlow() {
  const { t } = useI18n()
  const alertStore = useAlertStore()
  const adminStore = useAdminStore()
  const configStore = useConfigStore()
  const fileDataStore = useFileDataStore()
  const config = computed(() => configStore.config)
  const sendType = ref<SendType>('file')
  const selectedFile = ref<File | null>(null)
  const selectedFiles = ref<File[]>([])
  const textContent = ref('')
  const expirationMethod = ref(config.value.expireStyle[0] || 'day')
  const expirationValue = ref('1')
  const uploadProgress = ref(0)
  const uploadedBytes = ref(0)
  const totalBytes = ref(0)
  const uploadSpeed = ref(0)
  const lastProgressSnapshot = ref({ loaded: 0, time: 0 })
  const showDrawer = ref(false)
  const selectedRecord = ref<SentFileRecord | null>(null)
  const isSubmitting = ref(false)
  const fileHash = ref('')
  const sendRecords = computed(() => fileDataStore.shareData)
  const uploadDescription = computed(() =>
    t('send.uploadArea.descriptionWithLimit', {
      size: getStorageUnit(config.value.uploadSize)
    })
  )
  const allowedFileTypes = computed(() => {
    const types = config.value.allowedFileTypes || config.value.allowed_file_types || ['*']
    const normalized = types.map((type) => String(type).trim()).filter(Boolean)
    return normalized.length > 0 ? normalized : ['*']
  })
  const acceptedTypes = computed(() => {
    if (allowedFileTypes.value.some((type) => type === '*' || type === '*/*')) return '*'

    return allowedFileTypes.value
      .map((type) => {
        const normalizedType = type.toLowerCase()
        if (normalizedType.includes('/')) return normalizedType
        return normalizedType.startsWith('.') ? normalizedType : `.${normalizedType}`
      })
      .join(',')
  })
  const expirationOptions = computed(() =>
    config.value.expireStyle.map((value) => ({
      value,
      label: getUnit(value)
    }))
  )
  watch(
    () => config.value.expireStyle,
    (expireStyle) => {
      if (expireStyle.length > 0 && !expireStyle.includes(expirationMethod.value)) {
        expirationMethod.value = expireStyle[0]
      }
    },
    { immediate: true }
  )
  const notifyCopyResult = (message: string, type: 'success' | 'error') => {
    alertStore.showAlert(message, type)
  }
  const sentRecordActions = createSentRecordActions(notifyCopyResult)
  const { resetPresignUpload, submitFile, submitText } = useSendSubmit({
    getMaxFileSize: () => configStore.uploadSizeLimit,
    notify: (message, type) => alertStore.showAlert(message, type),
    translate: t,
    onProgress: (progress: UploadProgress) => {
      const now = performance.now()
      if (lastProgressSnapshot.value.time > 0 && now > lastProgressSnapshot.value.time) {
        const deltaBytes = Math.max(0, progress.loaded - lastProgressSnapshot.value.loaded)
        const deltaSeconds = (now - lastProgressSnapshot.value.time) / 1000
        uploadSpeed.value = deltaSeconds > 0 ? deltaBytes / deltaSeconds : 0
      }

      lastProgressSnapshot.value = {
        loaded: progress.loaded,
        time: now
      }
      uploadedBytes.value = progress.loaded
      totalBytes.value = progress.total
      uploadProgress.value = progress.percentage
    },
    onHashCalculated: (hash) => {
      fileHash.value = hash
    }
  })

  const checkOpenUpload = () => {
    if (config.value.openUpload === 0 && !adminStore.hasToken) {
      alertStore.showAlert(t('send.messages.guestUploadDisabled'), 'error')
      return false
    }
    return true
  }

  const resetUploadProgress = () => {
    uploadProgress.value = 0
    uploadedBytes.value = 0
    totalBytes.value = 0
    uploadSpeed.value = 0
    lastProgressSnapshot.value = { loaded: 0, time: 0 }
  }

  const checkFileSize = (file: File) => {
    if (file.size > config.value.uploadSize) {
      alertStore.showAlert(
        t('send.messages.fileSizeExceeded', { size: getStorageUnit(config.value.uploadSize) }),
        'error'
      )
      selectedFile.value = null
      return false
    }
    return true
  }

  const checkFileType = (file: File) => {
    if (allowedFileTypes.value.some((type) => type === '*' || type === '*/*')) {
      return true
    }

    const fileName = file.name.toLowerCase()
    const mimeType = file.type.toLowerCase()
    const isAllowed = allowedFileTypes.value.some((type) => {
      const rule = type.toLowerCase()
      if (rule.includes('/')) {
        if (rule.endsWith('/*')) {
          return mimeType.startsWith(rule.slice(0, -1))
        }
        return mimeType === rule
      }

      const extension = rule.startsWith('.') ? rule : `.${rule}`
      return fileName.endsWith(extension)
    })

    if (!isAllowed) {
      alertStore.showAlert(
        t('send.messages.fileTypeNotAllowed', { types: allowedFileTypes.value.join(', ') }),
        'error'
      )
    }

    return isAllowed
  }

  const checkExpirationTime = (method: string, value: string): boolean =>
    isExpirationWithinLimit(method, value, config.value.max_save_seconds || 0)

  const checkUpload = () => {
    if (!selectedFile.value) return false
    if (!checkOpenUpload()) return false
    if (!checkFileSize(selectedFile.value)) return false
    if (!checkFileType(selectedFile.value)) return false
    if (!checkExpirationTime(expirationMethod.value, expirationValue.value)) return false
    return true
  }

  const handleFileSelected = async (file: File) => {
    selectedFile.value = file
    selectedFiles.value = []
    if (!checkOpenUpload()) return
    if (!checkFileSize(file)) return
    if (!checkFileType(file)) return
    fileHash.value = await calculateFileHash(file)
  }

  const handleFilesSelected = async (files: File[]) => {
    if (!checkOpenUpload()) return
    const invalidFile = files.find((file) => !checkFileSize(file) || !checkFileType(file))
    if (invalidFile) return
    selectedFiles.value = files
    selectedFile.value = null
    fileHash.value = ''
  }

  const handleFileDrop = async (event: DragEvent) => {
    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return
    const files = Array.from(event.dataTransfer.files)
    if (files.length === 1) {
      const file = files[0]
      selectedFile.value = file
      selectedFiles.value = []
      if (!checkUpload()) return
      fileHash.value = await calculateFileHash(file)
    } else {
      if (!checkOpenUpload()) return
      const invalidFile = files.find((file) => !checkFileSize(file) || !checkFileType(file))
      if (invalidFile) return
      selectedFiles.value = files
      selectedFile.value = null
      fileHash.value = ''
    }
  }

  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    const file = getClipboardFile(items)
    if (file) {
      if (file.size === 0) {
        alertStore.showAlert(t('send.messages.emptyFileError'), 'error')
        return
      }

      selectedFile.value = file
      if (!checkUpload()) return

      try {
        fileHash.value = await calculateFileHash(file)
        alertStore.showAlert(
          t('send.messages.fileAddedFromClipboard', { filename: file.name }),
          'success'
        )
      } catch (err) {
        alertStore.showAlert(t('send.messages.fileProcessingFailed'), 'error')
        console.error('File hash calculation failed:', err)
      }
      return
    }

    const textItem = items[0]
    if (!textItem) return

    sendType.value = 'text'
    textItem.getAsString((str: string) => {
      const trimmedStr = str.trim()
      if (!trimmedStr) return

      const textareaElement = document.getElementById('text-content') as HTMLTextAreaElement
      if (!textareaElement) {
        textContent.value += trimmedStr
        return
      }

      const insertion = insertTextAtSelection({
        text: textContent.value,
        insertText: trimmedStr,
        selectionStart: textareaElement.selectionStart,
        selectionEnd: textareaElement.selectionEnd
      })
      textContent.value = insertion.value

      setTimeout(() => {
        textareaElement.setSelectionRange(insertion.cursor, insertion.cursor)
        textareaElement.focus()
      }, 0)
    })
  }

  const getUnit = (value: string = expirationMethod.value) => {
    switch (value) {
      case 'day':
        return t('send.expiration.units.days')
      case 'hour':
        return t('send.expiration.units.hours')
      case 'minute':
        return t('send.expiration.units.minutes')
      case 'count':
        return t('send.expiration.units.times')
      case 'forever':
        return t('send.expiration.units.forever')
      default:
        return ''
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
      if (sendType.value === 'file' && !selectedFile.value && selectedFiles.value.length === 0) {
        alertStore.showAlert(t('send.messages.selectFile'), 'error')
        return
      }
      if (sendType.value === 'text' && !textContent.value.trim()) {
        alertStore.showAlert(t('send.messages.enterText'), 'error')
        return
      }
      if (!checkOpenUpload()) {
        return
      }
      if (expirationMethod.value !== 'forever' && !expirationValue.value) {
        alertStore.showAlert(t('send.messages.enterExpirationValue'), 'error')
        return
      }

      if (!checkExpirationTime(expirationMethod.value, expirationValue.value)) {
        const maxDays = Math.floor(config.value.max_save_seconds / 86400)
        alertStore.showAlert(t('send.messages.expirationTooLong', { days: maxDays }), 'error')
        return
      }

      const expireValue = expirationValue.value ? parseInt(expirationValue.value) : 1
      let response
      if (sendType.value === 'file') {
        response = await submitFile({
          selectedFile: selectedFile.value,
          selectedFiles: selectedFiles.value,
          expireValue,
          expireStyle: expirationMethod.value,
          enableChunk: Boolean(config.value.enableChunk),
          validateFileSize: checkFileSize
        })
      } else {
        response = await submitText({
          text: textContent.value,
          expireValue,
          expireStyle: expirationMethod.value
        })
      }

      if (!response) return

      if (response?.code === 200) {
        const newRecord = buildSentRecord({
          response,
          sendType: sendType.value,
          textContent: textContent.value,
          selectedFile: selectedFile.value,
          selectedFiles: selectedFiles.value,
          expirationMethod: expirationMethod.value,
          expirationValue: expirationValue.value,
          translate: t,
          getUnit
        })
        fileDataStore.addShareDataRecord(newRecord)
        alertStore.showAlert(
          t('send.messages.sendSuccess', { code: newRecord.retrieveCode }),
          'success'
        )
        selectedFile.value = null
        selectedFiles.value = []
        textContent.value = ''
        resetUploadProgress()
        resetPresignUpload()
        selectedRecord.value = newRecord
        await sentRecordActions.copyLink(newRecord)
      } else {
        throw new Error(t('send.messages.serverError'))
      }
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('send.messages.sendFailed')), 'error')
    } finally {
      resetUploadProgress()
      isSubmitting.value = false
    }
  }

  const toggleDrawer = () => {
    showDrawer.value = !showDrawer.value
  }

  const viewDetails = (record: SentFileRecord) => {
    selectedRecord.value = record
  }

  const closeDetails = () => {
    selectedRecord.value = null
  }

  const deleteRecord = (id: number) => {
    const index = fileDataStore.shareData.findIndex((record) => record.id === id)
    if (index !== -1) {
      fileDataStore.deleteShareData(index)
    }
  }

  return {
    config,
    sendType,
    selectedFile,
    selectedFiles,
    textContent,
    expirationMethod,
    expirationValue,
    uploadProgress,
    uploadedBytes,
    totalBytes,
    uploadSpeed,
    acceptedTypes,
    showDrawer,
    selectedRecord,
    isSubmitting,
    sendRecords,
    uploadDescription,
    expirationOptions,
    closeDetails,
    deleteRecord,
    copySentRecordCode: sentRecordActions.copyCode,
    copySentRecordLink: sentRecordActions.copyLink,
    copySentRecordWgetCommand: sentRecordActions.copyWgetCommand,
    getQRCodeValue: sentRecordActions.getQRCodeValue,
    getUnit,
    handleFileDrop,
    handleFileSelected,
    handleFilesSelected,
    handlePaste,
    handleSubmit,
    toggleDrawer,
    viewDetails
  }
}
