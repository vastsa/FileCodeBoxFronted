<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold mb-2" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">安全配置</h3>
    <div class="space-y-2">
      <label for="oldPassword" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">旧密码:</label>
      <div class="relative">
        <input
          id="oldPassword"
          v-model="oldPassword"
          :type="showOldPassword ? 'text' : 'password'"
          placeholder="请输入旧密码"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
          :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
          @blur="validateOldPassword"
        />
        <button
          type="button"
          class="absolute right-4 top-1/2 transform -translate-y-1/2"
          @click="showOldPassword = !showOldPassword"
        >
          <svg v-if="showOldPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </div>
    <div class="space-y-2">
      <label for="newPassword" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">新密码:</label>
      <div class="relative">
        <input
          id="newPassword"
          v-model="newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="请输入新密码"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
          :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
        />
        <button
          type="button"
          class="absolute right-4 top-1/2 transform -translate-y-1/2"
          @click="showNewPassword = !showNewPassword"
        >
          <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </div>
    <div class="space-y-2">
      <label for="confirmPassword" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">确认新密码:</label>
      <div class="relative">
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
          :class="[isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900']"
          @blur="validateNewPasswords"
        />
        <button
          type="button"
          class="absolute right-4 top-1/2 transform -translate-y-1/2"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineModel, ref } from 'vue';
import { useAlertStore } from '@/stores/alertStore';

const config = defineModel('config');
const isDarkMode = defineModel('isDarkMode');
const alertStore = useAlertStore();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const validateOldPassword = () => {
  if (!oldPassword.value) return;
  
  if (oldPassword.value !== config.value.admin_token) {
    alertStore.showAlert('旧密码不正确', 'error');
  }
};

const validateNewPasswords = () => {
  if (!newPassword.value || !confirmPassword.value) return;

  if (newPassword.value !== confirmPassword.value) {
    alertStore.showAlert('两次输入的新密码不一致', 'error');
    return;
  }

  config.value.admin_token = newPassword.value;
};
</script>
