<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out sm:p-8"
        :class="isDarkMode ? 'border-zinc-800 bg-zinc-950/95' : 'border-white/50 bg-white/95'"
      >
        <h3
          class="mb-6 truncate text-xl font-semibold tracking-tight sm:text-2xl"
          :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
        >
          {{ t('fileDetail.title') }}
        </h3>
        <div class="space-y-4" v-if="record">
          <div class="flex items-center">
            <FileIcon
              class="mr-3 h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
              :class="isDarkMode ? 'text-zinc-200' : 'text-zinc-800'"
            />
            <p class="truncate flex-grow" :class="isDarkMode ? 'text-zinc-300' : 'text-slate-700'">
              <span class="font-medium">{{ t('fileRecord.filename') }}：</span>{{ record.filename }}
            </p>
          </div>
          <div class="flex items-center">
            <CalendarIcon
              class="mr-3 h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
              :class="isDarkMode ? 'text-zinc-200' : 'text-zinc-800'"
            />
            <p class="truncate flex-grow" :class="isDarkMode ? 'text-zinc-300' : 'text-slate-700'">
              <span class="font-medium">{{ t('fileRecord.date') }}：</span>{{ record.date }}
            </p>
          </div>
          <div class="flex items-center">
            <HardDriveIcon
              class="mr-3 h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
              :class="isDarkMode ? 'text-zinc-200' : 'text-zinc-800'"
            />
            <p class="truncate flex-grow" :class="isDarkMode ? 'text-zinc-300' : 'text-slate-700'">
              <span class="font-medium">{{ t('fileRecord.size') }}：</span>{{ record.size }}
            </p>
          </div>
          <div class="flex items-center">
            <DownloadIcon
              class="mr-3 h-5 w-5 sm:h-6 sm:w-6"
              :class="isDarkMode ? 'text-zinc-200' : 'text-zinc-800'"
            />
            <p :class="isDarkMode ? 'text-zinc-300' : 'text-slate-700'">
              <span class="font-medium">{{ t('fileDetail.content') }}：</span>
            </p>
            <div v-if="record.filename === 'Text'" class="ml-2">
              <button
                @click="$emit('preview-content')"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition duration-300"
                :class="
                  isDarkMode
                    ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
                    : 'bg-zinc-800 text-white hover:bg-zinc-900'
                "
              >
                {{ t('fileDetail.previewContent') }}
              </button>
            </div>
            <div v-else class="ml-2 flex flex-wrap gap-2">
              <button
                v-if="isPreviewable(record)"
                type="button"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition duration-300"
                :class="
                  isDarkMode
                    ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
                    : 'bg-zinc-800 text-white hover:bg-zinc-900'
                "
                @click="$emit('preview-file')"
              >
                {{ t('fileRecord.preview') }}
              </button>
              <a
                :href="getDownloadUrl(record)"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition duration-300"
                :class="
                  isDarkMode
                    ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
                    : 'bg-zinc-800 text-white hover:bg-zinc-900'
                "
              >
                {{ t('fileDetail.download') }}
              </a>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col items-center" v-if="record">
          <h4
            class="mb-3 text-lg font-semibold"
            :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
          >
            {{ t('fileDetail.qrCode') }}
          </h4>
          <div class="rounded-xl bg-white p-2 shadow-md">
            <QRCode :value="getQRCodeValue(record)" :size="128" level="M" />
          </div>
          <p class="mt-2 text-sm" :class="isDarkMode ? 'text-zinc-400' : 'text-slate-500'">
            {{ t('fileDetail.scanQrCode') }}
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="mt-8 w-full rounded-xl px-6 py-3 font-semibold transition duration-300 hover:-translate-y-0.5 sm:rounded-2xl"
          :class="
            isDarkMode
              ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
              : 'bg-zinc-800 text-white hover:bg-zinc-900'
          "
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
import type { ReceivedFileRecord } from '@/types'
import { buildDownloadUrl, buildReceivedRecordQrValue } from '@/utils/share-url'

interface Props {
  visible: boolean
  record: ReceivedFileRecord | null
}

interface Emits {
  close: []
  'preview-content': []
  'preview-file': []
}

defineProps<Props>()
defineEmits<Emits>()
const { t } = useI18n()
const isDarkMode = inject('isDarkMode')

const getDownloadUrl = (record: ReceivedFileRecord) => {
  return buildDownloadUrl(record.downloadUrl)
}

const getQRCodeValue = (record: ReceivedFileRecord) => {
  return buildReceivedRecordQrValue(record)
}

const isPreviewable = (record: ReceivedFileRecord) => {
  if (!record.downloadUrl) return false
  const extension = record.filename.split('.').pop()?.toLowerCase() || ''
  return [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',
    'mp4',
    'webm',
    'ogg',
    'mov',
    'm4v',
    'mp3',
    'wav',
    'm4a',
    'flac',
    'pdf'
  ].includes(extension)
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
