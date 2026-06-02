<template>
  <transition name="fade">
    <div
      v-if="record"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        class="w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden"
        :class="[isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white bg-opacity-95']"
      >
        <div
          class="px-4 sm:px-6 py-3 sm:py-4 border-b"
          :class="[isDarkMode ? 'border-gray-800' : 'border-gray-100']"
        >
          <div class="flex items-center justify-between">
            <h3
              class="text-lg sm:text-xl font-semibold"
              :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
            >
              {{ t('send.fileDetails') }}
            </h3>
            <button
              @click="$emit('close')"
              class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XIcon
                class="w-4 h-4 sm:w-5 sm:h-5"
                :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
              />
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div
            class="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
            :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
          >
            <div class="flex items-center mb-3 sm:mb-4">
              <div class="p-2 sm:p-3 rounded-lg" :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']">
                <FileIcon
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
                />
              </div>
              <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                <h4
                  class="font-medium text-sm sm:text-base truncate"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
                >
                  {{ record.filename }}
                </h4>
                <p
                  class="text-xs sm:text-sm truncate"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                >
                  {{ record.size }} · {{ record.date }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div class="flex items-center min-w-0">
                <ClockIcon
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                />
                <span
                  class="text-xs sm:text-sm truncate"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  {{ record.expiration }}
                </span>
              </div>
              <div class="flex items-center min-w-0">
                <ShieldCheckIcon
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                />
                <span
                  class="text-xs sm:text-sm truncate"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  安全加密
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div class="space-y-3 sm:space-y-4">
              <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
                <div class="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 class="font-medium text-sm sm:text-base">取件码</h4>
                  <button
                    @click="$emit('copy-code', record)"
                    class="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ClipboardCopyIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p class="text-2xl sm:text-3xl font-bold tracking-wider text-center break-all">
                  {{ record.retrieveCode }}
                </p>
              </div>

              <div
                class="rounded-xl p-3 sm:p-4"
                :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
              >
                <div class="flex items-center justify-between mb-2 sm:mb-3">
                  <h4
                    class="font-medium text-sm sm:text-base flex items-center min-w-0"
                    :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
                  >
                    <TerminalIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0" />
                    <span class="truncate">wget下载</span>
                  </h4>
                  <button
                    @click="$emit('copy-wget', record)"
                    class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <ClipboardCopyIcon
                      class="w-4 h-4 sm:w-5 sm:h-5"
                      :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                    />
                  </button>
                </div>
                <p
                  class="text-xs sm:text-sm font-mono break-all line-clamp-2"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  点击复制wget命令
                </p>
              </div>
            </div>

            <div
              class="rounded-xl p-4 sm:p-5 flex flex-col items-center"
              :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
            >
              <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-3 sm:mb-4">
                <QRCode :value="qrValue" :size="140" level="M" class="sm:w-[160px] sm:h-[160px]" />
              </div>
              <p
                class="text-xs sm:text-sm truncate max-w-full"
                :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
              >
                扫描二维码快速取件
              </p>
            </div>
          </div>
        </div>

        <div
          class="px-4 sm:px-6 py-3 sm:py-4 border-t"
          :class="[isDarkMode ? 'border-gray-800' : 'border-gray-100']"
        >
          <button
            @click="$emit('copy-link', record)"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            复制取件链接
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import {
  ClipboardCopyIcon,
  ClockIcon,
  FileIcon,
  ShieldCheckIcon,
  TerminalIcon,
  XIcon
} from 'lucide-vue-next'
import QRCode from 'qrcode.vue'
import { useI18n } from 'vue-i18n'
import type { SentFileRecord } from '@/types'

const props = defineProps<{
  record: SentFileRecord | null
  getQRCodeValue: (record: SentFileRecord) => string
}>()

defineEmits<{
  close: []
  'copy-code': [record: SentFileRecord]
  'copy-link': [record: SentFileRecord]
  'copy-wget': [record: SentFileRecord]
}>()

const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
const qrValue = computed(() => (props.record ? props.getQRCodeValue(props.record) : ''))
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
</style>
