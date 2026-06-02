<template>
  <div
    class="min-h-screen px-4 py-16 transition-colors duration-300 sm:px-6 lg:px-8"
    @paste.prevent="handlePaste"
  >
    <main class="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center">
      <div class="grid w-full gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section
          class="rounded-3xl border p-6 shadow-2xl transition-colors duration-300 sm:p-8"
          :class="[
            isDarkMode
              ? 'border-gray-700 bg-gray-900/70 shadow-black/30'
              : 'border-white/80 bg-white/90 shadow-indigo-100'
          ]"
        >
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                type="button"
                @click="toRetrieve"
                class="text-left text-3xl font-extrabold leading-tight transition-colors"
                :class="[
                  isDarkMode
                    ? 'text-white hover:text-indigo-200'
                    : 'text-gray-950 hover:text-indigo-700'
                ]"
              >
                {{ config.name }}
              </button>
              <p
                class="mt-3 max-w-2xl text-sm leading-6"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
              >
                {{ config.description }}
              </p>
            </div>
            <router-link
              to="/"
              class="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition"
              :class="[
                isDarkMode
                  ? 'border-gray-700 text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/10'
                  : 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100'
              ]"
            >
              {{ t('send.needRetrieveFile') }}
            </router-link>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div
              v-for="item in workspaceStats"
              :key="item.label"
              class="rounded-2xl border px-4 py-3"
              :class="[
                isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50'
              ]"
            >
              <p class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                {{ item.label }}
              </p>
              <p
                class="mt-1 truncate text-sm font-semibold"
                :class="[isDarkMode ? 'text-gray-100' : 'text-gray-900']"
              >
                {{ item.value }}
              </p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="mt-8 space-y-7">
            <SendTypeSelector :selected-type="sendType" @update:selected-type="sendType = $event" />

            <transition name="fade" mode="out-in">
              <div v-if="sendType === 'file'" key="file" class="grid grid-cols-1 gap-8">
                <FileUploadArea
                  :selected-file="selectedFile"
                  :selected-files="selectedFiles"
                  :progress="uploadProgress"
                  :description="uploadDescription"
                  :upload-status="isSubmitting ? 'uploading' : 'idle'"
                  @file-selected="handleFileSelected"
                  @files-selected="handleFilesSelected"
                  @file-drop="handleFileDrop"
                />
              </div>
              <div v-else key="text" class="grid grid-cols-1 gap-8">
                <TextInputArea
                  v-model="textContent"
                  :rows="10"
                  :placeholder="t('send.uploadArea.textInput')"
                />
              </div>
            </transition>
            <ExpirationSelector
              v-model:expiration-method="expirationMethod"
              v-model:expiration-value="expirationValue"
              :options="expirationOptions"
            />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="group relative w-full overflow-hidden rounded-2xl bg-gray-950 px-6 py-4 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span
                class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
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
        </section>

        <aside class="grid gap-6">
          <section
            class="rounded-3xl border p-6 transition-colors duration-300"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-900/70' : 'border-white/80 bg-white/85']"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <p
                  class="text-sm font-medium"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  {{ t('send.workspace.currentTask') }}
                </p>
                <p
                  class="mt-2 text-2xl font-bold"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                >
                  {{ selectedPayloadLabel }}
                </p>
              </div>
              <ShieldCheckIcon class="h-10 w-10 text-emerald-400" />
            </div>

            <dl class="mt-6 space-y-3">
              <div
                v-for="item in readinessItems"
                :key="item.label"
                class="flex items-center justify-between gap-4 rounded-2xl px-4 py-3"
                :class="[isDarkMode ? 'bg-gray-800/70' : 'bg-gray-50']"
              >
                <dt class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                  {{ item.label }}
                </dt>
                <dd
                  class="text-right text-sm font-semibold"
                  :class="[isDarkMode ? 'text-gray-100' : 'text-gray-900']"
                >
                  {{ item.value }}
                </dd>
              </div>
            </dl>
          </section>

          <section
            class="rounded-3xl border p-6 transition-colors duration-300"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-900/70' : 'border-white/80 bg-white/85']"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <p
                  class="text-sm font-medium"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  {{ t('send.workspace.latestRecord') }}
                </p>
                <p
                  class="mt-2 text-xl font-bold"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                >
                  {{ latestRecord ? latestRecord.retrieveCode : t('send.workspace.noRecord') }}
                </p>
              </div>
              <ClipboardListIcon class="h-10 w-10 text-sky-400" />
            </div>

            <div v-if="latestRecord" class="mt-5 space-y-3">
              <p class="truncate text-sm" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']">
                {{ latestRecord.filename }}
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2 text-sm font-medium transition"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  ]"
                  @click="copySentRecordLink(latestRecord)"
                >
                  {{ t('send.workspace.copyLink') }}
                </button>
                <button
                  type="button"
                  class="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  :class="[isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600']"
                  @click="viewDetails(latestRecord)"
                >
                  {{ t('send.workspace.viewDetail') }}
                </button>
              </div>
            </div>
          </section>

          <section
            class="rounded-3xl border p-6 transition-colors duration-300"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-900/70' : 'border-white/80 bg-white/85']"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <p
                  class="text-sm font-medium"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  {{ t('send.workspace.historyTitle') }}
                </p>
                <p
                  class="mt-2 text-xl font-bold"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                >
                  {{ t('send.workspace.historyCount', { count: sendRecords.length }) }}
                </p>
              </div>
              <button
                type="button"
                @click="toggleDrawer"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full transition"
                :class="[
                  isDarkMode
                    ? 'bg-gray-800 text-indigo-200 hover:bg-gray-700'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                ]"
                :aria-label="t('send.workspace.openRecords')"
              >
                <ClipboardListIcon class="h-5 w-5" />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>

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
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { SendIcon, ClipboardListIcon, ShieldCheckIcon } from 'lucide-vue-next'
import SendTypeSelector from '@/components/common/SendTypeSelector.vue'
import FileUploadArea from '@/components/common/FileUploadArea.vue'
import ExpirationSelector from '@/components/common/ExpirationSelector.vue'
import TextInputArea from '@/components/common/TextInputArea.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import SentRecordList from '@/components/common/SentRecordList.vue'
import SentRecordDetailModal from '@/components/common/SentRecordDetailModal.vue'
import { useSendFlow } from '@/composables'
import { getStorageUnit } from '@/utils/convert'

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
  getUnit,
  toggleDrawer,
  viewDetails
} = useSendFlow()

