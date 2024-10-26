<template>
  <div class="w-full mx-auto p-4 bg-white rounded-lg shadow-md">
    <div class="max-h-[70vh] overflow-y-auto mb-4">
      <form @submit.prevent="updateConfig" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div v-for="(value, key) in leftColumnConfig" :key="key" class="space-y-2">
            <label :for="key" class="block text-sm font-medium text-gray-700">{{ getLabel(key) }}:</label>
            <div v-if="key === 'opacity'" class="space-y-2">
              <input
                :id="key"
                v-model="config[key]"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-600">
                <span>0</span>
                <span>0.5</span>
                <span>1</span>
              </div>
              <div class="text-center text-sm text-gray-600">{{ config[key] }}</div>
            </div>
            <input
              v-else
              :id="key"
              v-model="config[key]"
              :type="getInputType(key)"
              :placeholder="getLabel(key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="(value, key) in rightColumnConfig" :key="key" class="space-y-2">
            <label :for="key" class="block text-sm font-medium text-gray-700">{{ getLabel(key) }}:</label>
            <template v-if="key === 'admin_token'">
              <div class="relative">
                <input
                  :id="`${key}_1`"
                  v-model="config[key]"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="getLabel(key)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  <!-- 显示/隐藏密码的图标 -->
                </button>
              </div>
              <input
                :id="`${key}_2`"
                v-model="confirmPasswords[key]"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="`确认${getLabel(key)}`"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </template>
            <template v-else-if="key === 'openUpload'">
              <div class="flex items-center">
                <label :for="key" class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input :id="key" v-model="config[key]" type="checkbox" class="sr-only" />
                    <div class="w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-colors duration-300 ease-in-out"
                         :class="{ 'bg-green-500': config[key] }"></div>
                    <div class="absolute w-5 h-5 bg-white rounded-full shadow inset-y-1 left-1 transition-transform duration-300 ease-in-out"
                         :class="{ 'transform translate-x-7': config[key] }"></div>
                  </div>
                  <div class="ml-3 text-gray-700 font-medium">
                    {{ getLabel(key) }}
                  </div>
                </label>
              </div>
            </template>
            <input
              v-else
              :id="key"
              v-model="config[key]"
              :type="getInputType(key)"
              :placeholder="getLabel(key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </div>
    <div class="sticky bottom-0 bg-white py-4 mt-4">
      <button @click="updateConfig" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
import { ref, onMounted, computed } from 'vue';
import api from '@/utils/api';
import { useAlertStore } from '@/stores/alertStore';

const config = ref({});
const confirmPasswords = ref({});
const alertStore = useAlertStore();
const showPassword = ref(false);

const leftColumnConfig = computed(() => {
  const keys = Object.keys(config.value).filter(key => !['port', 'admin_token', 'openUpload'].includes(key));
  const midIndex = Math.ceil(keys.length / 2);
  return Object.fromEntries(keys.slice(0, midIndex).map(key => [key, config.value[key]]));
});

const rightColumnConfig = computed(() => {
  const keys = Object.keys(config.value).filter(key => !['port'].includes(key));
  const midIndex = Math.ceil(keys.length / 2);
  const rightKeys = keys.slice(midIndex);
  rightKeys.unshift('admin_token', 'openUpload');
  return Object.fromEntries(rightKeys.map(key => [key, config.value[key]]));
});

const fetchConfig = async () => {
  try {
    const response = await api.get('/admin/config/get', {
      headers: { 'Authorization': localStorage.getItem('admin_token') }
    });
    config.value = response.detail;
    confirmPasswords.value = { admin_token: '' };
  } catch (error) {
    alertStore.showAlert('获取配置失败', 'error');
  }
};

const updateConfig = async () => {
  if (!validatePasswords()) {
    alertStore.showAlert('管理员密码不匹配，请重新输入', 'error');
    return;
  }
  try {
    await api.patch('/admin/config/update', config.value, {
      headers: { 'Authorization': localStorage.getItem('admin_token') }
    });
    alertStore.showAlert('更新配置成功', 'success');
  } catch (error) {
    alertStore.showAlert('更新配置失败', 'error');
  }
};

const getLabel = (key) => {
  const labels = {
    file_storage: '文件存储方式',
    name: '网站名称',
    description: '网站描述',
    keywords: '关键词',
    max_save_seconds: '最大保存时间（秒）',
    s3_access_key_id: 'S3访问密钥ID',
    s3_secret_access_key: 'S3秘密访问密钥',
    s3_bucket_name: 'S3存储桶名称',
    s3_endpoint_url: 'S3端点URL',
    s3_hostname: 'S3主机名',
    s3_proxy: 'S3代理',
    aws_session_token: 'AWS会话令牌',
    onedrive_domain: 'OneDrive域名',
    onedrive_client_id: 'OneDrive客户端ID',
    onedrive_username: 'OneDrive用户名',
    onedrive_password: 'OneDrive密码',
    onedrive_root_path: 'OneDrive根路径',
    onedrive_proxy: 'OneDrive代理',
    admin_token: '管理员密码',
    openUpload: '开放上传',
    uploadSize: '上传大小限制（字节）',
    uploadMinute: '上传时间限制（分钟）',
    opacity: '背景透明度',
    background: '背景图片URL',
    uploadCount: '上传次数限制',
    errorMinute: '错误限制时间（分钟）',
    errorCount: '错误次数限制'
  };
  return labels[key] || key;
};

const getInputType = (key) => {
  if (key === 'admin_token') return showPassword.value ? 'text' : 'password';
  if (['max_save_seconds', 'uploadSize', 'uploadMinute', 'uploadCount', 'errorMinute', 'errorCount', 's3_proxy', 'onedrive_proxy'].includes(key)) return 'number';
  if (key === 'openUpload') return 'checkbox';
  if (key === 'opacity') return 'range';
  return 'text';
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const validatePasswords = () => {
  return confirmPasswords.value.admin_token === config.value.admin_token;
};

onMounted(fetchConfig);
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
