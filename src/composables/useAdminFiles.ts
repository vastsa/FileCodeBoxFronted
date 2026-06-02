import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type {
  AdminBatchEditForm,
  AdminBatchDeleteFilesResponse,
  AdminBatchUpdateFilesRequest,
  AdminBatchUpdateFilesResponse,
  AdminFileDetailResponse,
  AdminFileDetailTimelineItem,
  AdminFileDetailViewItem,
  AdminFileInsightSeverity,
  AdminFilePatchPayload,
  AdminFileListParams,
  AdminFilePolicyAction,
  AdminFilePolicyActionRequest,
  AdminFileStatusFilter,
  AdminFileSummary,
  AdminFileTypeFilter,
  AdminFileViewItem,
  ApiResponse,
  FileEditForm,
  FileListItem
} from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { formatDuration, formatFileSize, formatTimestamp, getErrorMessage } from '@/utils/common'
import {
  downloadAdminManagedFile,
  exportAdminTextFile,
  getSafeFilename
} from '@/utils/download-action'
import { buildRetrieveUrl } from '@/utils/share-url'

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

type ErrorWithResponse = {
  response?: {
    status?: number
  }
}

const isLegacyEndpointUnavailable = (error: unknown) => {
  const status = (error as ErrorWithResponse)?.response?.status
  return status === 404 || status === 405
}

const legacyForeverExpiresAt = '2099-12-31T23:59'
const detailPolicyDownloadLimit = 5
const dayInMilliseconds = 24 * 60 * 60 * 1000

type DetailPolicyActionOption = {
  action: AdminFilePolicyAction
  label: string
  description: string
}

const emptyBatchEditForm = (): AdminBatchEditForm => ({
  mode: 'expiresAt',
  expired_at: '',
  expired_count: null
})

const padDatePart = (value: number) => String(value).padStart(2, '0')

const formatLocalDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
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
  const showBatchEditModal = ref(false)
  const batchEditForm = ref<AdminBatchEditForm>(emptyBatchEditForm())

  const showTextPreview = ref(false)
  const previewText = ref('')
  const previewFile = ref<AdminFileViewItem | null>(null)
  const previewMetaText = ref('')
  const isPreviewLoading = ref(false)
  const showFileDetailModal = ref(false)
  const selectedFileDetail = ref<AdminFileDetailViewItem | null>(null)
  const isDetailLoading = ref(false)
  const isDetailPolicyActionRunning = ref(false)
  const downloadingFileId = ref<number | null>(null)
  const selectedFileIds = ref<Set<number>>(new Set())
  const isBatchDeleting = ref(false)
  const isBatchUpdating = ref(false)
  let detailRequestSerial = 0
  const isBatchActionRunning = computed(() => isBatchDeleting.value || isBatchUpdating.value)
  const totalPages = computed(() => Math.max(Math.ceil(params.value.total / params.value.size), 1))
  const storageUsedText = computed(() => formatFileSize(summary.value.storageUsed))
  const currentPageSelectedCount = computed(
    () => tableData.value.filter((file) => selectedFileIds.value.has(file.id)).length
  )
  const selectedCount = computed(() => selectedFileIds.value.size)
  const hasSelectedFiles = computed(() => selectedCount.value > 0)
  const isAllCurrentPageSelected = computed(
    () => tableData.value.length > 0 && currentPageSelectedCount.value === tableData.value.length
  )
  const isCurrentPagePartiallySelected = computed(
    () => currentPageSelectedCount.value > 0 && !isAllCurrentPageSelected.value
  )

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

  const detailPolicyActionOptions = computed<DetailPolicyActionOption[]>(() => [
    {
      action: 'extend_24h',
      label: t('fileManage.policyActions.extend24h'),
      description: t('fileManage.policyActionDescriptions.extend24h')
    },
    {
      action: 'extend_7d',
      label: t('fileManage.policyActions.extend7d'),
      description: t('fileManage.policyActionDescriptions.extend7d')
    },
    {
      action: 'make_permanent',
      label: t('fileManage.policyActions.makePermanent'),
      description: t('fileManage.policyActionDescriptions.makePermanent')
    },
    {
      action: 'reset_download_limit',
      label: t('fileManage.policyActions.resetDownloadLimit', {
        count: detailPolicyDownloadLimit
      }),
      description: t('fileManage.policyActionDescriptions.resetDownloadLimit', {
        count: detailPolicyDownloadLimit
      })
    }
  ])

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
      file.expired_count === 0
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
      canPreviewText: isTextFile
    }
  }

  const normalizeInsightSeverity = (
    severity: AdminFileInsightSeverity | undefined
  ): AdminFileInsightSeverity => {
    if (severity === 'success' || severity === 'warning' || severity === 'danger') {
      return severity
    }
    if (severity === 'info' || severity === 'neutral') {
      return severity
    }
    return 'neutral'
  }

  const formatTimelineValue = (item: AdminFileDetailTimelineItem) => {
    if (item.key === 'download_limit') {
      if (item.status === 'unlimited') return t('fileManage.unlimited')
      if (typeof item.value === 'number') return t('fileManage.remaining', { count: item.value })
    }

    if (item.key === 'retrieved' && typeof item.value === 'number') {
      return `${item.value} ${t('common.times')}`
    }

    if (item.key === 'expiration_policy') {
      if (item.status === 'unlimited') return t('send.expiration.units.forever')
      if (typeof item.value === 'number') {
        const duration = formatDuration(Math.abs(item.value), (key) => t(key))
        return item.value <= 0
          ? t('fileManage.timeline.expiration_policy.overdue', { time: duration })
          : t('fileManage.timeline.expiration_policy.remaining', { time: duration })
      }
    }

    if (item.detail) return item.detail
    if (item.value !== null && item.value !== undefined) return String(item.value)
    return ''
  }

  const createTimelineViewItems = (items: AdminFileDetailTimelineItem[] = []) =>
    items.map((item) => {
      const timestampText = item.timestamp ? formatTimestamp(item.timestamp) : ''
      const valueText = formatTimelineValue(item)
      const metaParts = [timestampText, valueText].filter(Boolean)
      return {
        ...item,
        severity: normalizeInsightSeverity(item.severity),
        displayTitle: t(`fileManage.timeline.${item.key}.title`),
        displayDescription: t(`fileManage.timeline.${item.key}.description`, {
          status: t(`fileManage.timeline.status.${item.status || 'pending'}`),
          detail: item.detail || '',
          value: valueText || ''
        }),
        displayMeta: metaParts.length > 0 ? metaParts.join(' · ') : '-'
      }
    })

  const createFileDetailViewItem = (
    file: FileListItem | AdminFileDetailResponse
  ): AdminFileDetailViewItem => {
    const detail = file as AdminFileDetailResponse
    const policy = detail.policy
    const storage = detail.storage
    const expiredAt = policy?.expiredAt ?? policy?.expired_at ?? file.expired_at ?? null
    const expiredCount = policy?.expiredCount ?? policy?.expired_count ?? file.expired_count ?? null
    const displayName =
      detail.displayName ??
      detail.display_name ??
      detail.filename ??
      file.name ??
      `${file.prefix}${file.suffix}` ??
      file.code
    const normalizedFile: FileListItem = {
      ...file,
      name: displayName,
      expired_at: expiredAt,
      expired_count: expiredCount
    }
    const viewItem = createFileViewItem(normalizedFile)
    const remainingDownloadsValue =
      policy?.remainingDownloads ?? policy?.remaining_downloads ?? viewItem.remainingDownloadsValue
    const canPreviewText =
      detail.canPreviewText ?? detail.can_preview_text ?? viewItem.canPreviewText
    const canDownloadFile = detail.canDownload ?? detail.can_download ?? !viewItem.isExpiredFile
    const textLengthValue = normalizeCount(
      detail.textLength ?? detail.text_length ?? detail.text?.length
    )
    const isPermanentFile =
      detail.isPermanent ??
      detail.is_permanent ??
      policy?.isPermanent ??
      policy?.is_permanent ??
      (!expiredAt && (expiredCount === null || expiredCount === undefined || expiredCount < 0))
    const hasDownloadLimitFile =
      detail.hasDownloadLimit ??
      detail.has_download_limit ??
      (expiredCount !== null && expiredCount !== undefined && expiredCount >= 0)
    const hasExpirationTimeFile =
      detail.hasExpirationTime ?? detail.has_expiration_time ?? Boolean(expiredAt)
    const storageBackendValue =
      storage?.backend ?? detail.storageBackend ?? detail.storage_backend ?? '-'
    const isChunkedStorage = storage?.isChunked ?? storage?.is_chunked ?? viewItem.isChunkedFile
    const statusInsights = detail.statusInsights ?? detail.status_insights
    const statusInsightState =
      statusInsights?.state ??
      (viewItem.isExpiredFile ? 'expired' : isPermanentFile ? 'permanent' : 'available')
    const statusInsightNextAction =
      statusInsights?.nextAction ?? statusInsights?.next_action ?? 'monitor'

    return {
      ...viewItem,
      displayName,
      displayExpiredAt: expiredAt ? formatTimestamp(expiredAt) : t('send.expiration.units.forever'),
      displayCreatedAt: file.created_at ? formatTimestamp(file.created_at) : '-',
      displayRetrieveUrl: buildRetrieveUrl(file.code),
      remainingDownloadsValue,
      canPreviewText,
      textLengthValue,
      canDownloadFile,
      isPermanentFile,
      hasDownloadLimitFile,
      hasExpirationTimeFile,
      isChunkedStorage: Boolean(isChunkedStorage),
      storageBackendValue,
      fileHashValue: storage?.fileHash ?? storage?.file_hash ?? detail.fileHash ?? detail.file_hash,
      filePathValue: storage?.filePath ?? storage?.file_path ?? detail.filePath ?? detail.file_path,
      uuidFileNameValue:
        storage?.uuidFileName ??
        storage?.uuid_file_name ??
        detail.uuidFileName ??
        detail.uuid_file_name,
      uploadIdValue: storage?.uploadId ?? storage?.upload_id ?? detail.uploadId ?? detail.upload_id,
      statusInsightSeverity: normalizeInsightSeverity(statusInsights?.severity),
      statusInsightState,
      statusInsightNextAction,
      statusInsightReasons: statusInsights?.reasons || [],
      statusInsightMetrics: statusInsights?.metrics,
      detailTimeline: createTimelineViewItems(detail.timeline || [])
    }
  }

  const syncSelectedFilesWithCurrentPage = () => {
    const visibleIds = new Set(tableData.value.map((file) => file.id))
    selectedFileIds.value = new Set(
      Array.from(selectedFileIds.value).filter((id) => visibleIds.has(id))
    )
  }

  const clearSelection = () => {
    selectedFileIds.value = new Set()
  }

  const toggleFileSelection = (id: number) => {
    const nextSelectedIds = new Set(selectedFileIds.value)
    if (nextSelectedIds.has(id)) {
      nextSelectedIds.delete(id)
    } else {
      nextSelectedIds.add(id)
    }
    selectedFileIds.value = nextSelectedIds
  }

  const toggleCurrentPageSelection = () => {
    if (isAllCurrentPageSelected.value) {
      clearSelection()
      return
    }

    selectedFileIds.value = new Set(tableData.value.map((file) => file.id))
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

  const resetBatchEditForm = () => {
    batchEditForm.value = emptyBatchEditForm()
  }

  const openBatchEditModal = () => {
    if (!hasSelectedFiles.value || isBatchActionRunning.value) return

    resetBatchEditForm()
    showBatchEditModal.value = true
  }

  const closeBatchEditModal = (force = false) => {
    if (isBatchUpdating.value && !force) return

    showBatchEditModal.value = false
    resetBatchEditForm()
  }

  const buildBatchUpdatePayload = (ids: number[]): AdminBatchUpdateFilesRequest | null => {
    const form = batchEditForm.value

    if (form.mode === 'expiresAt') {
      if (!form.expired_at) return null
      return {
        ids,
        expired_at: form.expired_at
      }
    }

    if (form.mode === 'downloadLimit') {
      if (form.expired_count === null || !Number.isFinite(form.expired_count)) return null
      return {
        ids,
        expired_count: form.expired_count
      }
    }

    return {
      ids,
      clearExpiredAt: true,
      clear_expired_at: true
    }
  }

  const buildLegacyBatchPatchPayload = (
    id: number,
    payload: AdminBatchUpdateFilesRequest
  ): AdminFilePatchPayload => {
    if (payload.clearExpiredAt || payload.clear_expired_at) {
      return {
        id,
        expired_at: legacyForeverExpiresAt,
        expired_count: -1
      }
    }

    const patchPayload: AdminFilePatchPayload = { id }
    if (payload.expired_at !== undefined) {
      patchPayload.expired_at = payload.expired_at
    }
    if (payload.expired_count !== undefined) {
      patchPayload.expired_count = payload.expired_count
    }
    return patchPayload
  }

  const buildPolicyActionRequest = (
    file: AdminFileDetailViewItem,
    action: AdminFilePolicyAction
  ): AdminFilePolicyActionRequest => {
    const request: AdminFilePolicyActionRequest = {
      id: file.id,
      action
    }

    if (action === 'reset_download_limit') {
      request.downloadLimit = detailPolicyDownloadLimit
      request.download_limit = detailPolicyDownloadLimit
    }

    return request
  }

  const getPolicyActionBaseDate = (file: AdminFileDetailViewItem) => {
    const now = new Date()
    const expiredAt = file.expired_at ? new Date(file.expired_at) : null
    if (!expiredAt || Number.isNaN(expiredAt.getTime()) || expiredAt.getTime() < now.getTime()) {
      return now
    }
    return expiredAt
  }

  const buildLegacyPolicyActionPayload = (
    file: AdminFileDetailViewItem,
    action: AdminFilePolicyAction
  ): AdminFilePatchPayload => {
    if (action === 'make_permanent') {
      return {
        id: file.id,
        expired_at: legacyForeverExpiresAt,
        expired_count: -1
      }
    }

    if (action === 'reset_download_limit') {
      return {
        id: file.id,
        expired_count: detailPolicyDownloadLimit
      }
    }

    const offsetDays = action === 'extend_7d' ? 7 : 1
    const nextExpiredAt = new Date(
      getPolicyActionBaseDate(file).getTime() + offsetDays * dayInMilliseconds
    )
    return {
      id: file.id,
      expired_at: formatLocalDateTime(nextExpiredAt)
    }
  }

  const refreshSelectedFileDetail = async (fileId: number, detail?: AdminFileDetailResponse) => {
    if (detail) {
      selectedFileDetail.value = createFileDetailViewItem(detail)
      return
    }

    const fallbackFile = tableData.value.find((file) => file.id === fileId)
    if (fallbackFile) {
      selectedFileDetail.value = createFileDetailViewItem(fallbackFile)
    }

    try {
      const response = await FileService.getAdminFileDetail(fileId)
      if (response.detail) {
        selectedFileDetail.value = createFileDetailViewItem(response.detail)
      }
    } catch (error: unknown) {
      if (!isLegacyEndpointUnavailable(error)) {
        throw error
      }
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
      syncSelectedFilesWithCurrentPage()
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
    clearSelection()
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
      selectedFileIds.value.delete(id)
      selectedFileIds.value = new Set(selectedFileIds.value)
      await loadFiles()
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('manage.fileManage.deleteFailed')), 'error')
    }
  }

  const deleteAdminFilesWithFallback = async (
    ids: number[]
  ): Promise<ApiResponse<AdminBatchDeleteFilesResponse>> => {
    try {
      return await FileService.deleteAdminFiles(ids)
    } catch (error: unknown) {
      if (!isLegacyEndpointUnavailable(error)) {
        throw error
      }

      await Promise.all(ids.map((id) => FileService.deleteAdminFile(id)))
      return {
        code: 200,
        detail: {
          deletedCount: ids.length,
          deleted_count: ids.length,
          deleted: ids,
          missing: [],
          failed: []
        }
      }
    }
  }

  const updateAdminFilesWithFallback = async (
    ids: number[],
    payload: AdminBatchUpdateFilesRequest
  ): Promise<ApiResponse<AdminBatchUpdateFilesResponse>> => {
    try {
      return await FileService.updateAdminFiles(payload)
    } catch (error: unknown) {
      if (!isLegacyEndpointUnavailable(error)) {
        throw error
      }

      await Promise.all(
        ids.map((id) => FileService.updateFile(buildLegacyBatchPatchPayload(id, payload)))
      )

      return {
        code: 200,
        detail: {
          updatedCount: ids.length,
          updated_count: ids.length,
          updated: ids,
          missing: [],
          failed: []
        }
      }
    }
  }

  const deleteSelectedFiles = async () => {
    if (!hasSelectedFiles.value || isBatchActionRunning.value) return

    const ids = Array.from(selectedFileIds.value)
    if (!window.confirm(t('fileManage.batchDeleteConfirm', { count: ids.length }))) {
      return
    }

    isBatchDeleting.value = true
    try {
      const response = await deleteAdminFilesWithFallback(ids)
      const detail = response.detail
      const deletedCount = detail?.deletedCount ?? detail?.deleted_count ?? ids.length
      const failedCount = detail?.failedCount ?? detail?.failed_count ?? 0

      if (tableData.value.length <= deletedCount && params.value.page > 1) {
        params.value.page -= 1
      }

      clearSelection()
      await loadFiles()
      alertStore.showAlert(
        t(
          failedCount > 0
            ? 'fileManage.batchDeletePartialSuccess'
            : 'fileManage.batchDeleteSuccess',
          {
            count: deletedCount,
            failed: failedCount
          }
        ),
        failedCount > 0 ? 'warning' : 'success'
      )
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('fileManage.batchDeleteFailed')), 'error')
    } finally {
      isBatchDeleting.value = false
    }
  }

  const handleBatchUpdate = async () => {
    if (!hasSelectedFiles.value || isBatchActionRunning.value) return

    const ids = Array.from(selectedFileIds.value)
    const payload = buildBatchUpdatePayload(ids)
    if (!payload) {
      alertStore.showAlert(t('fileManage.batchUpdateNoFields'), 'warning')
      return
    }

    if (!window.confirm(t('fileManage.batchUpdateConfirm', { count: ids.length }))) {
      return
    }

    isBatchUpdating.value = true
    try {
      const response = await updateAdminFilesWithFallback(ids, payload)
      const detail = response.detail
      const updatedCount = detail?.updatedCount ?? detail?.updated_count ?? ids.length
      const failedCount = detail?.failedCount ?? detail?.failed_count ?? 0

      clearSelection()
      await loadFiles()
      closeBatchEditModal(true)
      alertStore.showAlert(
        t(
          failedCount > 0
            ? 'fileManage.batchUpdatePartialSuccess'
            : 'fileManage.batchUpdateSuccess',
          {
            count: updatedCount,
            failed: failedCount
          }
        ),
        failedCount > 0 ? 'warning' : 'success'
      )
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('fileManage.batchUpdateFailed')), 'error')
    } finally {
      isBatchUpdating.value = false
    }
  }

  const openTextPreview = async (file: AdminFileViewItem) => {
    if (!file.isTextFile || isPreviewLoading.value) return

    previewFile.value = file
    previewText.value = file.text || ''
    previewMetaText.value = ''
    showTextPreview.value = true
    isPreviewLoading.value = true

    try {
      const response = await FileService.previewAdminFile(file.id)
      if (!response.detail) {
        throw new Error(t('fileManage.previewFailed'))
      }

      previewText.value = response.detail.content
      previewMetaText.value = response.detail.truncated
        ? t('fileManage.previewTruncated', {
            shown: response.detail.previewLength ?? response.detail.preview_length ?? 0,
            total: response.detail.length
          })
        : t('fileManage.previewComplete', { count: response.detail.length })
    } catch (error: unknown) {
      if (file.text) {
        previewText.value = file.text
        previewMetaText.value = t('fileManage.previewFallback')
        return
      }

      closeTextPreview()
      alertStore.showAlert(getErrorMessage(error, t('fileManage.previewFailed')), 'error')
    } finally {
      isPreviewLoading.value = false
    }
  }

  const closeTextPreview = () => {
    showTextPreview.value = false
    previewText.value = ''
    previewFile.value = null
    previewMetaText.value = ''
  }

  const openFileDetail = async (file: AdminFileViewItem) => {
    const requestSerial = ++detailRequestSerial
    selectedFileDetail.value = createFileDetailViewItem(file)
    showFileDetailModal.value = true
    isDetailLoading.value = true

    try {
      const response = await FileService.getAdminFileDetail(file.id)
      if (response.detail && requestSerial === detailRequestSerial) {
        selectedFileDetail.value = createFileDetailViewItem(response.detail)
      }
    } catch (error: unknown) {
      if (isLegacyEndpointUnavailable(error)) return

      alertStore.showAlert(getErrorMessage(error, t('fileManage.detailFailed')), 'error')
    } finally {
      if (requestSerial === detailRequestSerial) {
        isDetailLoading.value = false
      }
    }
  }

  const applyDetailPolicyAction = async (action: AdminFilePolicyAction) => {
    const file = selectedFileDetail.value
    if (!file || isDetailPolicyActionRunning.value) return

    isDetailPolicyActionRunning.value = true
    try {
      let nextDetail: AdminFileDetailResponse | undefined

      try {
        const response = await FileService.applyAdminFilePolicyAction(
          buildPolicyActionRequest(file, action)
        )
        nextDetail = response.detail
      } catch (error: unknown) {
        if (!isLegacyEndpointUnavailable(error)) {
          throw error
        }
        await FileService.updateFile(buildLegacyPolicyActionPayload(file, action))
      }

      await loadFiles()
      await refreshSelectedFileDetail(file.id, nextDetail)
      alertStore.showAlert(t('fileManage.policyActionSuccess'), 'success')
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('fileManage.policyActionFailed')), 'error')
    } finally {
      isDetailPolicyActionRunning.value = false
    }
  }

  const closeFileDetail = () => {
    detailRequestSerial += 1
    showFileDetailModal.value = false
    selectedFileDetail.value = null
    isDetailLoading.value = false
  }

  const copyText = async () => {
    await copyToClipboard(previewText.value, {
      successMsg: t('fileManage.copySuccess'),
      errorMsg: t('fileManage.copyFailed'),
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  const copyDetailRetrieveCode = async () => {
    if (!selectedFileDetail.value) return

    await copyToClipboard(selectedFileDetail.value.code, {
      successMsg: t('fileManage.copyCodeSuccess'),
      errorMsg: t('fileManage.copyFailed'),
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  const copyDetailRetrieveLink = async () => {
    if (!selectedFileDetail.value) return

    await copyToClipboard(selectedFileDetail.value.displayRetrieveUrl, {
      successMsg: t('fileManage.copyLinkSuccess'),
      errorMsg: t('fileManage.copyFailed'),
      notify: (message, type) => alertStore.showAlert(message, type)
    })
  }

  const exportPreviewText = () => {
    if (!previewFile.value || !previewText.value) return
    exportAdminTextFile(previewFile.value, previewText.value)
  }

  const downloadFile = async (file: AdminFileViewItem) => {
    if (downloadingFileId.value) return

    downloadingFileId.value = file.id
    try {
      const response = await FileService.downloadAdminFile(file.id)
      await downloadAdminManagedFile(file, response)
      alertStore.showAlert(
        t(file.isTextFile ? 'fileManage.exportSuccess' : 'fileManage.downloadSuccess', {
          name: getSafeFilename(file.displayName || file.code)
        }),
        'success'
      )
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, t('fileManage.downloadFailed')), 'error')
    } finally {
      downloadingFileId.value = null
    }
  }

  return {
    tableData,
    hasLoadError,
    hasActiveFilters,
    isLoading,
    isAllCurrentPageSelected,
    isBatchActionRunning,
    isBatchDeleting,
    isBatchUpdating,
    isCurrentPagePartiallySelected,
    isDetailLoading,
    isDetailPolicyActionRunning,
    isPreviewLoading,
    isSaving,
    batchEditForm,
    detailPolicyActionOptions,
    downloadingFileId,
    hasSelectedFiles,
    params,
    previewFile,
    previewMetaText,
    selectedFileDetail,
    selectedCount,
    selectedFileIds,
    storageUsedText,
    summary,
    showBatchEditModal,
    showEditModal,
    showFileDetailModal,
    editForm,
    showTextPreview,
    previewText,
    totalPages,
    closeEditModal,
    closeBatchEditModal,
    closeFileDetail,
    closeTextPreview,
    copyDetailRetrieveCode,
    copyDetailRetrieveLink,
    copyText,
    clearSelection,
    deleteFile,
    deleteSelectedFiles,
    downloadFile,
    exportPreviewText,
    handlePageChange,
    handleSearch,
    applyDetailPolicyAction,
    handleBatchUpdate,
    handleUpdate,
    loadFiles,
    openBatchEditModal,
    openEditModal,
    openFileDetail,
    openTextPreview,
    refreshFiles,
    resetFilters,
    setStatusFilter,
    setTypeFilter,
    toggleCurrentPageSelection,
    toggleFileSelection
  }
}
