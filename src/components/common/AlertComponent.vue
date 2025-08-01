<template>
  <transition-group
    name="alert-fade"
    tag="div"
    class="fixed top-4 left-4 z-50 w-full sm:max-w-sm md:max-w-md space-y-4 px-4 sm:px-0"
  >
    <div
      v-for="alert in alerts"
      :key="alert.id"
      :class="[
        'w-full rounded-lg shadow-xl overflow-hidden',
        'bg-gradient-to-r',
        gradientClasses[alert.type]
      ]"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="alertIcons[alert.type]" class="h-6 w-6 text-white" />
          </div>
          <div class="ml-3 flex-1 pt-0.5">
            <p class="text-sm font-medium text-white">{{ alert.message }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeAlert(alert.id)"
              class="inline-flex text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
            >
              <span class="sr-only">关闭</span>
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div class="h-1 bg-white bg-opacity-25">
        <div
          class="h-full bg-white transition-all duration-100 ease-out"
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
import { onMounted, onUnmounted } from 'vue'

const alertStore = useAlertStore()
const { alerts } = storeToRefs(alertStore)
const { removeAlert, updateAlertProgress } = alertStore

const gradientClasses = {
  success: 'from-green-500 to-green-600',
  error: 'from-red-500 to-red-600',
  warning: 'from-yellow-500 to-yellow-600',
  info: 'from-blue-500 to-blue-600'
}

const alertIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertCircle,
  info: Info
}

let intervalId: number

onMounted(() => {
  intervalId = setInterval(() => {
    alerts.value.forEach((alert) => {
      updateAlertProgress(alert.id)
    })
  }, 100)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
}
</style>
