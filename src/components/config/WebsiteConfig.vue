<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold mb-2" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">网站配置</h3>
    <div v-for="key in websiteKeys" :key="key" class="space-y-2">
      <label :for="key" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ getLabel(key) }}:</label>
      <template v-if="key === 'openUpload'">
        <div class="relative inline-block w-full h-6 m-2">
          <input
            :id="key"
            v-model="config[key]"
            type="checkbox"
            class="sr-only"
          />
          <div
            class="block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out cursor-pointer"
            :class="[config[key] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700']"
            @click="config[key] = !config[key]"
          >
            <div
              class="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out transform"
              :class="[config[key] ? 'translate-x-6' : 'translate-x-0']"
            ></div>
          </div>
        </div>
      </template>
      <template v-else-if="key === 'uploadSize'">
        <div class="flex items-center space-x-2 m-2">
          <input
            :id="key"
            v-model="displaySize"
            type="number"
            class="w-2/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
            @input="updateUploadSize"
          />
          <select
            v-model="sizeUnit"
            class="w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
            @change="updateUploadSize"
          >
            <option value="B">B</option>
            <option value="KB">KB</option>
            <option value="MB">MB</option>
            <option value="GB">GB</option>
          </select>
        </div>
      </template>
      <input
        v-else-if="getInputType(key) !== 'textarea'"
        :id="key"
        v-model="config[key]"
        :type="getInputType(key)"
        :placeholder="getLabel(key)"
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
        :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
      />
      <textarea
        v-else
        :id="key"
        v-model="config[key]"
        :placeholder="getLabel(key)"
        rows="3"
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
        :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { defineModel, ref, onMounted } from 'vue';
import { getLabel, getInputType } from '@/utils/configHelpers';

const config = defineModel('config');
const isDarkMode = defineModel('isDarkMode');

const displaySize = ref(0);
const sizeUnit = ref('MB');

const websiteKeys = ['openUpload', 'uploadSize', 'expireStyle', 'uploadMinute', 'opacity', 'background', '上传次数限制', 'errorMinute', 'errorCount', 'robotsText'];

// 转换为B的函数
const convertToB = (size, unit) => {
  switch(unit) {
    case 'GB':
      return size * 1024 * 1024 * 1024;
    case 'MB':
      return size * 1024 * 1024;
    case 'KB':
      return size * 1024;
    case 'B':
    default:
      return size;
  }
};

// 从B转换回显示单位
const convertFromB = (sizeInB, unit) => {
  switch(unit) {
    case 'GB':
      return sizeInB / (1024 * 1024 * 1024);
    case 'MB':
      return sizeInB / (1024 * 1024);
    case 'KB':
      return sizeInB / 1024;
    case 'B':
    default:
      return sizeInB;
  }
};

// 更新上传大小限制
const updateUploadSize = () => {
  config.value.uploadSize = convertToB(displaySize.value, sizeUnit.value);
};

// 组件挂载时初始化显示值
onMounted(() => {
  if (config.value.uploadSize) {
    // 默认使用MB作为单位
    sizeUnit.value = 'MB';
    displaySize.value = convertFromB(config.value.uploadSize, sizeUnit.value);
  }
});
</script>
