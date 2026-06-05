<template>
  <transition-group
    name="alert-fade"
    tag="div"
    class="fixed left-4 right-4 top-4 z-50 space-y-3 sm:left-auto sm:w-[24rem]"
  >
    <div
      v-for="alert in alerts"
      :key="alert.id"
      :class="['w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl', cardClass]"
    >
      <div class="flex items-start gap-3 p-4">
        <div
          class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          :class="iconToneClass(alert.type)"
        >
          <component :is="alertIcons[alert.type]" class="h-5 w-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="break-words text-sm font-medium leading-5" :class="messageClass">
            {{ alert.message }}
          </p>
        </div>
        <button
          @click="removeAlert(alert.id)"
          class="inline-flex rounded-lg p-1.5 transition-colors duration-200"
          :class="closeClass"
        >
          <span class="sr-only">{{ t('common.close') }}</span>
          <X class="h-4 w-4" />
        </button>
      </div>
      <div class="h-0.5" :class="progressTrackClass">
        <div
          class="h-full transition-all duration-100 ease-out"
          :class="progressToneClass(alert.type)"
          :style="{ width: `${alert.progress}%` }"
        ></div>
      </div>
    </div>
  </transition-group>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAlertStore } from '@/stores/alertStore'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInjectedDarkMode } from '@/composables'

const { t } = useI18n()
const isDarkMode = useInjectedDarkMode()

const alertStore = useAlertStore()
const { alerts } = storeToRefs(alertStore)
const { removeAlert, startProgressTimer, stopProgressTimer } = alertStore

type AlertType = 'success' | 'error' | 'warning' | 'info'

const alertIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertCircle,
  info: Info
}

const cardClass = computed(() =>
  isDarkMode.value
    ? 'border-white/10 bg-zinc-900/[0.88] shadow-[0_22px_70px_-34px_rgba(255,255,255,0.2)]'
    : 'border-white/80 bg-white/[0.88] shadow-[0_22px_70px_-34px_rgba(24,24,27,0.3)]'
)

const messageClass = computed(() => (isDarkMode.value ? 'text-zinc-100' : 'text-zinc-900'))
const closeClass = computed(() =>
  isDarkMode.value
    ? 'text-zinc-500 hover:bg-white/10 hover:text-zinc-200'
    : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
)
const progressTrackClass = computed(() =>
  isDarkMode.value ? 'bg-white/[0.06]' : 'bg-zinc-950/[0.06]'
)

const iconToneClass = (type: AlertType) => {
  const darkClasses: Record<AlertType, string> = {
    success: 'bg-white/10 text-zinc-100',
    info: 'bg-white/10 text-zinc-100',
    warning: 'bg-amber-400/12 text-amber-200',
    error: 'bg-red-400/12 text-red-200'
  }
  const lightClasses: Record<AlertType, string> = {
    success: 'bg-zinc-100 text-zinc-800',
    info: 'bg-zinc-100 text-zinc-800',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700'
  }

  return isDarkMode.value ? darkClasses[type] : lightClasses[type]
}

const progressToneClass = (type: AlertType) => {
  const darkClasses: Record<AlertType, string> = {
    success: 'bg-zinc-100',
    info: 'bg-zinc-100',
    warning: 'bg-amber-300',
    error: 'bg-red-300'
  }
  const lightClasses: Record<AlertType, string> = {
    success: 'bg-zinc-800',
    info: 'bg-zinc-800',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  }

  return isDarkMode.value ? darkClasses[type] : lightClasses[type]
}

onMounted(() => {
  startProgressTimer()
})

onUnmounted(() => {
  stopProgressTimer()
})
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
