<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="$emit('close')"
    >
      <div
        class="p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 ease-out backdrop-filter backdrop-blur-lg overflow-hidden"
        :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white bg-opacity-95']"
      >
        <h3
          class="text-2xl font-bold mb-6 truncate"
          :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
        >
          {{ t('fileDetail.title') }}
        </h3>
        <div class="space-y-4" v-if="record">
          <div class="flex items-center">
            <FileIcon
              class="w-6 h-6 mr-3 flex-shrink-0"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
            <p
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
              class="truncate flex-grow"
            >
              <span class="font-medium">{{ t('fileRecord.filename') }}：</span>{{ record.filename }}
            </p>
          </div>
          <div class="flex items-center">
            <CalendarIcon
              class="w-6 h-6 mr-3 flex-shrink-0"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
            <p
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
              class="truncate flex-grow"
            >
              <span class="font-medium">{{ t('fileRecord.date') }}：</span>{{ record.date }}
            </p>
          </div>
          <div class="flex items-center">
            <HardDriveIcon
              class="w-6 h-6 mr-3 flex-shrink-0"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
            <p
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
              class="truncate flex-grow"
            >
              <span class="font-medium">{{ t('fileRecord.size') }}：</span>{{ record.size }}
            </p>
          </div>
          <div class="flex items-center">
            <DownloadIcon
              class="w-6 h-6 mr-3"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
            <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']">
              <span class="font-medium">{{ t('fileDetail.content') }}：</span>
            </p>
            <div v-if="record.filename === 'Text'" class="ml-2">
              <button
                @click="$emit('preview-content')"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                {{ t('fileDetail.previewContent') }}
              </button>
            </div>
            <div v-else>
              <a
                :href="getDownloadUrl(record)"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                {{ t('fileDetail.download') }}
              </a>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col items-center" v-if="record">
          <h4
            class="text-lg font-semibold mb-3"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ t('fileDetail.qrCode') }}
          </h4>
          <div class="bg-white p-2 rounded-lg shadow-md">
            <QRCode :value="getQRCodeValue(record)" :size="128" level="M" />
          </div>
          <p class="mt-2 text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
            {{ t('fileDetail.scanQrCode') }}
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="mt-8 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileIcon, CalendarIcon, HardDriveIcon, DownloadIcon } from 'lucide-vue-next'
import QRCode from 'qrcode.vue'

interface FileRecord {
  id: number
  code: string
  filename: string
  size: string
  downloadUrl: string | null
  content: string | null
  date: string
}

interface Props {
  visible: boolean
  record: FileRecord | null
}

interface Emits {
  close: []
  'preview-content': []
}

defineProps<Props>()
defineEmits<Emits>()
const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
const baseUrl = window.location.origin

const getDownloadUrl = (record: FileRecord) => {
  if (record.downloadUrl) {
    if (record.downloadUrl.startsWith('http')) {
      return record.downloadUrl
    } else {
      return `${baseUrl}${record.downloadUrl}`
    }
  }
  return ''
}

const getQRCodeValue = (record: FileRecord) => {
  if (record.downloadUrl) {
    return `${baseUrl}${record.downloadUrl}`
  } else {
    return `${baseUrl}?code=${record.code}`
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>