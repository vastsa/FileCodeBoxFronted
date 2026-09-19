import { computed, reactive, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { DeliveryCode, DeliveryBatchRequest } from '@/types/delivery'

/** 批量动作与当前页选择绑定，使用后端原子接口提交。 */
export function useDeliveryBatch(
  codes: Ref<DeliveryCode[]>,
  acting: Ref<boolean>,
  refresh: () => Promise<void>,
  report: (error: unknown) => void
) {
  const { t } = useI18n(),
    alerts = useAlertStore()
  // 选择范围只限当前页；切页、刷新和筛选后均会清空，避免误操作其他页。
  const selectedIds = ref<Set<number>>(new Set())
  const showBatchEdit = ref(false)
  const batchForm = reactive({ expires_at: '', max_uploads: null as number | null })
  const selectedCount = computed(() => selectedIds.value.size)
  const hasSelection = computed(() => selectedCount.value > 0)
  const isAllCurrentPageSelected = computed(
    () => codes.value.length > 0 && codes.value.every((item) => selectedIds.value.has(item.id))
  )
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

  return {
    selectedIds,
    showBatchEdit,
    batchForm,
    selectedCount,
    hasSelection,
    isAllCurrentPageSelected,
    toggleSelection,
    toggleCurrentPageSelection,
    clearSelection,
    batch,
    openBatchEdit
  }
}
