import { AuthService } from '@/services'
import { useAdminStore } from '@/stores/adminStore'

export function useAdminSession() {
  const adminStore = useAdminStore()

  const verifySession = async () => {
    if (!adminStore.hasToken) return false

    try {
      const response = await AuthService.verifyToken()
      if (response.code === 200 && response.detail?.token) {
        adminStore.login(response.detail)
        return true
      }
    } catch {}

    adminStore.logout()
    return false
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } finally {
      adminStore.logout()
    }
  }

  return {
    verifySession,
    logout
  }
}
