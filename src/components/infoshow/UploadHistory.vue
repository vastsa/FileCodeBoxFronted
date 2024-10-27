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
      v-if="isVisible"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      @click="closeHistory"
    >
      <div 
        class="w-1/4 h-full shadow-lg overflow-hidden"
        :class="[
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        ]"
        @click.stop
      >
        <div class="h-full flex flex-col">
          <div class="p-4 flex justify-between items-center border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">上传记录</h2>
            <button
              @click="closeHistory"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'"
              class="transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul class="flex-grow overflow-y-auto p-4 space-y-4">
            <li v-for="upload in uploads" :key="upload.code" 
                :class="[
                  'p-4 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg border',
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                ]">
              <div class="flex justify-between items-center">
                <div class="flex-grow">
                  <p class="text-lg font-semibold mb-1" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">{{ upload.name }}</p>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    分享码: <span :class="isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'" class="font-mono px-2 py-1 rounded">{{ upload.code }}</span>
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button @click="viewDetails(upload, index)" :class="isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'" class="transition duration-300 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="handleDeleteUpload(upload, index)" :class="isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'" class="transition duration-300 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { ref, inject } from 'vue';
import FileDetailModal from '@/components/infoshow/FileDetailModal.vue';
import { useFileDataStore } from '@/stores/fileData';

const fileDataStore = useFileDataStore();

const uploads = fileDataStore.shareData

const emit = defineEmits(['close']);

const isDarkMode = inject('isDarkMode');
const isVisible = ref(true);

const showModal = ref(false);
const selectedUpload = ref({});

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
  console.log("删除成功");
};

const closeHistory = () => {
  isVisible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

const closeModal = () => {
  showModal.value = false;
};
</script>
