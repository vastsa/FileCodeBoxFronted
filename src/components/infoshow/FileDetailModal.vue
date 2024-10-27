<template>
  <transition name="modal-fade">
    <div class="fixed inset-0 flex items-center justify-center z-50" v-if="isVisible">
      <div class="absolute inset-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm" @click="closeModal"></div>
      <div :class="[
        'rounded-lg shadow-2xl p-8 w-full max-w-md transform transition-all duration-300',
        isDarkMode ? 'bg-gray-800 bg-opacity-80 text-gray-200' : 'bg-white bg-opacity-80 text-gray-700'
      ]">
        <h3 class="text-3xl font-bold mb-6 text-center transition-all duration-300">文件详情</h3>
        <div class="space-y-4">
          <div class="flex items-center transition-all duration-300 hover:transform hover:scale-105">
            <i class="fas fa-file-alt text-2xl mr-3 text-gray-400"></i>
            <div>
              <span class="text-sm text-gray-400">文件名</span>
              <p class="font-semibold truncate text-lg">{{ fileInfo.name }}</p>
            </div>
          </div>
          <div class="flex items-center transition-all duration-300 hover:transform hover:scale-105">
            <i class="fas fa-calendar-alt text-2xl mr-3 text-gray-400"></i>
            <div>
              <span class="text-sm text-gray-400">发送日期</span>
              <p class="font-semibold text-lg">{{ fileInfo.date }}</p>
            </div>
          </div>
          <div class="flex items-center transition-all duration-300 hover:transform hover:scale-105">
            <i class="fas fa-weight-hanging text-2xl mr-3 text-gray-400"></i>
            <div>
              <span class="text-sm text-gray-400">文件大小</span>
              <p class="font-semibold text-lg">{{fileInfo.size}}</p>
            </div>
          </div>
          <div class="flex items-center transition-all duration-300 hover:transform hover:scale-105">
            <i class="fas fa-hourglass-end text-2xl mr-3 text-gray-400"></i>
            <div>
              <span class="text-sm text-gray-400">过期时间</span>
              <p class="font-semibold text-lg">{{ fileInfo.expiryTime }}</p>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <div class="flex flex-col items-center mb-6">
            <span class="mb-3 text-lg font-medium transition-all duration-300">取件码</span>
            <button 
              @click="copyCode" 
              :class="[
                'code-btn text-3xl font-mono px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg',
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              ]"
            >
              {{ fileInfo.code }}
              <span class="copy-text text-sm block mt-2 opacity-0 transition-opacity duration-300">点击复制</span>
            </button>
          </div>
          <button :class="[
            'close-btn w-full rounded-lg px-6 py-3 transition-all duration-300 transform hover:scale-105 shadow-md',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          ]" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, inject, ref } from 'vue';
import { useAlertStore } from '@/stores/alertStore';

const props = defineProps({
  isVisible: Boolean,
  fileInfo: Object
});

const emit = defineEmits(['close']);
const isDarkMode = inject('isDarkMode');
const alertStore = useAlertStore();

const closeModal = () => {
  emit('close');
};

const copyCode = () => {
  navigator.clipboard.writeText(props.fileInfo.code)
    .then(() => {
      alertStore.showAlert('取件码已复制到剪贴板', 'success');
    })
    .catch(err => {
      console.error('复制失败:', err);
      alertStore.showAlert('复制失败，请手动复制', 'error');
    });
};

</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.code-btn,
.close-btn {
  font-family: 'Roboto', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.code-btn:hover .copy-text {
  opacity: 1;
}
</style>
