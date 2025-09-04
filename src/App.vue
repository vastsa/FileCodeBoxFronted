<script setup lang="ts">
import { ref, watchEffect, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ThemeToggle from './components/common/ThemeToggle.vue'
import { useRouter } from 'vue-router'
const isDarkMode = ref(false)
const isLoading = ref(false)
const router = useRouter()
import AlertComponent from '@/components/common/AlertComponent.vue'
import { useAlertStore } from '@/stores/alertStore'
import { ConfigService } from '@/services'
import type { ApiResponse, ConfigState } from '@/types'

const alertStore = useAlertStore()
// 检查系统颜色模式
const checkSystemColorScheme = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 从本地存储获取用户之前的选择
const getUserPreference = () => {
  const storedPreference = localStorage.getItem('colorMode')
  if (storedPreference) {
    return storedPreference === 'dark'
  }
  return null
}

// 设置颜色模式
const setColorMode = (isDark: boolean) => {
  isDarkMode.value = isDark
  localStorage.setItem('colorMode', isDark ? 'dark' : 'light')
}

onMounted(() => {
  const userPreference = getUserPreference()
  if (userPreference !== null) {
    setColorMode(userPreference)
  } else {
    setColorMode(checkSystemColorScheme())
  }
  ConfigService.getUserConfig().then((res: ApiResponse<ConfigState>) => {
    if (res.code === 200 && res.detail) {
      console.log(res);
      localStorage.setItem('config', JSON.stringify(res.detail))
      if (
        res.detail.notify_title &&
        res.detail.notify_content &&
        localStorage.getItem('notify') !== res.detail.notify_title + res.detail.notify_content
      ) {
        localStorage.setItem('notify', res.detail.notify_title + res.detail.notify_content)
        alertStore.showAlert(res.detail.notify_title + ': ' + res.detail.notify_content, 'success')
      }
    }
  })
})

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})

router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 200) // 添加一个小延迟，以确保组件已加载
})

provide('isDarkMode', isDarkMode)
provide('setColorMode', setColorMode)
provide('isLoading', isLoading)
</script>

<template>
  <div :class="['app-container', isDarkMode ? 'dark' : 'light']">
    <ThemeToggle v-model="isDarkMode" />
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
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
