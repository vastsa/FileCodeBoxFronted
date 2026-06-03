import { ref } from 'vue'
import { AuthService } from '@/services'
import { useAdminStore } from '@/stores/adminStore'
import { useAlertStore } from '@/stores/alertStore'
import { getErrorMessage } from '@/utils/common'

export function useAdminLogin() {
  const alertStore = useAlertStore()
  const adminStore = useAdminStore()
  const password = ref('')
  const isLoading = ref(false)

  const validateForm = () => {
    if (!password.value) {
      alertStore.showAlert('无效的密码', 'error')
      return false
    }

    if (password.value.length < 6) {
      alertStore.showAlert('密码长度至少为6位', 'error')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return false

    isLoading.value = true
    try {
      const response = await AuthService.login(password.value)
      if (!response.detail?.token) {
        alertStore.showAlert('登录失败：未获取到有效令牌', 'error')
        return false
      }

      adminStore.login({
        id: response.detail.id || 'admin',
        username: response.detail.username || 'admin',
        token: response.detail.token,
        token_type: response.detail.token_type,
        expires_at: response.detail.expires_at
      })
      return true
    } catch (error: unknown) {
      alertStore.showAlert(getErrorMessage(error, '登录失败'), 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    password,
    isLoading,
    handleSubmit
  }
}
