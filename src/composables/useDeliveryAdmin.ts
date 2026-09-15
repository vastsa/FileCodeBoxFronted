import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { DeliveryCode, DeliveryFile } from '@/types/delivery'
import { copyToClipboard } from '@/utils/clipboard'
import { savePrivateDeliveryFile } from '@/utils/download-action'
import { getErrorMessage } from '@/utils/common'

/** 业务状态与请求留在组合函数中，页面只负责使用上游组件展示。 */
export function useDeliveryAdmin() {
  const { t } = useI18n(),
    alerts = useAlertStore()
  const codes = ref<DeliveryCode[]>([]),
    files = ref<DeliveryFile[]>([])
  const page = ref(1),
    total = ref(0),
    filePage = ref(1),
    fileTotal = ref(0),
    includeDeleted = ref(false)
  const loading = ref(false),
    filesLoading = ref(false),
    creating = ref(false),
    acting = ref(false)
  const showCreate = ref(false),
    createdCode = ref(''),
    copyMessage = ref(''),
    showCreated = ref(false)
  const selected = ref<DeliveryCode | null>(null),
    pendingDelete = ref<{ kind: 'code' | 'file'; id: number; name: string } | null>(null)
  const form = reactive({
    name: '',
    code: '',
    storage_type: 'local',
    target_path: 'inbox',
    expires_at: '',
    max_uploads: 1
  })
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
    const expiry = new Date(Date.now() + 7 * 86400000)
    expiry.setMinutes(expiry.getMinutes() - expiry.getTimezoneOffset())
    Object.assign(form, {
      name: '',
      code: '',
      storage_type: 'local',
      target_path: 'inbox',
      expires_at: expiry.toISOString().slice(0, 16),
      max_uploads: 1
    })
    showCreate.value = true
  }
  async function refresh() {
    const sequence = ++listSequence
    loading.value = true
    try {
      const result = await DeliveryService.list(page.value, includeDeleted.value)
      if (sequence !== listSequence) return
      codes.value = result.items
      total.value = result.total
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
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
      alerts.showAlert(t('delivery.expiredInput'), 'error')
      return
    }
    if (form.code && !/^[A-Za-z0-9_-]{8,64}$/.test(form.code.trim())) {
      alerts.showAlert(t('delivery.invalidCode'), 'error')
      return
    }
    creating.value = true
    try {
      const result = await DeliveryService.create({
        ...form,
        code: form.code.trim(),
        expires_at: date.toISOString()
      })
      showCreate.value = false
      createdCode.value = result.code
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
      if (item.kind === 'code') await DeliveryService.remove(item.id)
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
  watch(page, refresh)
  watch(includeDeleted, () => {
    if (page.value === 1) void refresh()
    else page.value = 1
  })
  watch(filePage, loadFiles)
  onBeforeUnmount(() => {
    listSequence++
    fileSequence++
    createdCode.value = ''
  })
  return {
    codes,
    files,
    page,
    total,
    filePage,
    fileTotal,
    includeDeleted,
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
