<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold mb-2" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">存储源配置</h3>
    <div class="space-y-2">
      <label for="file_storage" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">文件存储方式:</label>
      <select
        id="file_storage"
        :value="config.file_storage"
        @input="updateConfig('file_storage', $event.target.value)"
        class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition duration-150 ease-in-out m-2"
        :class="[isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900']"
      >
        <option value="local">本地存储</option>
        <option value="s3">S3 存储</option>
        <option value="onedrive">OneDrive 存储</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>

    <template v-if="config.file_storage === 's3'">
      <!-- S3 配置项 -->
      <div v-for="key in s3Keys" :key="key" class="space-y-2">
        <label :for="key" class="block text-sm font-medium truncate" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ getLabel(key) }}:</label>
        <input
          :id="key"
          :value="config[key]"
          @input="updateConfig(key, $event.target.value)"
          :type="getInputType(key)"
          :placeholder="getLabel(key)"
          class="w-full pl-4 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out m-2"
          :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-offset-gray-700' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-offset-white']"
        />
      </div>
    </template>

    <template v-if="config.file_storage === 'onedrive'">
      <!-- OneDrive 配置项 -->
      <div v-for="key in onedriveKeys" :key="key" class="space-y-2">
        <label :for="key" class="block text-sm font-medium truncate" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ getLabel(key) }}:</label>
        <input
          :id="key"
          :value="config[key]"
          @input="updateConfig(key, $event.target.value)"
          :type="getInputType(key)"
          :placeholder="getLabel(key)"
          class="w-full pl-4 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out m-2"
          :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-offset-gray-700' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-offset-white']"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { getLabel, getInputType } from '@/utils/configHelpers';

const props = defineProps({
  config: Object,
  isDarkMode: Boolean
});

const emit = defineEmits(['update:config']);

const updateConfig = (key, value) => {
  emit('update:config', { ...props.config, [key]: value });
};

const s3Keys = ['s3_access_key_id', 's3_secret_access_key', 's3_bucket_name', 's3_endpoint_url', 's3_hostname', 's3_proxy', 'aws_session_token'];
const onedriveKeys = ['onedrive_domain', 'onedrive_client_id', 'onedrive_username', 'onedrive_password', 'onedrive_root_path', 'onedrive_proxy'];
</script>