const toRetrieve = () => {
  router.push('/')
}

const selectedFileCount = computed(() =>
  selectedFiles.value.length > 0 ? selectedFiles.value.length : selectedFile.value ? 1 : 0
)

const selectedPayloadLabel = computed(() => {
  if (sendType.value === 'text') {
    return t('send.workspace.textDraft', { count: textContent.value.trim().length })
  }
  if (selectedFileCount.value > 0) {
    return t('send.workspace.fileReady', { count: selectedFileCount.value })
  }
  return t('send.workspace.awaitingFile')
})

const latestRecord = computed(() => {
  if (sendRecords.value.length === 0) return null
  return sendRecords.value[sendRecords.value.length - 1]
})

const expirationPreview = computed(() => {
  if (expirationMethod.value === 'forever') {
    return getUnit('forever')
  }
  return `${expirationValue.value || 1} ${getUnit(expirationMethod.value)}`
})

const workspaceStats = computed(() => [
  {
    label: t('send.workspace.uploadLimit'),
    value: getStorageUnit(config.value.uploadSize)
  },
  {
    label: t('send.workspace.uploadMode'),
    value: config.value.enableChunk
      ? t('send.workspace.chunkMode')
      : t('send.workspace.standardMode')
  },
  {
    label: t('send.workspace.guestPolicy'),
    value: config.value.openUpload ? t('send.workspace.guestOpen') : t('send.workspace.guestClosed')
  }
])

const readinessItems = computed(() => [
  {
    label: t('send.workspace.payload'),
    value: selectedPayloadLabel.value
  },
  {
    label: t('send.workspace.expirationPreview'),
    value: expirationPreview.value
  },
  {
    label: t('send.workspace.security'),
    value: t('send.secureEncryption')
  }
])
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
