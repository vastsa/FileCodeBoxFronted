<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ShieldCheckIcon } from 'lucide-vue-next'
import ThemeToggle from './components/common/ThemeToggle.vue'
import LanguageSwitcher from './components/common/LanguageSwitcher.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import { useAppShell } from '@/composables'
import { ROUTES } from '@/constants'

const {
  isDarkMode,
  isLoading,
  routeTransitionMode,
  routeTransitionName,
  routeViewKey,
  showGlobalControls
} = useAppShell()
</script>

<template>
  <div :class="['app-container', isDarkMode ? 'dark' : 'light']">
    <div
      v-if="showGlobalControls"
      class="fixed top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-6 sm:gap-3"
    >
      <RouterLink
        :to="ROUTES.ADMIN"
        class="rounded-full border p-2.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 sm:p-3"
        :class="
          isDarkMode
            ? 'border-white/10 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700'
            : 'border-slate-200/50 bg-white/80 text-slate-500 hover:text-slate-700'
        "
        aria-label="进入管理员页面"
        title="进入管理员页面"
      >
        <ShieldCheckIcon class="h-5 w-5" />
      </RouterLink>
      <LanguageSwitcher />
      <ThemeToggle v-model="isDarkMode" />
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <RouterView v-slot="{ Component }">
      <transition :name="routeTransitionName" :mode="routeTransitionMode">
        <component :is="Component" :key="routeViewKey" />
      </transition>
    </RouterView>

    <AlertComponent />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  width: 100%;
  transition: background-color 0.5s ease;
}

.light {
  @apply bg-[#f5f5f7] text-zinc-900;
}

.dark {
  @apply bg-zinc-950 text-zinc-100;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.transfer-fade-enter-active,
.transfer-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.transfer-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.transfer-fade-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
}

.transfer-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #fff;
  border-top: 3px solid #27272a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
