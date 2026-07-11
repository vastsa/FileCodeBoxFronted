<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, RouterView } from 'vue-router'
import { LogInIcon, ShieldCheckIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import ThemeToggle from './components/common/ThemeToggle.vue'
import LanguageSwitcher from './components/common/LanguageSwitcher.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import { useAdminSession, useAppShell } from '@/composables'
import { ROUTES } from '@/constants'
import { useConfigStore } from '@/stores/configStore'
import { useAdminStore } from '@/stores/adminStore'

const {
  isDarkMode,
  isLoading,
  routeTransitionMode,
  routeTransitionName,
  routeViewKey,
  showGlobalControls
} = useAppShell()

const configStore = useConfigStore()
const { config } = storeToRefs(configStore)
const adminStore = useAdminStore()
const { t } = useI18n()
const { verifySession } = useAdminSession()
const showAdminAddress = computed(() => config.value.showAdminAddr === 1)
const adminEntryLabel = computed(() =>
  t(adminStore.isAuthenticated ? 'admin.session.loggedIn' : 'admin.session.loggedOut')
)

onMounted(() => {
  if (adminStore.hasToken) void verifySession()
})
</script>

<template>
  <div :class="['app-container', isDarkMode ? 'dark' : 'light']">
    <div
      v-if="showGlobalControls"
      class="fixed top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-6 sm:gap-3"
    >
      <RouterLink
        v-if="showAdminAddress"
        :to="ROUTES.ADMIN"
        class="rounded-full border p-2.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 sm:p-3"
        :class="
          adminStore.isAuthenticated
            ? isDarkMode
              ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : isDarkMode
              ? 'border-white/10 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700'
              : 'border-slate-200/50 bg-white/80 text-slate-500 hover:text-slate-700'
        "
        :aria-label="adminEntryLabel"
        :title="adminEntryLabel"
      >
        <ShieldCheckIcon v-if="adminStore.isAuthenticated" class="h-5 w-5" />
        <LogInIcon v-else class="h-5 w-5" />
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
  background-color: rgb(var(--color-page));
  color: rgb(var(--color-text));
}

.dark {
  background-color: rgb(var(--color-page));
  color: rgb(var(--color-text));
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
  background-color: rgb(var(--color-overlay) / var(--loading-overlay-opacity));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: var(--spinner-size);
  height: var(--spinner-size);
  border: var(--spinner-border-width) solid rgb(var(--color-accent-contrast));
  border-top-color: rgb(var(--color-accent));
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
