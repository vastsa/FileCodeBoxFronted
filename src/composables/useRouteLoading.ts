import { onUnmounted, ref } from 'vue'
import type { Router } from 'vue-router'

const ROUTE_LOADING_DELAY = 200

export function useRouteLoading(router: Router) {
  const isLoading = ref(false)
  let loadingTimer: number | null = null
  let cleanupBeforeGuard: (() => void) | null = null
  let cleanupAfterHook: (() => void) | null = null

  const clearLoadingTimer = () => {
    if (loadingTimer !== null) {
      window.clearTimeout(loadingTimer)
      loadingTimer = null
    }
  }

  const setupRouteLoading = () => {
    cleanupBeforeGuard = router.beforeEach((to) => {
      clearLoadingTimer()
      isLoading.value = to.meta.showRouteLoading !== false
    })

    cleanupAfterHook = router.afterEach(() => {
      clearLoadingTimer()
      loadingTimer = window.setTimeout(() => {
        isLoading.value = false
        loadingTimer = null
      }, ROUTE_LOADING_DELAY)
    })
  }

  onUnmounted(() => {
    clearLoadingTimer()
    cleanupBeforeGuard?.()
    cleanupAfterHook?.()
  })

  return {
    isLoading,
    setupRouteLoading
  }
}
