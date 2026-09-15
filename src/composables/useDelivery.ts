import { ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeliveryService } from '@/services'
import type { DeliverySession } from '@/types/delivery'
import { getErrorMessage } from '@/utils/common'

/** 寄件仅维护验证状态，验证后的文件、文本和分片上传全部由普通发送流程处理。 */
export function useDelivery() {
  const { t } = useI18n()
  const code = ref('')
  const session = ref<DeliverySession | null>(null)
  const verifying = ref(false)
  const message = ref('')
  let disposed = false
  onBeforeUnmount(() => {
    disposed = true
    code.value = ''
    session.value = null
  })
  async function verify() {
    if (verifying.value) return
    verifying.value = true
    message.value = ''
    try {
      const result = await DeliveryService.verify(code.value.trim())
      if (!disposed) session.value = result
    } catch (error) {
      if (!disposed) message.value = getErrorMessage(error, t('delivery.error'))
    } finally {
      verifying.value = false
    }
  }
  function uploaded() {
    if (session.value) session.value.remaining = Math.max(0, session.value.remaining - 1)
  }
  return { code, session, verifying, message, verify, uploaded }
}
