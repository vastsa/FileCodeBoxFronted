<template>
  <div class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300"
       :class="[isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-100 to-purple-100']">
    <div class="w-full max-w-4xl relative z-10">
      <div class="rounded-3xl shadow-2xl overflow-hidden border transform transition-all duration-300 hover:scale-105"
           :class="[isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-xl border-gray-600' : 'bg-white border-gray-200']">
        <div class="p-4 sm:p-6 md:p-8">
          <div class="flex justify-center mb-4 sm:mb-6">
            <div class="rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 p-1 animate-pulse">
              <div class="rounded-full bg-white p-2">
                <CloudDownloadIcon class="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" @click="handleCloudDownloadIconClick" />
              </div>
            </div>
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold mb-4 sm:mb-6 text-center animate-pulse cursor-pointer"
              :class="[isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300' : 'text-indigo-600']"
              @click="toSend">
            文件分享
          </h1>
          
          <div class="mb-6 sm:mb-8">
            <ul class="flex border-b justify-center" :class="[isDarkMode ? 'border-gray-600' : 'border-gray-200']">
              <li class="mr-1" v-for="tab in ['文件上传', '文本分享']" :key="tab">
                <a class="inline-block py-2 px-3 sm:px-4 text-sm sm:text-base font-semibold transition duration-300 transform hover:scale-110" 
                   :class="[
                     isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-600 hover:text-blue-800',
                     { 'border-b-2 border-indigo-600': activeTab === tab }
                   ]"
                   href="#" @click.prevent="activeTab = tab">
                  {{ tab }}
                </a>
              </li>
            </ul>
            
            <div class="mt-4 sm:mt-6">
              <file-uploader 
                v-if="activeTab === '文件上传'"
                @file-selected="handleFileSelected"
                @upload-progress="handleUploadProgress"
                @upload-complete="handleUploadComplete"
                class="mb-4"
              />
              <text-uploader
                v-else
                @text-uploaded="handleTextUploaded"
                class="mb-4"
              />
            </div>
          </div>
          <div v-if="uploadResult" class="p-3 sm:p-4 rounded-lg shadow-md animate-fadeIn"
               :class="[isDarkMode ? 'bg-gray-700' : 'bg-white']">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']" class="mb-2 sm:mb-0">
                分享码: <span class="font-mono px-2 py-1 rounded text-sm sm:text-base" :class="[isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-blue-100 text-blue-700']">{{ uploadResult.code }}</span>
              </p>
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                名称:
                <span :class="[isDarkMode ? 'text-gray-100' : 'text-gray-800']" class="font-semibold text-sm sm:text-base">{{ uploadResult.type === 'text' ? '文本内容' : uploadResult.name }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-4 right-4 z-50">
      <button
        @click="toggleHistory"
        class="rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center hover:bg-opacity-90 transform hover:scale-110 hover:rotate-3 text-xs sm:text-base"
        :class="[
          isDarkMode ? 'bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg text-indigo-400 focus:ring-indigo-500' : 'bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg text-blue-600 focus:ring-blue-500'
        ]"
      >
        <span class="font-medium">{{ showHistory ? '关闭记录' : '上传记录' }}</span>
      </button>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-95 translate-y-full"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-full"
    >
      <UploadHistory
        v-if="showHistory"
        @close="toggleHistory"
        class="fixed bottom-0 left-0 right-0 z-50"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import FileUploader from '@/components/upload/FileUploader.vue';
import TextUploader from '@/components/upload/TextUploader.vue';
import UploadHistory from '@/components/infoshow/UploadHistory.vue';
import { useFileDataStore } from '@/stores/fileData';
import { useAlertStore } from '@/stores/alertStore'
const router = useRouter();
const isDarkMode = inject('isDarkMode');
const uploadResult = ref(null);
const activeTab = ref('文件上传');
const showHistory = ref(false);
const fileDataStore = useFileDataStore();
const showFileDetail = ref(false);
const selectedFileInfo = ref(null);
const alertStore = useAlertStore()
const handleFileSelected = (file) => {
  console.log('文件已选择:', file.name);
};

const handleUploadProgress = (progress) => {
  console.log('上传进度:', progress);
};

const handleUploadComplete = (result) => {
  console.log('上传完成:', result);
  uploadResult.value = result;
  selectedFileInfo.value = {
    name: result.name,
    code: result.code,
    size: result.size || '0.0 MB',
    expiryTime: result.expiryTime,
    date: result.date,
  };
  showFileDetail.value = true;
  fileDataStore.addShareData(selectedFileInfo.value);
  alertStore.showAlert("上传成功", "success")
};

const handleTextUploaded = (result) => {
  console.log('文本上传完成:', result);
  uploadResult.value = result;
  uploadResult.value.type = "text"
  selectedFileInfo.value = {
    name: '文本分享',
    code: result.code,
    size: result.size,
    expiryTime: result.expiryTime,
    date: result.date,
  };
  showFileDetail.value = true;
  fileDataStore.addShareData(selectedFileInfo.value);
  alertStore.showAlert("上传成功", "success")
  console.log("上传成功'''");
  
};

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
};

const toSend = () => {
  router.push('/send');
};

const clickCount = ref(0);
const handleIconClick = () => {
  clickCount.value++;
  if (clickCount.value === 5) {
    router.push('/admin');
    clickCount.value = 0;
  }
};

</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
