import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import { STORAGE_METHOD_OPTIONS } from '@/constants'
import { useAlertStore } from '@/stores/alertStore'
import type {
  DeliveryBatchRequest,
  DeliveryCode,
  DeliveryCodeFilters,
  DeliveryFile,
  UpdateDeliveryCode
} from '@/types/delivery'
import { copyToClipboard } from '@/utils/clipboard'
import { savePrivateDeliveryFile } from '@/utils/download-action'
import { getErrorMessage } from '@/utils/common'
import { buildDeliveryUrl } from '@/utils/share-url'

/** 业务状态与请求留在组合函数中，页面只负责使用上游组件展示。 */
export function useDeliveryAdmin() {
  const { t } = useI18n(),
    alerts = useAlertStore()
  const codes = ref<DeliveryCode[]>([]),
    files = ref<DeliveryFile[]>([])
  const page = ref(1),
    total = ref(0),
    filePage = ref(1),
    fileTotal = ref(0)
  const loading = ref(false),
    filesLoading = ref(false),
    creating = ref(false),
    acting = ref(false)
  const showCreate = ref(false),
    createdCode = ref(''),
    copyMessage = ref(''),
    showCreated = ref(false)
  const selected = ref<DeliveryCode | null>(null),
    pendingDelete = ref<{ kind: 'code' | 'file' | 'batch'; id: number; name: string } | null>(null)
  // 选择范围只限当前页；切页、刷新和筛选后均会清空，避免误操作其他页。
  const selectedIds = ref<Set<number>>(new Set())
  const showBatchEdit = ref(false)
  const batchForm = reactive({ expires_at: '', max_uploads: null as number | null })
  // 创建与编辑共用表单，原始记录单独保存，防止输入直接污染列表。
  const editing = ref<DeliveryCode | null>(null)
  const createdItem = ref<DeliveryCode | null>(null)
  const createdLink = computed(() => (createdCode.value ? buildDeliveryUrl(createdCode.value) : ''))
  const minimumUploads = computed(() =>
    Math.max(1, (editing.value?.used_count ?? 0) + (editing.value?.reserved_count ?? 0))
  )
  // 默认隐藏单独存储配置，已有寄件码按原模式回填。
  const customStorage = ref(false)
  const form = reactive({
    name: '',
    code: '',
    storage_type: 'local',
    target_path: 'inbox',
    expires_at: '',
    max_uploads: 1,
    note: '',
    tagsText: ''
  })
  const filters = reactive<DeliveryCodeFilters>({
    keyword: '',
    status: 'all',
    storage_type: 'all',
    tag: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const selectedCount = computed(() => selectedIds.value.size)
  const hasSelection = computed(() => selectedCount.value > 0)
  const isAllCurrentPageSelected = computed(
    () => codes.value.length > 0 && codes.value.every((item) => selectedIds.value.has(item.id))
  )
  const hasActiveFilters = computed(
    () =>
      filters.keyword !== '' ||
      filters.status !== 'all' ||
      filters.storage_type !== 'all' ||
      filters.tag !== '' ||
      filters.sort_by !== 'created_at' ||
      filters.sort_order !== 'desc'
  )
  /** 标签输入与文件管理一致：逗号、换行分隔，去空白和重复。 */
  const parseTags = (value: string) => {
    const seen = new Set<string>()
    return value
      .split(/[，,\n]/)
      .map((tag) => tag.trim())
      .filter((tag) => {
        const normalized = tag.toLocaleLowerCase()
        if (!tag || seen.has(normalized)) return false
        seen.add(normalized)
        return true
      })
      .slice(0, 12)
  }
  let listSequence = 0,
    fileSequence = 0
  const report = (error: unknown) => {
    // Pydantic 校验返回数组时展示字段信息，避免只有笼统的 HTTP 422。
    const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
    alerts.showAlert(
      Array.isArray(detail)
        ? detail.map((item) => item.msg).join('；')
        : getErrorMessage(error, t('delivery.error')),
      'error'
    )
  }
  function openCreate() {
    editing.value = null
    customStorage.value = false
    const expiry = new Date(Date.now() + 7 * 86400000)
    expiry.setMinutes(expiry.getMinutes() - expiry.getTimezoneOffset())
    Object.assign(form, {
      name: '',
      code: '',
      storage_type: 'local',
      target_path: 'inbox',
      expires_at: expiry.toISOString().slice(0, 16),
      max_uploads: 1,
      note: '',
      tagsText: ''
    })
    showCreate.value = true
  }
  async function refresh() {
    const sequence = ++listSequence
    loading.value = true
    try {
      const result = await DeliveryService.list(page.value, filters)
      if (sequence !== listSequence) return
      codes.value = result.items
      total.value = result.total
      selectedIds.value = new Set()
      if (!result.items.length && page.value > 1) page.value--
    } catch (error) {
      if (sequence === listSequence) report(error)
    } finally {
      if (sequence === listSequence) loading.value = false
    }
  }
  async function loadFiles() {
    if (!selected.value) return
    const id = selected.value.id,
      sequence = ++fileSequence
    filesLoading.value = true
    try {
      const result = await DeliveryService.files(id, filePage.value, true)
      if (sequence !== fileSequence) return
      files.value = result.items
      fileTotal.value = result.total
      if (!result.items.length && filePage.value > 1) filePage.value--
    } catch (error) {
      if (sequence === fileSequence) report(error)
    } finally {
      if (sequence === fileSequence) filesLoading.value = false
    }
  }
  function viewFiles(code: DeliveryCode) {
    selected.value = code
    files.value = []
    fileTotal.value = 0
    if (filePage.value === 1) void loadFiles()
    else filePage.value = 1
  }
  function closeFiles() {
    selected.value = null
    fileSequence++
    filesLoading.value = false
  }
  async function create() {
    if (creating.value) return
    const date = new Date(form.expires_at)
    // datetime-local 精度到秒，比较时也忽略服务端时间的毫秒，避免未编辑却误传期限。
    const originalExpiry = editing.value ? new Date(editing.value.expires_at) : null
    if (originalExpiry)
      originalExpiry.setMinutes(originalExpiry.getMinutes() - originalExpiry.getTimezoneOffset())
    const expiryChanged =
      !editing.value || form.expires_at !== originalExpiry?.toISOString().slice(0, 19)
    if (!Number.isFinite(date.getTime()) || (expiryChanged && date.getTime() <= Date.now())) {
      alerts.showAlert(t('delivery.expiredInput'), 'error')
      return
    }
    const codeChanged = !editing.value || form.code.trim() !== (editing.value.code || '')
    if (codeChanged && form.code && !/^[A-Za-z0-9_-]{8,32}$/.test(form.code.trim())) {
      alerts.showAlert(t('delivery.invalidCode'), 'error')
      return
    }
    if (
      !Number.isInteger(form.max_uploads) ||
      form.max_uploads < minimumUploads.value ||
      form.max_uploads > 100000
    ) {
      alerts.showAlert(t('delivery.invalidLimit', { count: minimumUploads.value }), 'error')
      return
    }
    // 不把历史可读但不再提供配置的类型静默替换成其他存储。
    if (
      customStorage.value &&
      !STORAGE_METHOD_OPTIONS.some((option) => option.value === form.storage_type)
    ) {
      alerts.showAlert(t('delivery.unsupportedStorage'), 'error')
      return
    }
    if (form.note.length > 2000 || parseTags(form.tagsText).some((tag) => tag.length > 24)) {
      alerts.showAlert(t('delivery.invalidMetadata'), 'error')
      return
    }
    creating.value = true
    try {
      if (editing.value) {
        const payload: UpdateDeliveryCode = {
          name: form.name,
          storage_type: customStorage.value ? form.storage_type : 'system',
          target_path: customStorage.value ? form.target_path : '',
          max_uploads: form.max_uploads,
          note: form.note,
          tags: parseTags(form.tagsText)
        }
        // 未改日期不传给后端，过期记录也可以只维护备注；改动时才提交新时间。
        if (expiryChanged) payload.expires_at = date.toISOString()
        if (codeChanged && form.code.trim()) payload.code = form.code.trim()
        await DeliveryService.update(editing.value.id, payload)
        showCreate.value = false
        editing.value = null
        alerts.showAlert(t('delivery.updated'), 'success')
        await refresh()
        return
      }
      const result = await DeliveryService.create({
        name: form.name,
        storage_type: customStorage.value ? form.storage_type : 'system',
        target_path: customStorage.value ? form.target_path : '',
        code: form.code.trim(),
        expires_at: date.toISOString(),
        max_uploads: form.max_uploads,
        note: form.note,
        tags: parseTags(form.tagsText)
      })
      showCreate.value = false
      createdCode.value = result.code
      createdItem.value = result.item
      copyMessage.value = ''
      showCreated.value = true
      if (page.value === 1) await refresh()
      else page.value = 1
    } catch (error) {
      report(error)
    } finally {
      creating.value = false
    }
  }
  async function toggle(code: DeliveryCode) {
    if (acting.value) return
    acting.value = true
    try {
      await DeliveryService.toggle(code.id, !code.enabled)
      await refresh()
    } catch (error) {
      report(error)
    } finally {
      acting.value = false
    }
  }
  async function confirmDelete() {
    if (!pendingDelete.value || acting.value) return
    acting.value = true
    try {
      const item = pendingDelete.value
      if (item.kind === 'batch') {
        await DeliveryService.batch({ ids: Array.from(selectedIds.value), action: 'delete' })
        clearSelection()
      } else if (item.kind === 'code') await DeliveryService.remove(item.id)
      else await DeliveryService.removeFile(item.id)
      pendingDelete.value = null
      await refresh()
      if (selected.value) await loadFiles()
    } catch (error) {
      report(error)
    } finally {
      acting.value = false
    }
  }
  async function copy(input: HTMLInputElement | null) {
    const ok = await copyToClipboard(createdCode.value, { showMsg: false })
    if (!ok) {
      input?.focus()
      input?.select()
    }
    copyMessage.value = t(ok ? 'delivery.copied' : 'delivery.manualCopy')
  }
  async function copyListedCode(code: DeliveryCode, element: HTMLElement | null) {
    if (!code.code) return
    const ok = await copyToClipboard(code.code, { showMsg: false })
    if (!ok && element) {
      // HTTP 或剪贴板权限受限时选中展示文本，保留手动复制兜底。
      element.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    alerts.showAlert(t(ok ? 'delivery.copied' : 'delivery.manualCopy'), ok ? 'success' : 'info')
  }
  function closeCreated() {
    showCreated.value = false
    createdCode.value = ''
    createdItem.value = null
    copyMessage.value = ''
  }
  async function download(file: DeliveryFile) {
    if (acting.value) return
    acting.value = true
    try {
      const result = await DeliveryService.download(file.id)
      await savePrivateDeliveryFile(result.data, file.filename)
    } catch (error) {
      report(error)
    } finally {
      acting.value = false
    }
  }
  // datetime-local 显示本机时间；保存统一转换为携带时区的 ISO 时间。
  function openEdit(item: DeliveryCode) {
    editing.value = item
    customStorage.value = item.storage_type !== 'system'
    const expiry = new Date(item.expires_at)
    expiry.setMinutes(expiry.getMinutes() - expiry.getTimezoneOffset())
    Object.assign(form, {
      name: item.name,
      code: item.code || '',
      storage_type: item.storage_type === 'system' ? 'local' : item.storage_type,
      target_path: item.target_path || 'inbox',
      expires_at: expiry.toISOString().slice(0, 19),
      max_uploads: item.max_uploads,
      note: item.note || '',
      tagsText: (item.tags || []).join(', ')
    })
    showCreate.value = true
  }
  async function copyLink(input: HTMLInputElement | null) {
    const ok = await copyToClipboard(createdLink.value, { showMsg: false })
    if (!ok) {
      input?.focus()
      input?.select()
    }
    copyMessage.value = t(ok ? 'delivery.copied' : 'delivery.manualCopyLink')
  }
  function toggleSelection(id: number) {
    const next = new Set(selectedIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    selectedIds.value = next
  }
  function toggleCurrentPageSelection() {
    selectedIds.value = isAllCurrentPageSelected.value
      ? new Set()
      : new Set(codes.value.map((item) => item.id))
  }
  function clearSelection() {
    selectedIds.value = new Set()
  }
  async function search() {
    if (page.value !== 1) {
      page.value = 1
      return
    }
    await refresh()
  }
  async function resetFilters() {
    Object.assign(filters, {
      keyword: '',
      status: 'all',
      storage_type: 'all',
      tag: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    if (page.value !== 1) {
      page.value = 1
      return
    }
    await refresh()
  }
  /** 点击列表标签时复用筛选入口，避免模板拼接多条表达式。 */
  async function filterByTag(tag: string) {
    filters.tag = tag
    await search()
  }
  async function batch(action: 'enable' | 'disable' | 'delete' | 'update') {
    if (acting.value || !hasSelection.value) return
    const payload: DeliveryBatchRequest = { ids: Array.from(selectedIds.value), action }
    if (action === 'update') {
      if (!batchForm.expires_at && batchForm.max_uploads === null) {
        alerts.showAlert(t('delivery.batchNoFields'), 'warning')
        return
      }
      if (batchForm.expires_at) {
        const expiresAt = new Date(batchForm.expires_at)
        if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
          alerts.showAlert(t('delivery.expiredInput'), 'error')
          return
        }
        payload.expires_at = expiresAt.toISOString()
      }
      if (batchForm.max_uploads !== null) {
        if (
          !Number.isInteger(batchForm.max_uploads) ||
          batchForm.max_uploads < 1 ||
          batchForm.max_uploads > 100000
        ) {
          alerts.showAlert(t('delivery.invalidLimit', { count: 1 }), 'error')
          return
        }
        payload.max_uploads = batchForm.max_uploads
      }
    }
    acting.value = true
    try {
      await DeliveryService.batch(payload)
      clearSelection()
      showBatchEdit.value = false
      alerts.showAlert(t('delivery.batchSuccess'), 'success')
      await refresh()
    } catch (error) {
      report(error)
    } finally {
      acting.value = false
    }
  }
  function openBatchEdit() {
    if (hasSelection.value) {
      Object.assign(batchForm, { expires_at: '', max_uploads: null })
      showBatchEdit.value = true
    }
  }
  watch(page, () => {
    clearSelection()
    void refresh()
  })
  watch(filePage, loadFiles)
  onBeforeUnmount(() => {
    listSequence++
    fileSequence++
    createdCode.value = ''
  })
  return {
    customStorage,
    filters,
    hasActiveFilters,
    selectedIds,
    selectedCount,
    hasSelection,
    isAllCurrentPageSelected,
    showBatchEdit,
    batchForm,
    editing,
    createdItem,
    createdLink,
    minimumUploads,
    openEdit,
    copyLink,
    toggleSelection,
    toggleCurrentPageSelection,
    clearSelection,
    search,
    resetFilters,
    filterByTag,
    batch,
    openBatchEdit,
    codes,
    files,
    page,
    total,
    filePage,
    fileTotal,
    loading,
    filesLoading,
    creating,
    acting,
    showCreate,
    createdCode,
    copyMessage,
    showCreated,
    selected,
    pendingDelete,
    form,
    openCreate,
    refresh,
    loadFiles,
    viewFiles,
    closeFiles,
    create,
    toggle,
    confirmDelete,
    copy,
    copyListedCode,
    closeCreated,
    download
  }
}
