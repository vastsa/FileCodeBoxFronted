<template>
  <div class="w-full p-4 shadow-md rounded-lg" :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']">
    <!-- 标签页导航 -->
    <div class="mb-4">
      <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" :class="[isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200']" role="tablist">
        <li class="mr-2" role="presentation" v-for="(tab, index) in tabs" :key="index">
          <button @click="activeTab = tab.id" class="inline-block p-4 rounded-t-lg" :class="[activeTab === tab.id ? (isDarkMode ? 'text-blue-500 border-b-2 border-blue-500' : 'text-blue-600 border-b-2 border-blue-600') : 'hover:text-gray-600 hover:border-gray-300']" :id="`${tab.id}-tab`" type="button" role="tab" :aria-controls="tab.id" :aria-selected="activeTab === tab.id">{{ tab.name }}</button>
        </li>
      </ul>
    </div>
    
    <!-- 配置表单 -->
    <div class="overflow-y-auto mb-4 pr-4 custom-scrollbar" style="max-height: 60vh;">
      <form @submit.prevent="updateConfig" class="grid grid-cols-1 gap-6">
        <component :is="activeTabComponent" v-model:config="config" v-model:isDarkMode="isDarkMode" />
      </form>
    </div>

    <!-- 更新按钮 -->
    <div class="py-4 mt-4" :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']">
      <button @click="updateConfig" class="w-full px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span class="inline-block w-5 h-5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </span>
        更新配置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useAlertStore } from '@/stores/alertStore';
import StorageConfig from '@/components/config/StorageConfig.vue';
import SystemConfig from '@/components/config/SystemConfig.vue';
import WebsiteConfig from '@/components/config/WebsiteConfig.vue';
import SecurityConfig from '@/components/config/SecurityConfig.vue';
import api from '@/utils/api';

const isDarkMode = inject('isDarkMode');

const alertStore = useAlertStore();

// 使用 ref 创建一个响应式的 config 对象
const config = ref({});

// 在组件挂载时获取当前配置
onMounted(async () => {
  try {
    const response = await api.get('/admin/config/get', {
      headers: {
        'Authorization': localStorage.getItem('admin_token')
      }
    });
    if (response.code === 200) {
      config.value = response.detail;
      console.log(response);
    } else {
      alertStore.showAlert('获取配置失败', 'error');
    }
  } catch (error) {
    console.error(error);
    alertStore.showAlert('获取配置失败', 'error');
  }
});

const activeTab = ref('storage');

const tabs = [
  { id: 'storage', name: '存储配置', component: StorageConfig },
  { id: 'system', name: '系统配置', component: SystemConfig },
  { id: 'website', name: '网站配置', component: WebsiteConfig },
  { id: 'security', name: '安全配置', component: SecurityConfig },
];

const activeTabComponent = computed(() => {
  const tab = tabs.find(tab => tab.id === activeTab.value);
  return tab ? tab.component : null;
});

const updateConfig = async () => {
  try {
    const response = await api.patch('/admin/config/update', config.value, {
      headers: {
        'Authorization': localStorage.getItem('admin_token')
      }
    });
    if (response.code === 200) {
      alertStore.showAlert('配置更新成功', 'success');
    } else {
      alertStore.showAlert('配置更新失败', 'error');
    }
  } catch (error) {
    console.error(error);
    alertStore.showAlert('配置更新失败', 'error');
  }
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #4299e1 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4299e1;
  border-radius: 3px;
}
</style>
