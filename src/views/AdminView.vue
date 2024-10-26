<template>
  <div class="flex flex-col h-screen font-sans">
    <!-- 菜单栏 -->
    <nav class="bg-gray-800 text-white p-6">
      <ul class="flex space-x-6">
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
