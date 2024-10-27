<template>
  <div class="flex flex-col items-center space-y-4">
    <div
      class="w-full h-40 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300"
      :class="[isDarkMode ? 'border-blue-500 hover:bg-blue-900 hover:border-blue-400' : 'border-blue-300 hover:bg-blue-50 hover:border-blue-500']"
      @dragover.prevent
      @drop.prevent="handleFileDrop"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        class="hidden"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" :class="[isDarkMode ? 'text-blue-400' : 'text-blue-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p v-if="!selectedFile" class="font-medium" :class="[isDarkMode ? 'text-blue-400' : 'text-blue-600']">
        点击选择文件或拖拽文件到此处
      </p>
      <p v-else class="font-semibold" :class="[isDarkMode ? 'text-blue-300' : 'text-blue-700']">
        已选择文件: {{ selectedFile.name }}
      </p>
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
        @click="startUpload" 
        :disabled="!selectedFile || isUploading"
        class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden"
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
          {{ isUploading ? '上传中...' : '开始上传' }}
        </span>
        <div v-if="isUploading" class="absolute bottom-0 left-0 h-1 bg-white" :style="{ width: uploadProgress + '%' }"></div>
      </button>
      <transition name="scale">
        <div v-if="isUploading" class="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full shadow-md" :class="[isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600']">
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
    <p v-if="isCalculatingMD5" :class="[isDarkMode ? 'text-blue-400' : 'text-blue-600']">正在解析数据: {{ md5Progress }}%</p>
    <p v-if="isVerifying" :class="[isDarkMode ? 'text-blue-400' : 'text-blue-600']">正在校验数据</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import api from '@/utils/api';
import SparkMD5 from 'spark-md5';
import { useFileDataStore } from '@/stores/fileData';

const isDarkMode = inject('isDarkMode');
const emit = defineEmits(['file-selected', 'upload-progress', 'upload-complete']);
const fileDataStore = useFileDataStore();

const selectedFile = ref(null);
const uploadProgress = ref(0);
const chunkSize = 5 * 1024 * 1024; // 5MB 每片
const fileInput = ref(null);
const expireStyle = ref('day');
const expireValue = ref(1);
const isUploading = ref(false);
const isCalculatingMD5 = ref(false);
const md5Progress = ref(0);
const isVerifying = ref(false);

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

onMounted(() => {
  console.log('FileUploader组件已挂载');
});

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  emit('file-selected', selectedFile.value);
};

const handleFileDrop = (event) => {
  selectedFile.value = event.dataTransfer.files[0];
  emit('file-selected', selectedFile.value);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const calculateMD5 = (file) => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2097152; // 每次读取2MB
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    let currentChunk = 0;
    const chunks = Math.ceil(file.size / chunkSize);

    isCalculatingMD5.value = true;

    fileReader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;

      md5Progress.value = Math.round((currentChunk / chunks) * 100);

      if (currentChunk < chunks) {
        loadNext();
      } else {
        isCalculatingMD5.value = false;
        resolve(spark.end());
      }
    };

    fileReader.onerror = (e) => {
      isCalculatingMD5.value = false;
      reject(e);
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
};

const startUpload = async () => {
  if (!selectedFile.value || isUploading.value) return;

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const fileIdentifier = await calculateMD5(selectedFile.value);
    const chunks = Math.ceil(selectedFile.value.size / chunkSize);
    let uploadedChunks = [];

    for (let i = 0; i < chunks; i++) {
      if (!uploadedChunks.includes(i)) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.value.size);
        const chunk = selectedFile.value.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, selectedFile.value.name);
        formData.append('chunk_number', i);
        formData.append('chunk_total', chunks);
        formData.append('file_identifier', fileIdentifier);
        formData.append('expire_value', expireValue.value);
        formData.append('expire_style', expireStyle.value);

        try {
          const response = await api.post('share/file/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              uploadProgress.value = (i / chunks) * 100 + (percentCompleted / chunks);
              emit('upload-progress', uploadProgress.value);
            },
            timeout: 60000 // 增加超时时间到60秒
          });

          console.log(`分片 ${i + 1}/${chunks} 上传成功`);

          if (response.code === 200) {
            if (response.detail.uploaded_chunks) {
              uploadedChunks = response.detail.uploaded_chunks;
              i = Math.max(...uploadedChunks);
            } else if (response.detail.code) {
              isVerifying.value = true;
              const uploadRecord = {
                name: selectedFile.value.name,
                date: new Date().toLocaleString(),
                code: response.detail.code,
                expireTime: calculateExpireTime(),
                size: formatFileSize(selectedFile.value.size)
              };
              fileDataStore.addShareData(uploadRecord);
              emit('upload-complete', uploadRecord);
              isUploading.value = false;
              isVerifying.value = false;
              return;
            }
          }
        } catch (error) {
          console.error(`分片 ${i + 1}/${chunks} 上传出错:`, error);
          if (error.response) {
            console.error('错误响应:', error.response.data);
          }
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('文件处理或上传过程中出错:', error);
  } finally {
    isUploading.value = false;
    isVerifying.value = false;
  }
};

const calculateExpireTime = () => {
  const now = new Date();
  switch (expireStyle.value) {
    case 'day':
      now.setDate(now.getDate() + parseInt(expireValue.value));
      break;
    case 'hour':
      now.setHours(now.getHours() + parseInt(expireValue.value));
      break;
    case 'minute':
      now.setMinutes(now.getMinutes() + parseInt(expireValue.value));
      break;
    case 'forever':
      return '永久有效';
    case 'count':
      return `${expireValue.value}次后过期`;
  }
  return now.toLocaleString();
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>
