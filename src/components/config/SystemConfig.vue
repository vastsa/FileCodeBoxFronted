<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold mb-2" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">系统配置</h3>
    <div v-for="key in systemKeys" :key="key" class="space-y-2">
      <label :for="key" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ getLabel(key) }}:</label>
      <input
        v-if="getInputType(key) !== 'textarea'"
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
import { defineModel } from 'vue';
import { getLabel, getInputType } from '@/utils/configHelpers';

const config = defineModel('config');
const isDarkMode = defineModel('isDarkMode');

const systemKeys = ['name', 'description', 'notify_title', 'notify_content', 'page_explain', 'keywords', 'max_save_seconds', 'port', 'showAdminAddr'];
</script>
