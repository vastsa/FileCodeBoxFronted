<template>
  <div class="flex flex-col h-screen font-sans">
    <!-- 菜单栏 -->
    <nav class="bg-gray-800 text-white p-6">
      <ul class="flex space-x-6 items-center">
        <li>
          <router-link to="/" class="hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </router-link>
        </li>
        <li><router-link to="/admin/fileList" class="hover:text-gray-300 text-lg font-semibold" active-class="text-blue-400">文件管理</router-link></li>
        <li><router-link to="/admin/systemConfig" class="hover:text-gray-300 text-lg font-semibold" active-class="text-blue-400">系统配置</router-link></li>
      </ul>
    </nav>
    
    <!-- 内容区域 -->
    <main class="flex-grow p-4">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { watch } from 'vue';

const route = useRoute();

watch(() => route.path, () => {
  // 路由变化时不执行任何操作，保持菜单栏稳定
}, { immediate: true });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

body {
  font-family: 'Noto Sans SC', sans-serif;
}

.router-link-active {
  color: #60a5fa; /* Tailwind 的 blue-400 颜色 */
}
</style>
