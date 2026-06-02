import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { AdminFileViewItem, FileEditForm, FileListItem } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { formatFileSize, formatTimestamp, getErrorMessage } from '@/utils/common'

const TEXT_PREVIEW_THRESHOLD = 30

export function useAdminFiles() {
  const { t } = useI18n()
  const alertStore = useAlertStore()

  const tableData = ref<AdminFileViewItem[]>([])
  const hasLoadError = ref(false)
  const params = ref({
    page: 1,
    size: 10,
    total: 0,
    keyword: ''
  })

  const showEditModal = ref(false)
  const editForm = ref<FileEditForm>({
    id: null,
    code: '',
    prefix: '',
    suffix: '',
    expired_at: '',
    expired_count: null
  })

  const showTextPreview = ref(false)
  const previewText = ref('')
  const totalPages = computed(() => Math.ceil(params.value.total / params.value.size))

  const createFileViewItem = (file: FileListItem): AdminFileViewItem => ({
    ...file,
    displaySize: formatFileSize(file.size),
    displayExpiredAt: file.expired_at
      ? formatTimestamp(file.expired_at)
      : t('send.expiration.units.forever'),
    canPreviewText: Boolean(file.text && file.text.length > TEXT_PREVIEW_THRESHOLD)
  })

  const resetEditForm = () => {
    editForm.value = {
      id: null,
      code: '',
      prefix: '',
      suffix: '',
      expired_at: '',
      expired_count: null
    }
  }

  const loadFiles = async () => {
    try {
      hasLoadError.value = false
      const res = await FileService.getAdminFileList(params.value)
      if (!res.detail) return

      tableData.value = res.detail.data.map(createFileViewItem)
      params.value.total = res.detail.total
    } catch (error) {
      hasLoadError.value = true
      alertStore.showAlert(getErrorMessage(error, t('manage.fileManage.loadFileListFailed')), 'error')
    }
  }

  const handleSearch = async () => {
    params.value.page = 1
    await loadFiles()
  }

  const handlePageChange = async (page: number | string) => {
    if (typeof page === 'string') return
    if (page < 1 || page > totalPages.value) return

    params.value.page = page
    await loadFiles()
  }

  const openEditModal = (file: FileListItem) => {
    editForm.value = {
      id: file.id,
      code: file.code,
      prefix: file.prefix,
      suffix: file.suffix,
      expired_at: file.expired_at ? file.expired_at.slice(0, 16) : '',
      expired_count: file.expired_count
    }
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
    resetEditForm()
  }

  const handleUpdate = async () => {
    try {
      await FileService.updateFile(editForm.value)
      await loadFiles()
      closeEditModal()
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('manage.fileManage.updateFailed')), 'error')
    }
  }

  const deleteFile = async (id: number) => {
    if (!window.confirm(t('manage.fileManage.deleteConfirm'))) {
      return
    }

    try {
      await FileService.deleteAdminFile(id)
      await loadFiles()
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('manage.fileManage.deleteFailed')), 'error')
    }
  }

  const openTextPreview = (text: string) => {
    previewText.value = text
    showTextPreview.value = true
  }

  const closeTextPreview = () => {
    showTextPreview.value = false
    previewText.value = ''
  }

  const copyText = async () => {
    await copyToClipboard(previewText.value, {
      successMsg: t('fileManage.copySuccess'),
      errorMsg: t('fileManage.copyFailed'),
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  return {
    tableData,
    hasLoadError,
    params,
    showEditModal,
    editForm,
    showTextPreview,
    previewText,
    totalPages,
    closeEditModal,
    closeTextPreview,
    copyText,
    deleteFile,
    handlePageChange,
    handleSearch,
    handleUpdate,
    loadFiles,
    openEditModal,
    openTextPreview
  }
}
