<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300"
    @paste.prevent="handlePaste"
  >
    <div
      class="rounded-3xl shadow-2xl overflow-hidden border w-full max-w-md transition-colors duration-300"
      :class="[
        isDarkMode
          ? 'bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl border-gray-700'
          : 'bg-white border-gray-200'
      ]"
    >
      <div class="p-8">
        <PageHeader :title="config.name" @title-click="toRetrieve" />
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <SendTypeSelector
            :selected-type="sendType"
            @update:selected-type="sendType = $event"
          />

          <transition name="fade" mode="out-in">
            <div v-if="sendType === 'file'" key="file" class="grid grid-cols-1 gap-8">
              <FileUploadArea
                :selected-file="selectedFile"
                :selected-files="selectedFiles"
                :progress="uploadProgress"
                :description="uploadDescription"
                @file-selected="handleFileSelected"
                @files-selected="handleFilesSelected"
                @file-drop="handleFileDrop"
              />
            </div>
            <div v-else key="text" class="grid grid-cols-1 gap-8">
              <TextInputArea v-model="textContent" :placeholder="t('send.uploadArea.textInput')" />
            </div>
          </transition>
          <ExpirationSelector
            v-model:expiration-method="expirationMethod"
            v-model:expiration-value="expirationValue"
            :options="expirationOptions"
          />
          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
          >
            <span
              class="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></span>
            <span class="relative z-10 flex items-center justify-center text-lg">
              <svg
                v-if="isSubmitting"
                class="w-6 h-6 mr-2 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <SendIcon v-else class="w-6 h-6 mr-2" />
              <span>{{ isSubmitting ? t('send.submitting') : t('send.submit') }}</span>
            </span>
          </button>
        </form>
        <div class="mt-6 text-center">
          <router-link to="/" class="text-indigo-400 hover:text-indigo-300 transition duration-300">
            {{ t('send.needRetrieveFile') }}
          </router-link>
        </div>
      </div>

      <div
        class="px-8 py-4 bg-opacity-50 flex justify-between items-center"
        :class="[isDarkMode ? 'bg-gray-800' : 'bg-gray-100']"
      >
        <span
          class="text-sm flex items-center"
          :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
        >
          <ShieldCheckIcon class="w-4 h-4 mr-1 text-green-400" />
          {{ t('send.secureEncryption') }}
        </span>
        <button
          @click="toggleDrawer"
          class="text-sm hover:text-indigo-300 transition duration-300 flex items-center"
          :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
        >
          {{ t('send.sendRecords') }}
          <ClipboardListIcon class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>

    <SideDrawer :visible="showDrawer" :title="t('send.sendRecords')" @close="toggleDrawer">
      <SentRecordList
        :records="sendRecords"
        @copy-link="copySentRecordLink"
        @view-details="viewDetails"
        @delete-record="deleteRecord"
      />
    </SideDrawer>

    <SentRecordDetailModal
      :record="selectedRecord"
      :get-q-r-code-value="getQRCodeValue"
      @close="closeDetails"
      @copy-code="copySentRecordCode"
      @copy-link="copySentRecordLink"
      @copy-wget="copySentRecordWgetCommand"
    />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  SendIcon,
  ClipboardListIcon,
  ShieldCheckIcon
} from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import SendTypeSelector from '@/components/common/SendTypeSelector.vue'
import FileUploadArea from '@/components/common/FileUploadArea.vue'
import ExpirationSelector from '@/components/common/ExpirationSelector.vue'
import TextInputArea from '@/components/common/TextInputArea.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import SentRecordList from '@/components/common/SentRecordList.vue'
import SentRecordDetailModal from '@/components/common/SentRecordDetailModal.vue'
import { useSendFlow } from '@/composables'

const isDarkMode = inject('isDarkMode')
const { t } = useI18n()
const router = useRouter()
const {
  config,
  sendType,
  selectedFile,
  selectedFiles,
  textContent,
  expirationMethod,
  expirationValue,
  uploadProgress,
  showDrawer,
  selectedRecord,
  isSubmitting,
  sendRecords,
  uploadDescription,
  expirationOptions,
  closeDetails,
  copySentRecordCode,
  copySentRecordLink,
  copySentRecordWgetCommand,
  deleteRecord,
  getQRCodeValue,
  handleFileDrop,
  handleFileSelected,
  handleFilesSelected,
  handlePaste,
  handleSubmit,
  toggleDrawer,
  viewDetails
} = useSendFlow()

const toRetrieve = () => {
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

select option {
  padding: 8px;
  margin: 4px;
  border-radius: 6px;
}

select option:checked {
  background: linear-gradient(to right, rgb(99 102 241 / 0.5), rgb(168 85 247 / 0.5)) !important;
  color: white !important;
}

.dark select option:checked {
  background: linear-gradient(to right, rgb(99 102 241 / 0.7), rgb(168 85 247 / 0.7)) !important;
}

select option:hover {
  background-color: rgb(99 102 241 / 0.1);
}

.dark select option:hover {
  background-color: rgb(99 102 241 / 0.2);
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) rgba(243, 244, 246, 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.3);
  border-radius: 6px;
  margin: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6));
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
  transform: scale(1.1);
}

.custom-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}

/* 深色模式下的滚动条样式 */
.dark .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.6) rgba(31, 41, 55, 0.4);
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.4);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(168, 85, 247, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9));
}
</style>
