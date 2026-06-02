import { computed, inject, unref } from 'vue'
import type { Ref } from 'vue'

export function useInjectedDarkMode() {
  const injectedDarkMode = inject<Ref<boolean> | boolean>('isDarkMode', false)
  return computed(() => Boolean(unref(injectedDarkMode)))
}
