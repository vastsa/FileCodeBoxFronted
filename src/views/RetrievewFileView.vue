<template>
  <div class="min-h-screen px-4 py-12 transition-colors duration-300 sm:px-6 lg:px-8">
    <main class="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
      <div class="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section
          class="rounded-3xl border p-6 shadow-2xl transition-colors duration-300 sm:p-8"
          :class="[
            isDarkMode
              ? 'border-gray-700 bg-gray-900/70 shadow-black/30'
              : 'border-white/80 bg-white/90 shadow-sky-100'
          ]"
        >
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                type="button"
                @click="toSend"
                class="text-left text-3xl font-extrabold leading-tight transition-colors"
                :class="[
                  isDarkMode ? 'text-white hover:text-sky-200' : 'text-gray-950 hover:text-sky-700'
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
              to="/send"
              class="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition"
              :class="[
                isDarkMode
                  ? 'border-gray-700 text-sky-200 hover:border-sky-400 hover:bg-sky-500/10'
                  : 'border-sky-100 bg-sky-50 text-sky-700 hover:border-sky-200 hover:bg-sky-100'
              ]"
            >
              <SendIcon class="mr-2 h-4 w-4" />
              {{ t('retrieve.workspace.sendFile') }}
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

          <form class="mt-8 space-y-4" @submit.prevent="inspectCode">
            <label
              for="retrieve-code"
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-200' : 'text-gray-800']"
            >
              {{ t('retrieve.codeInput.label') }}
            </label>
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                id="retrieve-code"
                v-model="code"
                type="text"
                inputmode="text"
                maxlength="5"
                autocomplete="one-time-code"
                class="h-12 w-full rounded-2xl border px-4 text-lg font-semibold tracking-[0.2em] outline-none transition focus:ring-2 focus:ring-sky-500"
                :class="[
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500'
                    : 'border-gray-200 bg-white text-gray-950 placeholder-gray-400',
                  error ? 'border-red-400 focus:ring-red-400' : ''
                ]"
                :placeholder="t('retrieve.codeInput.placeholder')"
                :readonly="isWorking"
              />

              <BaseButton
                type="submit"
                variant="secondary"
                :loading="isInspecting"
                :disabled="!hasValidCode || isRetrieving"
              >
                <template #icon>
                  <SearchIcon class="mr-2 h-4 w-4" />
                </template>
                {{
                  isInspecting
                    ? t('retrieve.workspace.inspecting')
                    : t('retrieve.workspace.inspect')
                }}
              </BaseButton>

              <BaseButton
                type="button"
                :loading="isRetrieving"
                :disabled="!hasValidCode || isInspecting"
                @click="handleSubmit"
              >
                <template #icon>
                  <DownloadCloudIcon class="mr-2 h-4 w-4" />
                </template>
                {{ isRetrieving ? t('retrieve.workspace.retrieving') : t('retrieve.submit') }}
              </BaseButton>
            </div>

            <p v-if="error" class="text-sm text-red-500">
              {{ error }}
            </p>
          </form>

          <section
            class="mt-8 rounded-3xl border p-5"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50']"
          >
            <div v-if="inspectedFile" class="space-y-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 items-start gap-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    :class="[isDarkMode ? 'bg-sky-500/15 text-sky-200' : 'bg-sky-100 text-sky-700']"
                  >
                    <FileTextIcon v-if="inspectedFile.is_text" class="h-5 w-5" />
                    <FileIcon v-else class="h-5 w-5" />
                  </div>
                  <div class="min-w-0">
                    <p
                      class="truncate text-lg font-bold"
                      :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                    >
                      {{ inspectedFile.name }}
                    </p>
                    <p
                      class="mt-1 text-sm"
                      :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                    >
                      {{ inspectedTypeLabel }}
                    </p>
                  </div>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="[
                    isDarkMode
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : 'bg-emerald-100 text-emerald-700'
                  ]"
                >
                  {{ t('retrieve.workspace.ready') }}
                </span>
              </div>

              <dl class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="item in inspectedMetaItems"
                  :key="item.label"
                  class="rounded-2xl px-4 py-3"
                  :class="[isDarkMode ? 'bg-gray-900/70' : 'bg-white']"
                >
                  <dt class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                    {{ item.label }}
                  </dt>
                  <dd
                    class="mt-1 truncate text-sm font-semibold"
                    :class="[isDarkMode ? 'text-gray-100' : 'text-gray-900']"
                  >
                    {{ item.value }}
                  </dd>
                </div>
              </dl>
            </div>

            <div v-else class="flex min-h-48 flex-col items-center justify-center text-center">
              <PackageSearchIcon
                class="h-12 w-12"
                :class="[isDarkMode ? 'text-gray-500' : 'text-gray-300']"
              />
              <p
                class="mt-4 text-lg font-semibold"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
              >
                {{ t('retrieve.workspace.noPreview') }}
              </p>
              <p
                class="mt-2 max-w-md text-sm"
                :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
              >
                {{ t('retrieve.workspace.noPreviewDesc') }}
              </p>
            </div>
          </section>
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
                  {{ t('retrieve.workspace.latestRecord') }}
                </p>
                <p
                  class="mt-2 text-xl font-bold"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                >
                  {{ latestRecord ? latestRecord.filename : t('retrieve.workspace.noRecord') }}
                </p>
              </div>
              <ArchiveRestoreIcon class="h-10 w-10 text-emerald-400" />
            </div>

            <div v-if="latestRecord" class="mt-5 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-2xl px-4 py-3"
                  :class="[isDarkMode ? 'bg-gray-800/70' : 'bg-gray-50']"
                >
                  <p class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                    {{ t('retrieve.workspace.currentCode') }}
                  </p>
                  <p
                    class="mt-1 text-sm font-semibold"
                    :class="[isDarkMode ? 'text-gray-100' : 'text-gray-900']"
                  >
                    {{ latestRecord.code }}
                  </p>
                </div>
                <div
                  class="rounded-2xl px-4 py-3"
                  :class="[isDarkMode ? 'bg-gray-800/70' : 'bg-gray-50']"
                >
                  <p class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                    {{ t('retrieve.workspace.fileSize') }}
                  </p>
                  <p
                    class="mt-1 text-sm font-semibold"
                    :class="[isDarkMode ? 'text-gray-100' : 'text-gray-900']"
                  >
                    {{ latestRecord.size }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2 text-sm font-medium transition"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  ]"
                  @click="viewDetails(latestRecord)"
                >
                  {{ t('retrieve.workspace.viewDetail') }}
                </button>
                <button
                  type="button"
                  class="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  :class="[isDarkMode ? 'bg-sky-500' : 'bg-sky-600']"
                  @click="downloadRecord(latestRecord)"
                >
                  {{ t('fileDetail.download') }}
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
                  {{ t('retrieve.recordsDrawer') }}
                </p>
                <p
                  class="mt-2 text-xl font-bold"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-950']"
                >
                  {{ t('retrieve.workspace.historyCount', { count: records.length }) }}
                </p>
              </div>
              <button
                type="button"
                @click="toggleDrawer"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full transition"
                :class="[
                  isDarkMode
                    ? 'bg-gray-800 text-sky-200 hover:bg-gray-700'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                ]"
                :aria-label="t('retrieve.workspace.openRecords')"
              >
                <ClipboardListIcon class="h-5 w-5" />
              </button>
            </div>
          </section>

          <section
            class="rounded-3xl border p-6 transition-colors duration-300"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-900/70' : 'border-white/80 bg-white/85']"
          >
            <div class="flex items-center gap-4">
              <ShieldCheckIcon class="h-10 w-10 text-teal-400" />
              <div>
                <p
                  class="text-sm font-medium"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                >
                  {{ t('retrieve.workspace.security') }}
                </p>
                <p class="mt-1 text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                  {{ t('retrieve.workspace.securityState') }}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>

    <SideDrawer :visible="showDrawer" :title="t('retrieve.recordsDrawer')" @close="toggleDrawer">
      <FileRecordList
        :records="records"
        @view-details="viewDetails"
        @download-record="downloadRecord"
        @delete-record="deleteRecord"
      />
    </SideDrawer>

    <FileDetailModal
      :visible="!!selectedRecord"
      :record="selectedRecord"
      @close="closeDetails"
      @preview-content="showContentPreview"
    />

    <ContentPreviewModal
      :visible="showPreview"
      :rendered-content="renderedContent"
      @close="closeContentPreview"
      @copy-content="copyContent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import {
  ArchiveRestoreIcon,
  ClipboardListIcon,
  DownloadCloudIcon,
  FileIcon,
  FileTextIcon,
  PackageSearchIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/common/BaseButton.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import FileDetailModal from '@/components/common/FileDetailModal.vue'
