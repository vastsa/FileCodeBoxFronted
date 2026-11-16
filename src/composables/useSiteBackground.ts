import { computed, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore'
import { normalizeBackgroundUrl } from '@/utils/site-background'

export function useSiteBackground() {
  const { config } = storeToRefs(useConfigStore())

  const backgroundUrl = computed(() => normalizeBackgroundUrl(config.value.background))
  const hasBackground = computed(() => backgroundUrl.value !== '')
  const backgroundStyle = computed<CSSProperties>(() =>
    hasBackground.value
      ? {
          backgroundImage: `url("${backgroundUrl.value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      : {}
  )

  return { backgroundUrl, hasBackground, backgroundStyle }
}
