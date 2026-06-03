<script setup lang="ts">
import { RouterView } from 'vue-router'
import ThemeToggle from './components/common/ThemeToggle.vue'
import LanguageSwitcher from './components/common/LanguageSwitcher.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import { useAppShell } from '@/composables'

const { isDarkMode, isLoading, routeViewKey, showGlobalControls } = useAppShell()
</script>

<template>
  <div :class="['app-container', isDarkMode ? 'dark' : 'light']">
    <div v-if="showGlobalControls" class="fixed top-4 right-4 z-50 flex items-center space-x-3">
      <LanguageSwitcher />
      <ThemeToggle v-model="isDarkMode" />
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
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
  @apply bg-gradient-to-br from-blue-50 via-indigo-50 to-white;
}

.dark {
  @apply bg-gradient-to-br from-gray-900 via-indigo-900 to-black;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  border-top: 3px solid #3498db;
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
