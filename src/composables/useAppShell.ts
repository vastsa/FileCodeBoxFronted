import { computed, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_EVENTS } from '@/services'
import { ROUTES } from '@/constants'
import { useTheme } from './useTheme'
import { usePublicConfigBootstrap } from './usePublicConfigBootstrap'
import { useRouteLoading } from './useRouteLoading'

export function useAppShell() {
  const route = useRoute()
  const router = useRouter()
  const { isDarkMode, toggleTheme, initTheme } = useTheme()
  const { isLoading, setupRouteLoading } = useRouteLoading(router)
  const { syncPublicConfig } = usePublicConfigBootstrap()
  const showGlobalControls = computed(() => route.meta.showGlobalControls !== false)
  const routeViewKey = computed(() =>
    route.path === ROUTES.ADMIN || route.path.startsWith(`${ROUTES.ADMIN}/`)
      ? ROUTES.ADMIN
      : route.fullPath
  )

  let cleanupThemeListener: (() => void) | null = null

  const handleUnauthorized = () => {
    if (router.currentRoute.value.path !== ROUTES.LOGIN) {
      void router.push({
        path: ROUTES.LOGIN,
        query: {
          redirect: router.currentRoute.value.fullPath
        }
      })
    }
  }

  onMounted(() => {
    cleanupThemeListener = initTheme()
    setupRouteLoading()
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized)
    void syncPublicConfig()
  })

  onUnmounted(() => {
    cleanupThemeListener?.()
    window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized)
  })

  provide('isDarkMode', isDarkMode)
  provide('toggleTheme', toggleTheme)
  provide('isLoading', isLoading)

  return {
    isDarkMode,
    isLoading,
    route,
    routeViewKey,
    showGlobalControls
  }
}
