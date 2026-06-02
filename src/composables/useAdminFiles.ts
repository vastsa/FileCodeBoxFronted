import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type {
  AdminFileListParams,
  AdminFileStatusFilter,
  AdminFileSummary,
  AdminFileTypeFilter,
  AdminFileViewItem,
  FileEditForm,
  FileListItem
} from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { formatFileSize, formatTimestamp, getErrorMessage } from '@/utils/common'

const emptySummary = (): AdminFileSummary => ({
  totalFiles: 0,
  activeCount: 0,
  expiredCount: 0,
  textCount: 0,
  fileCount: 0,
  chunkedCount: 0,
  storageUsed: 0,
  usedCount: 0
})

const normalizeCount = (value: number | string | null | undefined) => Number(value || 0)

const isExpiredByDate = (value: string | null | undefined) => {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) && timestamp < Date.now()
}

export function useAdminFiles() {
  const { t } = useI18n()
  const alertStore = useAlertStore()

  const tableData = ref<AdminFileViewItem[]>([])
  const hasLoadError = ref(false)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const summary = ref<AdminFileSummary>(emptySummary())
  const params = ref<AdminFileListParams & { total: number }>({
    page: 1,
    size: 10,
    total: 0,
    keyword: '',
    status: 'all',
    type: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
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
  const totalPages = computed(() => Math.max(Math.ceil(params.value.total / params.value.size), 1))
  const storageUsedText = computed(() => formatFileSize(summary.value.storageUsed))

  const requestParams = computed<AdminFileListParams>(() => ({
    page: params.value.page,
    size: params.value.size,
    keyword: params.value.keyword,
    status: params.value.status === 'all' ? undefined : params.value.status,
    type: params.value.type === 'all' ? undefined : params.value.type,
    sortBy: params.value.sortBy,
    sortOrder: params.value.sortOrder
  }))

  const hasActiveFilters = computed(
    () =>
      Boolean(params.value.keyword?.trim()) ||
      params.value.status !== 'all' ||
      params.value.type !== 'all'
  )

  const inferIsText = (file: FileListItem) => {
    if (typeof file.isText === 'boolean') return file.isText
    if (typeof file.is_text === 'boolean') return file.is_text
    if (file.type) return file.type === 'text'
    return Boolean(file.text)
  }

  const inferIsExpired = (file: FileListItem) => {
    if (typeof file.isExpired === 'boolean') return file.isExpired
    if (typeof file.is_expired === 'boolean') return file.is_expired
    if (
      file.expired_count !== null &&
      file.expired_count !== undefined &&
      file.expired_count <= 0
    ) {
      return true
    }
    return isExpiredByDate(file.expired_at)
  }

  const inferIsChunked = (file: FileListItem) => Boolean(file.isChunked ?? file.is_chunked)

  const getRemainingDownloads = (file: FileListItem) => {
    if (file.remainingDownloads !== undefined) return file.remainingDownloads
    if (file.remaining_downloads !== undefined) return file.remaining_downloads
    if (
      file.expired_count !== null &&
      file.expired_count !== undefined &&
      file.expired_count >= 0
    ) {
      return Math.max(file.expired_count, 0)
    }
    return null
  }

  const buildFallbackSummary = (files: AdminFileViewItem[], total: number): AdminFileSummary => ({
    totalFiles: total,
    activeCount: files.filter((file) => !file.isExpiredFile).length,
    expiredCount: files.filter((file) => file.isExpiredFile).length,
    textCount: files.filter((file) => file.isTextFile).length,
    fileCount: files.filter((file) => !file.isTextFile).length,
    chunkedCount: files.filter((file) => file.isChunkedFile).length,
    storageUsed: files.reduce((totalSize, file) => totalSize + normalizeCount(file.size), 0),
    usedCount: files.reduce(
      (totalUsed, file) => totalUsed + normalizeCount(file.usedCount ?? file.used_count),
      0
    )
  })

  const createFileViewItem = (file: FileListItem): AdminFileViewItem => {
    const isTextFile = inferIsText(file)
    const isExpiredFile = inferIsExpired(file)
    const isChunkedFile = inferIsChunked(file)
    const remainingDownloadsValue = getRemainingDownloads(file)
    const usedCount = normalizeCount(file.usedCount ?? file.used_count)

    return {
      ...file,
      displayName: file.name || `${file.prefix}${file.suffix}` || file.code,
      displaySize: formatFileSize(file.size),
      displayExpiredAt: file.expired_at
        ? formatTimestamp(file.expired_at)
        : t('send.expiration.units.forever'),
      displayUsage: `${usedCount} ${t('common.times')}`,
      isTextFile,
      isExpiredFile,
      isChunkedFile,
      remainingDownloadsValue,
      canPreviewText: Boolean(file.text)
    }
  }

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
    isLoading.value = true
    try {
      hasLoadError.value = false
      const res = await FileService.getAdminFileList(requestParams.value)
      if (!res.detail) return

      tableData.value = res.detail.data.map(createFileViewItem)
      params.value.total = res.detail.total
      summary.value = res.detail.summary || buildFallbackSummary(tableData.value, res.detail.total)
    } catch (error) {
      hasLoadError.value = true
      alertStore.showAlert(
        getErrorMessage(error, t('manage.fileManage.loadFileListFailed')),
        'error'
      )
    } finally {
      isLoading.value = false
    }
  }

  const handleSearch = async () => {
    params.value.page = 1
    await loadFiles()
  }

  const refreshFiles = async () => {
    await loadFiles()
  }

  const resetFilters = async () => {
    params.value.page = 1
    params.value.keyword = ''
    params.value.status = 'all'
    params.value.type = 'all'
    params.value.sortBy = 'created_at'
    params.value.sortOrder = 'desc'
    await loadFiles()
  }

  const setStatusFilter = async (status: AdminFileStatusFilter) => {
    params.value.status = status
    params.value.page = 1
    await loadFiles()
  }

  const setTypeFilter = async (type: AdminFileTypeFilter) => {
    params.value.type = type
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
    if (isSaving.value) return

    isSaving.value = true
    try {
      await FileService.updateFile(editForm.value)
      await loadFiles()
      closeEditModal()
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('manage.fileManage.updateFailed')), 'error')
    } finally {
      isSaving.value = false
    }
  }

  const deleteFile = async (id: number) => {
    if (!window.confirm(t('manage.fileManage.deleteConfirm'))) {
      return
    }

    try {
      await FileService.deleteAdminFile(id)
      if (tableData.value.length === 1 && params.value.page > 1) {
        params.value.page -= 1
      }
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
    hasActiveFilters,
    isLoading,
    isSaving,
    params,
    storageUsedText,
    summary,
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
    openTextPreview,
    refreshFiles,
    resetFilters,
    setStatusFilter,
    setTypeFilter
  }
}
