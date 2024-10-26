<template>
  <div class="login-container bg-white">
    <h1 class="text-2xl font-bold mb-4">管理员登录</h1>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="password" class="block mb-1 text-lg"><span class="font-serif">密码</span></label>
        <input
          type="password"
          id="password"
          v-model="password"
          class="w-full px-3 py-2 border rounded-md font-sans"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 font-sans"
      >
        登录
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alertStore'
import api from '@/utils/api'

const password = ref('')
const router = useRouter()
const alertStore = useAlertStore()

const handleLogin = async () => {
  try {
    await api.post('/admin/login', {}, {
      headers: {
        'Authorization': password.value
      }
    })
    localStorage.setItem('admin_token', password.value)
    alertStore.showAlert('登录成功', 'success')
    // 添加跳转到 admin 页面的代码
    router.push('/admin/fileList')
  } catch (error) {
    alertStore.showAlert('登录失败，请检查密码', 'error')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-family: 'Noto Sans SC', sans-serif;
}
</style>
