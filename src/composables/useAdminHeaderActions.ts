import {
  inject,
  onUnmounted,
  provide,
  shallowRef,
  watch,
  type Component,
  type ComputedRef,
  type InjectionKey
} from 'vue'

export interface AdminHeaderAction {
  key: string
  label: string
  icon: Component
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  loading?: boolean
  disabled?: boolean
}

export interface AdminHeaderConfig {
  subtitle?: string
  status?: string
  statusTone?: 'muted' | 'warning'
  actions: AdminHeaderAction[]
}

interface AdminHeaderRegistry {
  state: ReturnType<typeof shallowRef<AdminHeaderConfig | null>>
  register: (owner: symbol, config: AdminHeaderConfig) => void
  clear: (owner: symbol) => void
}

const ADMIN_HEADER_KEY: InjectionKey<AdminHeaderRegistry> = Symbol('admin-header-actions')

export function provideAdminHeaderActions() {
  const state = shallowRef<AdminHeaderConfig | null>(null)
  let currentOwner: symbol | null = null

  provide(ADMIN_HEADER_KEY, {
    state,
    register(owner, config) {
      currentOwner = owner
      state.value = config
    },
    clear(owner) {
      if (currentOwner === owner) {
        currentOwner = null
        state.value = null
      }
    }
  })

  return state
}

export function useAdminHeaderActions(config: ComputedRef<AdminHeaderConfig>) {
  const registry = inject(ADMIN_HEADER_KEY, null)
  const owner = Symbol('admin-header-owner')
  const stop = watch(
    config,
    (value) => registry?.register(owner, value),
    { immediate: true }
  )

  onUnmounted(() => {
    stop()
    registry?.clear(owner)
  })
}
