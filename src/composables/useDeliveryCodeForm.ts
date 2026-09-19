import { computed, reactive, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import { DELIVERY_STORAGE_OPTIONS } from '@/components/delivery/storage-options'
import { useAlertStore } from '@/stores/alertStore'
import type { DeliveryCode, UpdateDeliveryCode } from '@/types/delivery'
import { copyToClipboard } from '@/utils/clipboard'
import { buildDeliveryUrl } from '@/utils/share-url'

/** 创建、编辑及分享结果独立维护，关闭弹窗时清除可复制凭证。 */
export function useDeliveryCodeForm(
  page: Ref<number>,
  refresh: () => Promise<void>,
  report: (error: unknown) => void
) {
  const { t } = useI18n(),
    alerts = useAlertStore()
  const creating = ref(false)
  const showCreate = ref(false),
    createdCode = ref(''),
    copyMessage = ref(''),
    showCreated = ref(false)
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
      !DELIVERY_STORAGE_OPTIONS.includes(form.storage_type as typeof DELIVERY_STORAGE_OPTIONS[number])
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

  async function copy(input: HTMLInputElement | null) {
    const ok = await copyToClipboard(createdCode.value, { showMsg: false })
    if (!ok) {
      input?.focus()
      input?.select()
    }
    copyMessage.value = t(ok ? 'delivery.copied' : 'delivery.manualCopy')
  }

  function closeCreated() {
    showCreated.value = false
    createdCode.value = ''
    createdItem.value = null
    copyMessage.value = ''
  }

  function openEdit(item: DeliveryCode) {
    editing.value = item
    customStorage.value = item.storage_type !== 'system'
    const expiry = new Date(item.expires_at)
    expiry.setMinutes(expiry.getMinutes() - expiry.getTimezoneOffset())
    Object.assign(form, {
      name: item.name,
      code: '',
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

  return {
    customStorage,
    editing,
    createdItem,
    createdLink,
    minimumUploads,
    openEdit,
    copyLink,
    creating,
    showCreate,
    createdCode,
    copyMessage,
    showCreated,
    form,
    openCreate,
    create,
    copy,
    closeCreated
  }
}
