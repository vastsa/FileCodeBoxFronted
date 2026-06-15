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
  const routeTransitionName = computed(() => String(route.meta.routeTransition || 'fade'))
  const routeTransitionMode = computed(() => (route.meta.routeTransition ? undefined : 'out-in'))
  const routeViewKey = computed(() =>
    route.path === ROUTES.ADMIN || route.path.startsWith(`${ROUTES.ADMIN}/`)
      ? ROUTES.ADMIN
      : route.fullPath
  )

  let cleanupThemeListener: (() => void) | null = null
  let setupRedirecting = false

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

  const handleSetupRequired = (event: Event) => {
    const setupPath =
      event instanceof CustomEvent && typeof event.detail?.setupPath === 'string'
        ? event.detail.setupPath
        : '/setup'

    if (!setupPath || setupRedirecting || window.location.pathname.replace(/\/+$/, '') === setupPath) {
      return
    }

    setupRedirecting = true
    window.location.assign(setupPath)
  }

  onMounted(() => {
    cleanupThemeListener = initTheme()
    setupRouteLoading()
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized)
    window.addEventListener(AUTH_EVENTS.SETUP_REQUIRED, handleSetupRequired)
    void syncPublicConfig()
  })

  onUnmounted(() => {
    cleanupThemeListener?.()
    window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized)
    window.removeEventListener(AUTH_EVENTS.SETUP_REQUIRED, handleSetupRequired)
  })

  provide('isDarkMode', isDarkMode)
  provide('toggleTheme', toggleTheme)
  provide('isLoading', isLoading)

  return {
    isDarkMode,
    isLoading,
    route,
    routeTransitionMode,
    routeTransitionName,
    routeViewKey,
    showGlobalControls
  }
}
