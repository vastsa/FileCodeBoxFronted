import { ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import type { DeliverySession } from '@/types/delivery'
import { getErrorMessage } from '@/utils/common'

/** 授权仅保存在当前页面内存，后台计时器和请求前检查共同保障长时间上传。 */
export function useDelivery() {
  const { t } = useI18n()
  const code = ref('')
  const session = ref<DeliverySession | null>(null)
  const verifying = ref(false)
  const message = ref('')
  let disposed = false
  let expiresAt = 0
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  let refreshing: Promise<string> | null = null

  function accept(result: DeliverySession) {
    if (disposed) return
    session.value = result
    expiresAt = Date.now() + result.expires_in * 1000
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(
      () => {
        void ensureToken().catch((error) => {
          if (!disposed) message.value = getErrorMessage(error, t('delivery.error'))
        })
      },
      Math.max(1000, result.expires_in * 1000 - 60000)
    )
  }

  async function verify() {
    if (verifying.value) return
    verifying.value = true
    message.value = ''
    try {
      accept(await DeliveryService.verify(code.value.trim()))
    } catch (error) {
      if (!disposed) message.value = getErrorMessage(error, t('delivery.error'))
    } finally {
      verifying.value = false
    }
  }

  async function ensureToken(): Promise<string> {
    if (disposed || !session.value) throw new Error(t('delivery.error'))
    if (Date.now() < expiresAt - 60000) return session.value.token
    if (refreshing) return refreshing
    const current = session.value
    // 并发分片共享一次续期；过期后仅重新校验内存中的原码，不重试上传请求。
    refreshing = (async () => {
      const result =
        Date.now() >= expiresAt
          ? await DeliveryService.verify(code.value.trim())
          : await DeliveryService.refresh(current.token)
      if (disposed || session.value !== current) throw new Error(t('delivery.error'))
      accept(result)
      return result.token
    })()
    try {
      return await refreshing
    } finally {
      refreshing = null
    }
  }

  async function uploaded() {
    const current = session.value
    if (!current) return
    current.remaining = Math.max(0, current.remaining - 1)
    try {
      // 上传中续期的 remaining 已扣除了预占，成功后向服务端对账，避免再次扣减显示值。
      if (refreshing) await refreshing
      const active = session.value
      if (!active) return
      const result = await DeliveryService.refresh(active.token)
      if (!disposed && session.value === active) accept(result)
    } catch {
      // 对账失败不改变已成功的上传结果；下一次授权请求继续按服务端额度校验。
    }
  }

  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(refreshTimer)
    code.value = ''
    session.value = null
  })
  return { code, session, verifying, message, verify, uploaded, ensureToken }
}
