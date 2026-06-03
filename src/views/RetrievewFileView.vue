<template>
  <div
    class="transfer-page relative min-h-screen overflow-x-hidden px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8"
    :class="[isDarkMode ? 'text-slate-100' : 'text-slate-950']"
  >
    <main
      class="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-start lg:items-center"
    >
      <section
        class="grid w-full items-stretch gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,1fr)]"
      >
        <aside
          class="order-2 flex min-h-0 flex-col justify-between rounded-[28px] border p-5 shadow-sm sm:p-8 lg:order-1 lg:min-h-[520px]"
          :class="[
            isDarkMode
              ? 'border-white/10 bg-slate-950/45 shadow-black/20'
              : 'border-white/80 bg-white/70 shadow-slate-200/70'
          ]"
        >
          <div>
            <div class="flex items-center justify-between gap-4">
              <button
                type="button"
                class="flex min-w-0 items-center gap-3 text-left"
                @click="toSend"
              >
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  :class="[
                    isDarkMode ? 'bg-cyan-400/15 text-cyan-200' : 'bg-cyan-50 text-cyan-700'
                  ]"
                >
                  <BoxIcon class="h-5 w-5" />
                </span>
                <span class="min-w-0">
                  <span
                    class="block truncate text-lg font-semibold"
                    :class="[isDarkMode ? 'text-white' : 'text-slate-950']"
                  >
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
              <router-link
                to="/send"
                class="inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition"
                :class="[
                  isDarkMode
                    ? 'border-white/10 text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-300/10'
                    : 'border-cyan-100 bg-white text-cyan-700 hover:border-cyan-200 hover:bg-cyan-50'
                ]"
              >
                <SendIcon class="mr-2 h-4 w-4" />
                {{ t('retrieve.workspace.sendFile') }}
              </router-link>
            </div>

            <div class="mt-8 max-w-xl lg:mt-14">
              <p
                class="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-medium"
                :class="[isDarkMode ? 'bg-cyan-400/10 text-cyan-200' : 'bg-cyan-50 text-cyan-700']"
              >
                {{ t('retrieve.workspace.security') }}
              </p>
              <h1 class="text-4xl font-semibold leading-tight sm:text-5xl">
                {{ t('retrieve.title') }}
              </h1>
              <p
                class="mt-5 max-w-lg text-sm leading-7"
                :class="[isDarkMode ? 'text-slate-300' : 'text-slate-600']"
              >
                {{ config.description || t('retrieve.workspace.securityState') }}
              </p>
            </div>

            <div class="mt-7 grid gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-1 xl:grid-cols-3">
              <div
                v-for="item in statusCards"
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
                  {{ t('send.secureEncryption') }}
                </p>
                <p
                  class="mt-1 text-xs leading-5"
                  :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']"
                >
                  {{ t('retrieve.workspace.securityState') }}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section
          class="order-1 rounded-[28px] border p-5 shadow-xl shadow-slate-900/5 sm:p-8 lg:order-2"
          :class="[isDarkMode ? 'border-white/10 bg-slate-950/70' : 'border-white/90 bg-white/90']"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-sm font-medium"
                :class="[isDarkMode ? 'text-cyan-200' : 'text-cyan-700']"
              >
                {{ t('retrieve.codeInput.label') }}
              </p>
              <h2 class="mt-2 text-2xl font-semibold">
                {{ t('retrieve.workspace.noPreview') }}
              </h2>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
              :class="[
                isDarkMode
                  ? 'border-white/10 text-slate-300 hover:bg-white/10'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
              :aria-label="t('retrieve.recordsDrawer')"
              @click="toggleDrawer"
            >
              <ClipboardListIcon class="h-4 w-4" />
            </button>
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
            <label class="block">
              <span class="sr-only">{{ t('retrieve.codeInput.label') }}</span>
              <input
                v-model="code"
                type="text"
                inputmode="text"
                maxlength="5"
                autocomplete="one-time-code"
                class="h-20 w-full rounded-3xl border px-6 text-center text-4xl font-semibold outline-none transition focus:ring-4"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.06] text-white placeholder-slate-600 focus:border-cyan-300/60 focus:ring-cyan-300/10'
                    : 'border-slate-200 bg-slate-50/80 text-slate-950 placeholder-slate-300 focus:border-cyan-400 focus:ring-cyan-100',
                  error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''
                ]"
                :placeholder="t('retrieve.codeInput.placeholder')"
                :readonly="inputStatus.readonly"
                @input="normalizeCode"
              />
            </label>

            <p v-if="error" class="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
              {{ error }}
            </p>

            <button
              type="submit"
              class="group flex h-14 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="[
                isDarkMode ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-slate-950 hover:bg-slate-800',
                inputStatus.loading ? 'pointer-events-none' : ''
              ]"
              :disabled="inputStatus.loading || !hasValidCode"
            >
              <span
                v-if="inputStatus.loading"
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              ></span>
              <DownloadCloudIcon
                v-else
                class="mr-2 h-4 w-4 transition group-hover:translate-y-0.5"
              />
              {{ inputStatus.loading ? t('common.loading') : t('retrieve.submit') }}
            </button>
          </form>

          <div class="mt-8 grid gap-3 sm:grid-cols-2">
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
              <ClipboardListIcon class="h-5 w-5 text-cyan-500" />
              <p class="mt-3 text-sm font-medium">{{ t('retrieve.recordsDrawer') }}</p>
              <p class="mt-1 text-xs" :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']">
                {{ t('retrieve.workspace.historyCount', { count: records.length }) }}
              </p>
            </button>

            <router-link
              to="/login"
              class="rounded-2xl border p-4 text-left transition"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              ]"
            >
              <UserIcon class="h-5 w-5 text-slate-400" />
              <p class="mt-3 text-sm font-medium">{{ t('admin.dashboard.footerProduct') }}</p>
              <p class="mt-1 text-xs" :class="[isDarkMode ? 'text-slate-400' : 'text-slate-500']">
                {{ t('common.appDescription') }}
              </p>
            </router-link>
          </div>
        </section>
      </section>
    </main>

    <SideDrawer :visible="showDrawer" :title="$t('retrieve.recordsDrawer')" @close="toggleDrawer">
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
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  BoxIcon,
  ClipboardListIcon,
  DownloadCloudIcon,
  SendIcon,
  ShieldCheckIcon,
  UserIcon
} from 'lucide-vue-next'
import SideDrawer from '@/components/common/SideDrawer.vue'
import FileDetailModal from '@/components/common/FileDetailModal.vue'
import FileRecordList from '@/components/common/FileRecordList.vue'
import ContentPreviewModal from '@/components/common/ContentPreviewModal.vue'
import { useInjectedDarkMode, useRetrieveFlow } from '@/composables'
import { useConfigStore } from '@/stores/configStore'

const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const { config } = storeToRefs(configStore)
const {
  code,
  inputStatus,
  error,
  records,
  selectedRecord,
  showDrawer,
  showPreview,
  renderedContent,
  hasValidCode,
  closeContentPreview,
  closeDetails,
  copyContent,
  deleteRecord,
  downloadRecord,
  handleSubmit,
  showContentPreview,
  toggleDrawer,
  viewDetails
} = useRetrieveFlow()

const toSend = () => {
  router.push('/send')
}

const normalizeCode = () => {
  code.value = code.value.trim().slice(0, 5)
}

const statusCards = computed(() => [
  {
    label: t('retrieve.workspace.currentCode'),
    value: code.value || t('retrieve.workspace.emptyCode')
  },
  {
    label: t('retrieve.workspace.previewState'),
    value: inputStatus.value.loading ? t('common.loading') : t('retrieve.workspace.waiting')
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
  if (newCode.length === 5 && !inputStatus.value.loading) {
    void handleSubmit()
  }
})
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
</style>
