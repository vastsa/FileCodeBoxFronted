<template>
  <div class="flex flex-col items-center space-y-4">
    <div class="w-full relative">
      <textarea
        v-model="text"
        placeholder="请输入要分享的文本"
        :class="[
          'w-full h-40 p-4 border-2 border-dashed rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300 ease-in-out',
          isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-600 focus:ring-blue-400 hover:border-blue-400 hover:bg-gray-700' : 'bg-white text-gray-800 border-blue-300 focus:ring-blue-500 hover:border-blue-500 hover:bg-blue-50'
        ]"
      ></textarea>
      <div :class="['absolute bottom-3 right-3', isDarkMode ? 'text-gray-400' : 'text-gray-500']">
        {{ text.length }} / 5000
      </div>
    </div>
    
    <div :class="['flex items-center space-x-2 p-2 rounded-md shadow-sm', isDarkMode ? 'bg-gray-700' : 'bg-white']">
      <span :class="['text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-700']">过期：</span>
      <select v-model="expireStyle" :class="['text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1', isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-300']">
        <option value="day">天</option>
        <option value="hour">时</option>
        <option value="minute">分</option>
        <option value="forever">永久</option>
        <option value="count">次</option>
      </select>
      <input
        v-if="expireStyle !== 'forever'"
        type="number"
        v-model="expireValue"
        min="1"
        :class="['text-sm border rounded px-2 py-1 w-16 focus:outline-none focus:ring-1', isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-300']"
      />
      <span v-if="expireStyle !== 'forever'" :class="['text-sm', isDarkMode ? 'text-blue-400' : 'text-blue-600']">
        {{ expireText }}
      </span>
    </div>

    <div class="mt-4 relative">
      <button 
        @click="uploadText"
        :disabled="!text || isUploading"
        :class="[
          'px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-opacity-50 overflow-hidden',
          isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-gray-200 focus:ring-blue-400' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white focus:ring-blue-500'
        ]"
      >
        <span class="flex items-center justify-center relative z-10">
          <transition name="fade" mode="out-in">
            <svg v-if="isUploading" key="uploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else key="upload" class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </transition>
          {{ isUploading ? '上传中...' : '分享文本' }}
        </span>
        <div v-if="isUploading" class="absolute bottom-0 left-0 h-1 bg-white" :style="{ width: uploadProgress + '%' }"></div>
      </button>
      <transition name="scale">
        <div v-if="isUploading" :class="['absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full shadow-md', isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600']">
          {{ Math.round(uploadProgress) }}%
        </div>
      </transition>
    </div>
    
    <div v-if="uploadProgress > 0" class="w-full h-5 rounded-full overflow-hidden" :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-200']">
      <div 
        class="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300 ease-in-out"
        :style="{ width: `${uploadProgress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import api from '@/utils/api';
import { useFileDataStore } from '@/stores/fileData';

const emit = defineEmits(['text-uploaded']);
const fileDataStore = useFileDataStore();
const isDarkMode  = inject('isDarkMode')

const text = ref('');
const expireStyle = ref('day');
const expireValue = ref(1);
const isUploading = ref(false);
const uploadProgress = ref(0);

const expireText = computed(() => {
  if (expireStyle.value === 'forever') return '永久有效';
  const unit = {
    day: '天',
    hour: '小时',
    minute: '分钟',
    count: '次'
  }[expireStyle.value];
  return `${expireValue.value}${unit}后过期`;
});

const calculateExpireTime = () => {
  const now = new Date();
  switch (expireStyle.value) {
    case 'day':
      return new Date(now.setDate(now.getDate() + expireValue.value)).toLocaleString();
    case 'hour':
      return new Date(now.setHours(now.getHours() + expireValue.value)).toLocaleString();
    case 'minute':
      return new Date(now.setMinutes(now.getMinutes() + expireValue.value)).toLocaleString();
    case 'forever':
      return '永久有效';
    case 'count':
      return `${expireValue.value}次后过期`;
    default:
      return '未知';
  }
};

const uploadText = async () => {
  if (!text.value || isUploading.value) return;

  isUploading.value = true;
  uploadProgress.value = 0;
  const formData = new FormData();
  formData.append('text', text.value);
  formData.append('expire_value', expireValue.value);
  formData.append('expire_style', expireStyle.value);

  try {
    const response = await api.post('share/text/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      }
    });

    if (response && response.detail && response.detail.code) {
      const uploadRecord = {
        name: '文本分享',
        date: new Date().toLocaleString(),
        code: response.detail.code,
        expireTime: calculateExpireTime(),
        size: `${text.value.length} 字符`
      };
      fileDataStore.addShareData(uploadRecord);
      emit('text-uploaded', uploadRecord);
      text.value = ''; // 清空文本框
    } else {
      console.error('上传响应格式不正确:', response);
      // 可以在这里添加错误处理逻辑，比如显示错误消息给用户
    }
  } catch (error) {
    console.error('文本上传出错:', error);
    // 可以在这里添加错误处理逻辑，比如显示错误消息给用户
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.3s ease;
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
