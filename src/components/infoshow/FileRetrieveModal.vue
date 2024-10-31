<template>
  <div class="fixed inset-0 flex items-center justify-center z-50" v-if="isVisible">
    <div class="absolute inset-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm" @click="closeModal"></div>
    <div :class="[
      'rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 w-full mx-4 sm:mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl transform transition-all duration-300',
      isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
    ]">
      <h3 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">取件详情</h3>
      
      <div class="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-100'">
        <!-- 文本内容 -->
        <div v-if="fileType === 'text'" class="space-y-2 sm:space-y-3">
          <h4 class="text-lg sm:text-xl font-semibold">文本内容：</h4>
          <p class="whitespace-pre-wrap text-xs sm:text-sm md:text-base overflow-auto max-h-[60vh]">{{ fileInfo.text }}</p>
        </div>

        <!-- 单个文件 -->
        <div v-if="fileType === 'file'" class="space-y-3 sm:space-y-4">
          <h4 class="text-lg sm:text-xl font-semibold">文件信息：</h4>
          <div class="flex items-center gap-2">
            <i class="fas fa-file-alt"></i>
            <p class="text-sm sm:text-base truncate">{{ fileInfo.name }}</p>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-weight-hanging"></i>
            <p class="text-sm sm:text-base">{{ formatFileSize(fileInfo.size) }}</p>
          </div>
          <button @click="downloadFile" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded transition duration-300">
            <i class="fas fa-download mr-2"></i>
            <span class="text-sm sm:text-base">下载文件</span>
          </button>
        </div>
      </div>

      <button @click="closeModal" :class="[
        'w-full rounded-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-md',
        isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
      ]">
        关闭
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useAlertStore } from '@/stores/alertStore';
import { baseURL } from '@/utils/api';
const props = defineProps({
  isVisible: Boolean,
  fileInfo: Object
});

const emit = defineEmits(['close']);
const isDarkMode = inject('isDarkMode');
const alertStore = useAlertStore();

const fileType = computed(() => {
  if (props.fileInfo.text && !props.fileInfo.text.startsWith('/share/download')) {
    return 'text';
  } else {
    return 'file';
  }
});

const closeModal = () => {
  emit('close');
};

const downloadFile = () => {
  const url =  baseURL + props.fileInfo.text; // 文件的下载链接
  console.log(url);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', props.fileInfo.name); // 指定文件名（可选）
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alertStore.showAlert('文件下载开始', 'success');
};


const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.close-btn {
  font-family: 'Roboto', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}
</style>