import FileRecordList from '@/components/common/FileRecordList.vue'
import ContentPreviewModal from '@/components/common/ContentPreviewModal.vue'
import { useRetrieveFlow } from '@/composables'
import { useConfigStore } from '@/stores/configStore'

const isDarkMode = inject('isDarkMode')
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const { config } = storeToRefs(configStore)
const {
  code,
  inspectedFile,
  isInspecting,
  isRetrieving,
  isWorking,
  hasValidCode,
  error,
  records,
  selectedRecord,
  showDrawer,
  showPreview,
  renderedContent,
  closeContentPreview,
  closeDetails,
  copyContent,
  deleteRecord,
  downloadRecord,
  handleSubmit,
  inspectCode,
  showContentPreview,
  toggleDrawer,
  viewDetails
} = useRetrieveFlow()

const toSend = () => {
  router.push('/send')
}

const formatFileSize = (bytes: number) => {
  if (bytes <= 0) return `0 ${t('fileSize.bytes')}`
  const units = [t('fileSize.bytes'), t('fileSize.kb'), t('fileSize.mb'), t('fileSize.gb')]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${parseFloat((bytes / Math.pow(1024, index)).toFixed(2))} ${units[index]}`
}

const formatDate = (value?: string | null) => {
  if (!value) return t('retrieve.workspace.noExpiry')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('retrieve.workspace.noExpiry')
  return date.toLocaleString()
}

const formatRemainingDownloads = (value?: number | null) => {
  if (value === null || value === undefined) return t('retrieve.workspace.unlimited')
  return t('retrieve.workspace.remainingCount', { count: value })
}

const latestRecord = computed(() => {
  if (records.value.length === 0) return null
  return records.value[records.value.length - 1]
})

const inspectedTypeLabel = computed(() => {
  if (!inspectedFile.value) return ''
  return inspectedFile.value.is_text
    ? t('retrieve.workspace.textType')
    : t('retrieve.workspace.fileType')
})

const inspectedMetaItems = computed(() => {
  if (!inspectedFile.value) return []
  return [
    {
      label: t('retrieve.workspace.fileSize'),
      value: formatFileSize(inspectedFile.value.size)
    },
    {
      label: t('retrieve.workspace.expiresAt'),
      value: formatDate(inspectedFile.value.expires_at || inspectedFile.value.expired_at)
    },
    {
      label: t('retrieve.workspace.remainingDownloads'),
      value: formatRemainingDownloads(inspectedFile.value.remaining_downloads)
    },
    {
      label: t('retrieve.workspace.usedCount'),
      value: String(inspectedFile.value.used_count || 0)
    }
  ]
})

const workspaceStats = computed(() => [
  {
    label: t('retrieve.workspace.currentCode'),
    value: code.value || t('retrieve.workspace.emptyCode')
  },
  {
    label: t('retrieve.workspace.previewState'),
    value: inspectedFile.value ? t('retrieve.workspace.ready') : t('retrieve.workspace.waiting')
  },
  {
    label: t('retrieve.recordsDrawer'),
    value: t('retrieve.workspace.historyCount', { count: records.value.length })
  }
])

onMounted(() => {
  const queryCode = route.query.code
  if (queryCode && typeof queryCode === 'string') {
    code.value = queryCode.slice(0, 5)
  }
})

watch(code, (newCode) => {
  if (newCode.trim().length === 5 && !isWorking.value) {
    void inspectCode()
  }
})
</script>
