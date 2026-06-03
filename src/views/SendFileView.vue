<template>
  <div
    class="transfer-page relative min-h-screen overflow-x-hidden px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8"
    :class="[isDarkMode ? 'text-slate-100' : 'text-slate-950']"
    @paste.prevent="handlePaste"
  >
    <main
      class="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-start lg:items-center"
    >
      <section
        class="grid w-full items-stretch gap-5 lg:grid-cols-[minmax(390px,1.04fr)_minmax(0,0.88fr)]"
      >
        <section
          class="rounded-[28px] border p-5 shadow-xl shadow-slate-900/5 sm:p-8"
          :class="[isDarkMode ? 'border-white/10 bg-slate-950/70' : 'border-white/90 bg-white/90']"
        >
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                class="text-sm font-medium"
                :class="[isDarkMode ? 'text-emerald-200' : 'text-emerald-700']"
              >
                {{ t('send.title') }}
              </p>
              <h1 class="mt-2 text-3xl font-semibold">
                {{ selectedPayloadLabel }}
              </h1>
            </div>
            <router-link
              to="/"
              class="inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-medium transition"
              :class="[
                isDarkMode
                  ? 'border-white/10 text-emerald-100 hover:border-emerald-300/40 hover:bg-emerald-300/10'
                  : 'border-emerald-100 bg-white text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50'
              ]"
            >
              <ArchiveRestoreIcon class="mr-2 h-4 w-4" />
              {{ t('send.needRetrieveFile') }}
            </router-link>
          </div>

          <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
            <div
              class="grid rounded-2xl border p-1 sm:grid-cols-2"
              :class="[
                isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-100/70'
              ]"
            >
              <button
                type="button"
                class="flex h-11 items-center justify-center rounded-xl text-sm font-medium transition"
                :class="[
                  sendType === 'file'
                    ? isDarkMode
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-white text-slate-950 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                ]"
                @click="sendType = 'file'"
              >
                <CloudUploadIcon class="mr-2 h-4 w-4" />
                {{ t('nav.sendFile') }}
              </button>
              <button
                type="button"
                class="flex h-11 items-center justify-center rounded-xl text-sm font-medium transition"
                :class="[
                  sendType === 'text'
                    ? isDarkMode
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-white text-slate-950 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                ]"
                @click="sendType = 'text'"
              >
                <TextCursorInputIcon class="mr-2 h-4 w-4" />
                {{ t('send.sendText') }}
              </button>
            </div>

            <transition name="fade" mode="out-in">
              <div v-if="sendType === 'file'" key="file" class="upload-shell">
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
              <div v-else key="text" class="text-shell">
                <TextInputArea
                  v-model="textContent"
                  :rows="9"
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
              class="group flex h-14 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="[
                isDarkMode
                  ? 'bg-emerald-500 hover:bg-emerald-400'
                  : 'bg-slate-950 hover:bg-slate-800'
              ]"
            >
              <span
                v-if="isSubmitting"
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              ></span>
              <SendIcon v-else class="mr-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              {{ isSubmitting ? t('send.submitting') : t('send.submit') }}
            </button>
          </form>
        </section>

        <aside
          class="flex min-h-0 flex-col justify-between rounded-[28px] border p-5 shadow-sm sm:p-8 lg:min-h-[520px]"
          :class="[
            isDarkMode
              ? 'border-white/10 bg-slate-950/45 shadow-black/20'
              : 'border-white/80 bg-white/70 shadow-slate-200/70'
          ]"
        >
          <div>
            <button
              type="button"
              class="flex min-w-0 items-center gap-3 text-left"
              @click="toRetrieve"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                :class="[
                  isDarkMode
                    ? 'bg-emerald-400/15 text-emerald-200'
                    : 'bg-emerald-50 text-emerald-700'
                ]"
              >
                <BoxIcon class="h-5 w-5" />
              </span>
              <span class="min-w-0">
                <span class="block truncate text-lg font-semibold">
                  {{ config.name }}
                </span>
                <span
                  class="mt-1 block text-xs"
                  :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']"
                >
                  FileCodeBox
                </span>
              </span>
            </button>

            <div class="mt-8 max-w-xl lg:mt-14">
              <p
                class="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-medium"
                :class="[
                  isDarkMode
                    ? 'bg-emerald-400/10 text-emerald-200'
                    : 'bg-emerald-50 text-emerald-700'
                ]"
              >
                {{ t('send.secureEncryption') }}
              </p>
              <h2 class="text-4xl font-semibold leading-tight sm:text-5xl">
                {{ t('nav.sendFile') }}
              </h2>
              <p
                class="mt-5 max-w-lg text-sm leading-7"
                :class="[isDarkMode ? 'text-slate-300' : 'text-slate-600']"
              >
                {{ config.description || t('common.appDescription') }}
              </p>
            </div>

            <div class="mt-7 grid gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-1 xl:grid-cols-3">
              <div
                v-for="item in workspaceStats"
                :key="item.label"
                class="rounded-2xl border px-4 py-3"
                :class="[
                  isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200/70 bg-white/75'
                ]"
              >
                <p class="text-xs" :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']">
                  {{ item.label }}
                </p>
                <p class="mt-1 truncate text-sm font-semibold">
                  {{ item.value }}
                </p>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button
                type="button"
                class="rounded-2xl border p-4 text-left transition"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
                @click="toggleDrawer"
              >
                <ClipboardListIcon class="h-5 w-5 text-emerald-500" />
                <p class="mt-3 text-sm font-medium">{{ t('send.sendRecords') }}</p>
                <p class="mt-1 text-xs" :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']">
                  {{ t('send.workspace.historyCount', { count: sendRecords.length }) }}
                </p>
              </button>

              <button
                type="button"
                class="rounded-2xl border p-4 text-left transition"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ]"
                @click="viewLatestRecord"
              >
                <ClockIcon class="h-5 w-5 text-slate-400" />
                <p class="mt-3 text-sm font-medium">{{ t('send.workspace.latestRecord') }}</p>
                <p
                  class="mt-1 truncate text-xs"
                  :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']"
                >
                  {{ latestRecord ? latestRecord.retrieveCode : t('send.workspace.noRecord') }}
                </p>
              </button>
            </div>
          </div>

          <div
            class="mt-7 rounded-2xl border p-4 lg:mt-10"
            :class="[
              isDarkMode ? 'border-white/10 bg-slate-900/45' : 'border-slate-200/70 bg-white/65'
            ]"
          >
            <div class="flex items-start gap-3">
              <ShieldCheckIcon class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <p class="text-sm font-medium">
                  {{ t('send.workspace.security') }}
                </p>
                <p
                  class="mt-1 text-xs leading-5"
                  :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']"
                >
                  {{ t('send.secureEncryption') }} · {{ expirationPreview }}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ArchiveRestoreIcon,
  BoxIcon,
  ClipboardListIcon,
  ClockIcon,
  CloudUploadIcon,
  SendIcon,
  ShieldCheckIcon,
  TextCursorInputIcon
} from 'lucide-vue-next'
import FileUploadArea from '@/components/common/FileUploadArea.vue'
import ExpirationSelector from '@/components/common/ExpirationSelector.vue'
import TextInputArea from '@/components/common/TextInputArea.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import SentRecordList from '@/components/common/SentRecordList.vue'
import SentRecordDetailModal from '@/components/common/SentRecordDetailModal.vue'
import { useInjectedDarkMode, useSendFlow } from '@/composables'
import { getStorageUnit } from '@/utils/convert'

const isDarkMode = useInjectedDarkMode()
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
  getUnit,
  handleFileDrop,
  handleFileSelected,
  handleFilesSelected,
  handlePaste,
  handleSubmit,
  toggleDrawer,
  viewDetails
} = useSendFlow()

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

const toRetrieve = () => {
  router.push('/')
}

const viewLatestRecord = () => {
  if (latestRecord.value) {
    viewDetails(latestRecord.value)
  } else {
    toggleDrawer()
  }
}
</script>

<style scoped>
.transfer-page::before {
  position: fixed;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(to right, rgb(148 163 184 / 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(148 163 184 / 0.12) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

:deep(.upload-shell > div) {
  min-height: 18rem;
  border-radius: 1.5rem;
}

:deep(.text-shell textarea) {
  min-height: 18rem;
  border-radius: 1.5rem;
}
</style>
