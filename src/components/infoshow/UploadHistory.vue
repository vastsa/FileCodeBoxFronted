<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-x-full opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform translate-x-full opacity-0"
  >
    <div
      v-show="isVisible"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      @click="closeHistory"
    >
      <div 
        class="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 h-full shadow-lg overflow-hidden transition-all duration-300"
        :class="[
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        ]"
        @click.stop
      >
        <div class="h-full flex flex-col">
          <div class="p-4 md:p-6 flex justify-between items-center border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h2 class="text-xl md:text-2xl font-bold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">上传记录</h2>
            <button
              @click="closeHistory"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'"
              class="transition duration-300 p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul class="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
            <li v-for="(upload, index) in uploads" :key="upload.code" 
                :class="[
                  'p-4 md:p-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg border relative',
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                ]">
              <div class="flex flex-col">
                <div class="flex-grow">
                  <p class="text-base md:text-lg font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">{{ upload.name }}</p>
                  <p class="text-sm md:text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    分享码: <span :class="isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'" class="font-mono px-2 py-1 rounded">{{ upload.code }}</span>
                  </p>
                  <p class="text-sm md:text-base mt-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    过期时间: {{ upload.expireTime }}
                  </p>
                </div>
                <div class="absolute bottom-4 right-4 flex space-x-2">
                  <button @click="viewDetails(upload, index)" 
                    :class="[
                      'flex items-center gap-1 transition duration-300',
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                    ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="handleDeleteUpload(upload, index)"
                    :class="[
                      'flex items-center gap-1 transition duration-300',
                      isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                    ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </transition>

  <FileDetailModal
    v-if="showModal"
    :isVisible="showModal"
    :fileInfo="selectedUpload"
    @close="closeModal"
  />
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue';
import FileDetailModal from '@/components/infoshow/FileDetailModal.vue';
import { useFileDataStore } from '@/stores/fileData';
import { useAlertStore } from '@/stores/alertStore';

const fileDataStore = useFileDataStore();
const alertStore = useAlertStore();

const uploads = fileDataStore.shareData;

const emit = defineEmits(['close']);

const isDarkMode = inject('isDarkMode');
const isVisible = ref(true);

const showModal = ref(false);
const selectedUpload = ref({});

// 响应式处理
const handleResize = () => {
  if (window.innerWidth < 768) { // 移动端
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('resize', handleResize);
});

const viewDetails = (upload, index) => {
  selectedUpload.value = {
    name: upload.name,
    date: upload.date,
    size: upload.size,
    expiryTime: upload.expireTime,
    code: upload.code
  };
  showModal.value = true;
};

const handleDeleteUpload = (upload, index) => {
  fileDataStore.deleteShareData(index);
  alertStore.showAlert("删除成功", "success");
};

const closeHistory = () => {
  isVisible.value = false;
  document.body.style.overflow = '';
  setTimeout(() => {
    emit('close');
  }, 300);
};

const closeModal = () => {
  showModal.value = false;
};
</script>
