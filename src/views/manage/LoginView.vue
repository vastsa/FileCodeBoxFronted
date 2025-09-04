<template>
  <div
    :class="[
      'min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 relative overflow-hidden',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    ]"
  >
    <div class="absolute inset-0 z-0">
      <div class="cyber-grid"></div>
      <div class="floating-particles"></div>
    </div>
    <div
      class="max-w-md w-full space-y-8 backdrop-blur-lg bg-opacity-20 p-8 rounded-xl border border-opacity-20"
      :class="[isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white/70 border-gray-200']"
    >
      <div>
        <div class="mx-auto h-16 w-16 relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow"
          ></div>
          <div
            class="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-md animate-pulse"
          ></div>
          <div
            :class="[
              'absolute inset-1 rounded-full flex items-center justify-center',
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            ]"
          >
            <BoxIcon :class="['h-8 w-8', isDarkMode ? 'text-cyan-400' : 'text-cyan-600']" />
          </div>
        </div>
        <h2
          :class="[
            'mt-6 text-center text-3xl font-extrabold',
            isDarkMode ? 'text-white' : 'text-gray-900'
          ]"
        >
          登录
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              :class="[
                'appearance-none rounded-t-md relative block w-full px-4 py-3 border transition-all duration-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm backdrop-blur-sm',
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'bg-white/50 border-gray-300 text-gray-900 hover:border-gray-400'
              ]"
              placeholder="密码"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            :class="[
              'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg hover:shadow-cyan-500/50',
              isDarkMode
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700',
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            ]"
            :disabled="isLoading"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3"> </span>
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { BoxIcon } from 'lucide-vue-next'
import api from '@/utils/api'
import type { ApiResponse } from '@/types'
import { useAlertStore } from '@/stores/alertStore'
import { useAdminData } from '@/stores/adminStore'
import { useRouter } from 'vue-router'

// 登录响应类型定义
interface LoginResponse {
  token: string
}
const alertStore = useAlertStore()
const password = ref('')
const isLoading = ref(false)
const isDarkMode = inject('isDarkMode')
const adminStore = useAdminData()
const validateForm = () => {
  let isValid = true
  if (!password.value) {
    alertStore.showAlert('无效的密码', 'error')
    isValid = false
  } else if (password.value.length < 6) {
    alertStore.showAlert('密码长度至少为6位', 'error')
    isValid = false
  }
  return isValid
}

const router = useRouter()

const handleSubmit = async () => {
  if (!validateForm()) return
  api
    .post<ApiResponse<LoginResponse>>('/admin/login', { password: password.value })
    .then((res) => {
      adminStore.setToken(res.data.detail?.token || '')
      router.push('/admin')
    })
    .catch((error) => {
      alertStore.showAlert(error.response?.data?.detail || '登录失败', 'error')
    })
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // 处理登录成功
  } catch (error) {
    console.log(error)
    // 处理错误
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

input:focus {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

.cyber-grid {
  background-image:
    linear-gradient(transparent 95%, rgba(99, 102, 241, 0.1) 50%),
    linear-gradient(90deg, transparent 95%, rgba(99, 102, 241, 0.1) 50%);
  background-size: 30px 30px;
  width: 100%;
  height: 100%;
  position: absolute;
  opacity: 0.5;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 0%, transparent 100%);
  filter: url(#gooey);
}

.floating-particles::before,
.floating-particles::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
  animation: float 20s infinite linear;
}

.floating-particles::after {
  animation-delay: -10s;
  opacity: 0.5;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(50px, 50px) scale(1.5);
  }

  100% {
    transform: translate(0, 0) scale(1);
  }
}

button:hover:not(:disabled) {
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
