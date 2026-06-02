import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { useFileDataStore } from '@/stores/fileData'
import type { ReceivedFileRecord } from '@/types'
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
  const inputStatus = ref<InputStatus>({
    readonly: false,
    loading: false
  })
  const error = ref('')
  const selectedRecord = ref<ReceivedFileRecord | null>(null)
  const showDrawer = ref(false)
  const showPreview = ref(false)
  const renderedContent = ref('')

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

  const createRecord = (detail: {
    code: string
    name: string
    text: string
    size: number
  }): ReceivedFileRecord => {
    const isFile = detail.text.startsWith('/share/download') || detail.name !== 'Text'
    return {
      id: Date.now(),
      code: detail.code,
      filename: detail.name,
      size: formatFileSize(detail.size),
      downloadUrl: isFile ? detail.text : null,
      content: isFile ? null : detail.text,
      date: new Date().toLocaleString()
    }
  }

  const handleSubmit = async () => {
    if (code.value.length !== 5) {
      alertStore.showAlert(t('retrieve.messages.invalidCode'), 'error')
      return
    }

    inputStatus.value.readonly = true
    inputStatus.value.loading = true

    try {
      const res = await FileService.selectFile(code.value)
      if (res.code === 200 && res.detail) {
        const newFileData = createRecord(res.detail)
        if (!fileStore.receiveData.some((file) => file.code === newFileData.code)) {
          fileStore.addReceiveData(newFileData)
        }
        selectedRecord.value = newFileData
        if (newFileData.content) {
          showPreview.value = true
        }
        alertStore.showAlert(t('retrieve.messages.retrieveSuccess'), 'success')
      } else {
        alertStore.showAlert(t('retrieve.messages.retrieveFailure') + res.detail, 'error')
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('retrieve.messages.unknownError'))
      alertStore.showAlert(t('retrieve.messages.networkError') + errorMessage, 'error')
    } finally {
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

  return {
    code,
    inputStatus,
    error,
    records,
    selectedRecord,
    showDrawer,
    showPreview,
    renderedContent,
    closeContentPreview,
    closeDetails,
    copyContent,
    deleteRecord,
    downloadRecord,
    handleSubmit,
    showContentPreview,
    toggleDrawer,
    viewDetails
  }
}
