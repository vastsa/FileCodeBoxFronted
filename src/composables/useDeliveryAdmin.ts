import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { DeliveryCode, DeliveryCodeFilters } from '@/types/delivery'
import { getErrorMessage } from '@/utils/common'
import { useDeliveryCodeForm } from './useDeliveryCodeForm'
import { useDeliveryBatch } from './useDeliveryBatch'

/** 列表协调查询、表单和批量操作，成功收件复用普通文件管理。 */
export function useDeliveryAdmin() {
  const { t } = useI18n(),
    alerts = useAlertStore()
  const codes = ref<DeliveryCode[]>([]),
    page = ref(1),
    total = ref(0)
  const loading = ref(false),
    acting = ref(false)
  const selected = ref<DeliveryCode | null>(null)
  const pendingDelete = ref<{ kind: 'code' | 'batch'; id: number; name: string } | null>(null)
  let listSequence = 0
  const filters = reactive<DeliveryCodeFilters>({
    keyword: '',
    status: 'all',
    tag: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const hasActiveFilters = computed(
    () =>
      filters.keyword !== '' ||
      filters.status !== 'all' ||
      filters.tag !== '' ||
      filters.sort_by !== 'created_at' ||
      filters.sort_order !== 'desc'
  )
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

  const formState = useDeliveryCodeForm(page, refresh, report)
  const selection = useDeliveryBatch(codes, acting, refresh, report)
  const { selectedIds, clearSelection } = selection
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
      } else await DeliveryService.remove(item.id)
      pendingDelete.value = null
      await refresh()
    } catch (error) {
      report(error)
    } finally {
      acting.value = false
    }
  }

  async function copyListedCode(item: DeliveryCode) {
    try {
      const result = await DeliveryService.reveal(item.id)
      if (!result.code) {
        // 旧码没有可恢复的原文时直接引导重设，避免展示空二维码或无效寄件链接。
        formState.openEdit(item)
        alerts.showAlert(t('delivery.legacyCodeHint'), 'warning')
        return
      }
      // 原文只进入分享弹窗，列表数据始终保持无凭证状态。
      formState.createdCode.value = result.code
      formState.createdItem.value = item
      formState.copyMessage.value = ''
      formState.showCreated.value = true
    } catch (error) {
      report(error)
    }
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

  async function filterByTag(tag: string) {
    filters.tag = tag
    await search()
  }

  function viewFiles(item: DeliveryCode) {
    selected.value = item
  }
  function closeFiles() {
    selected.value = null
  }
  watch(page, () => {
    clearSelection()
    void refresh()
  })
  onBeforeUnmount(() => {
    listSequence++
    formState.closeCreated()
  })
  return {
    ...formState,
    ...selection,
    codes,
    page,
    total,
    loading,
    acting,
    selected,
    pendingDelete,
    filters,
    hasActiveFilters,
    refresh,
    toggle,
    confirmDelete,
    copyListedCode,
    search,
    resetFilters,
    filterByTag,
    viewFiles,
    closeFiles
  }
}
