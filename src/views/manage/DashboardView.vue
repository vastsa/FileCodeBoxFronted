<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm" :class="[mutedTextClass]">FileCodeBox Admin</p>
        <h2 class="text-2xl font-bold" :class="[primaryTextClass]">
          {{ t('admin.dashboard.title') }}
        </h2>
        <p class="mt-1 text-xs" :class="[mutedTextClass]">
          {{ t('admin.dashboard.lastUpdated', { time: lastUpdatedText }) }}
        </p>
      </div>
      <button
        type="button"
        :disabled="isLoading"
        @click="fetchDashboardData"
        class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        :class="[
          isDarkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'
        ]"
      >
        <RefreshCwIcon class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        {{ isLoading ? t('admin.dashboard.refreshing') : t('admin.dashboard.refresh') }}
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="mb-6 rounded-lg border px-4 py-3 text-sm"
      :class="[
        isDarkMode
          ? 'border-red-900/50 bg-red-950/30 text-red-200'
          : 'border-red-200 bg-red-50 text-red-700'
      ]"
    >
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        :title="t('admin.dashboard.totalFiles')"
        :value="dashboardData.totalFiles"
        :icon="FilesIcon"
        icon-color="zinc"
      >
        <template #description>
          {{ t('admin.dashboard.yesterdayShares', { count: dashboardData.yesterdayCount }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.storageSpace')"
        :value="dashboardData.storageUsedText"
        :icon="HardDriveIcon"
        icon-color="zinc"
      >
        <template #description>
          {{ t('admin.dashboard.todayIncrease', { count: dashboardData.todaySizeText }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.todayShares')"
        :value="dashboardData.todayCount"
        :icon="UploadCloudIcon"
        icon-color="zinc"
      >
        <template #description>
          {{ t('admin.dashboard.yesterdayShares', { count: dashboardData.yesterdayCount }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.totalRetrievals')"
        :value="dashboardData.usedCount"
        :icon="DownloadCloudIcon"
        icon-color="zinc"
      >
        <template #description>
          {{ t('admin.dashboard.serverUptime') }} {{ dashboardData.sysUptimeText }}
        </template>
      </StatCard>
    </div>

    <div v-if="dashboardData.hasExtendedStats" class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="xl:col-span-2 rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
              {{ t('admin.dashboard.fileHealth') }}
            </h3>
            <p class="text-sm" :class="[mutedTextClass]">
              {{ t('admin.dashboard.fileHealthDesc') }}
            </p>
          </div>
          <ActivityIcon class="h-5 w-5" :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-500']" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricProgress
            :label="t('admin.dashboard.activeFileRatio')"
            :value="dashboardData.activeRatio"
            :detail="`${dashboardData.activeCount} / ${dashboardData.totalFiles}`"
            tone="zinc"
          />
          <MetricProgress
            :label="t('admin.dashboard.fileShareRatio')"
            :value="dashboardData.fileRatio"
            :detail="t('admin.dashboard.binaryFiles', { count: dashboardData.fileCount })"
            tone="zinc"
          />
          <MetricProgress
            :label="t('admin.dashboard.textShareRatio')"
            :value="dashboardData.textRatio"
            :detail="t('admin.dashboard.textShares', { count: dashboardData.textCount })"
            tone="zinc"
          />
        </div>

        <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <button
            v-for="action in healthActions"
            :key="action.key"
            type="button"
            class="group flex min-h-28 flex-col justify-between rounded-lg border p-4 text-left transition-colors"
            :class="getHealthActionClass(action.tone)"
            @click="openHealthQueue(action.health)"
          >
            <span class="flex items-start justify-between gap-3">
              <span>
                <span class="block text-2xl font-semibold">{{ action.count }}</span>
                <span class="mt-1 block text-sm font-medium">{{ action.label }}</span>
              </span>
              <component :is="getHealthActionIcon(action.tone)" class="h-5 w-5 shrink-0" />
            </span>
            <span class="mt-3 flex items-center justify-between gap-2 text-xs">
              <span class="line-clamp-2">{{ action.description }}</span>
              <ArrowRightIcon
                class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </button>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg border p-4" :class="[subtlePanelClass]">
            <p class="text-sm" :class="[mutedTextClass]">
              {{ t('admin.dashboard.expiredFiles') }}
            </p>
            <div class="mt-2 flex items-end justify-between">
              <strong class="text-3xl" :class="[primaryTextClass]">
                {{ dashboardData.expiredCount }}
              </strong>
              <span class="text-sm" :class="[mutedTextClass]">
                {{ t('admin.dashboard.needCleanup') }}
              </span>
            </div>
          </div>

          <div class="rounded-lg border p-4" :class="[subtlePanelClass]">
            <p class="text-sm" :class="[mutedTextClass]">
              {{ t('admin.dashboard.chunkedFiles') }}
            </p>
            <div class="mt-2 flex items-end justify-between">
              <strong class="text-3xl" :class="[primaryTextClass]">
                {{ dashboardData.chunkedCount }}
              </strong>
              <span class="text-sm" :class="[mutedTextClass]">
                {{ dashboardData.enableChunk ? t('common.enabled') : t('common.disabled') }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-text rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <div class="mb-5">
          <h3 class="theme-text-strong text-lg font-semibold">
            {{ t('admin.dashboard.storagePolicy') }}
          </h3>
          <p class="theme-text-muted text-sm">
            {{ t('admin.dashboard.storagePolicyDesc') }}
          </p>
        </div>

        <div class="space-y-4">
          <PolicyRow
            :label="t('admin.dashboard.storageBackend')"
            :value="dashboardData.storageBackend"
          />
          <PolicyRow
            :label="t('admin.dashboard.singleFileLimit')"
            :value="dashboardData.uploadSizeLimitText"
          />
          <PolicyRow
            :label="t('admin.dashboard.guestUpload')"
            :value="dashboardData.openUpload ? t('common.enabled') : t('common.disabled')"
          />
          <PolicyRow :label="t('admin.dashboard.maxSaveTime')" :value="maxSaveTimeText" />
        </div>

        <div class="mt-5">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="theme-text-muted">{{ t('admin.dashboard.todayCapacityReference') }}</span>
            <span class="theme-text-strong">{{ dashboardData.todaySizeRatio }}%</span>
          </div>
          <div
            class="h-2 overflow-hidden rounded-full bg-[rgb(var(--color-surface-muted))]"
          >
            <div
              class="h-full rounded-full bg-[rgb(var(--color-accent))]"
              :style="{ width: `${dashboardData.todaySizeRatio}%` }"
            ></div>
          </div>
        </div>
      </section>
    </div>

    <footer
      class="mt-6 flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between"
      :class="[isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500']"
    >
      <span>{{ t('admin.dashboard.footerProduct') }}</span>
      <span class="inline-flex items-center gap-2">
        <span>{{ t('admin.dashboard.runtimeVersion') }}</span>
        <span
          class="rounded-md border px-2 py-0.5 font-medium"
          :class="[
            isDarkMode
              ? 'border-gray-700 bg-gray-800/70 text-gray-300'
              : 'border-gray-200 bg-white text-gray-700'
          ]"
        >
          {{ versionText }}
        </span>
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'
import type { Component, PropType } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  DownloadCloudIcon,
  FilesIcon,
  HardDriveIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UploadCloudIcon
} from 'lucide-vue-next'
import StatCard from '@/components/common/StatCard.vue'
import { useDashboardStats, useInjectedDarkMode } from '@/composables'
import { useI18n } from 'vue-i18n'
import { ROUTES } from '@/constants'
import { useConfigStore } from '@/stores/configStore'
import type { DashboardHealthAction } from '@/types'

const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const router = useRouter()
const configStore = useConfigStore()
const { appVersion } = storeToRefs(configStore)
const { dashboardData, errorMessage, fetchDashboardData, isLoading, lastUpdatedText } =
  useDashboardStats({
    loadFailedMessage: t('admin.dashboard.loadFailed')
  })

const primaryTextClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-gray-900'))
const mutedTextClass = computed(() => (isDarkMode.value ? 'text-zinc-400' : 'text-zinc-500'))
const versionText = computed(() => appVersion.value || t('admin.dashboard.versionPending'))
const panelClass = computed(() =>
  isDarkMode.value
    ? 'border border-white/10 bg-white/[0.06] shadow-[0_22px_54px_-36px_rgba(255,255,255,0.22)] backdrop-blur-xl'
    : 'border border-white/80 bg-white/70 shadow-[0_22px_54px_-36px_rgba(24,24,27,0.28)] backdrop-blur-xl'
)
const subtlePanelClass = computed(() =>
  isDarkMode.value ? 'border-white/10 bg-white/[0.04]' : 'border-zinc-200/70 bg-zinc-50/70'
)
const maxSaveTimeText = computed(() => {
  if (!dashboardData.maxSaveSeconds) return t('admin.dashboard.noSaveLimit')
  const days = Math.floor(dashboardData.maxSaveSeconds / 86400)
  if (days >= 1) return `${days}${t('common.day')}`
  const hours = Math.floor(dashboardData.maxSaveSeconds / 3600)
  if (hours >= 1) return `${hours}${t('common.hour')}`
  return `${Math.floor(dashboardData.maxSaveSeconds / 60)}${t('common.minute')}`
})

const healthActions = computed<DashboardHealthAction[]>(() => [
  {
    key: 'attention',
    label: t('admin.dashboard.healthActions.attention.title'),
    description: t('admin.dashboard.healthActions.attention.description'),
    count: dashboardData.healthAttentionCount,
    health: 'attention',
    tone: dashboardData.healthAttentionCount > 0 ? 'danger' : 'success'
  },
  {
    key: 'storageIssue',
    label: t('admin.dashboard.healthActions.storageIssue.title'),
    description: t('admin.dashboard.healthActions.storageIssue.description'),
    count: dashboardData.storageIssueCount,
    health: 'storage_issue',
    tone: dashboardData.storageIssueCount > 0 ? 'danger' : 'success'
  },
  {
    key: 'expiringSoon',
    label: t('admin.dashboard.healthActions.expiringSoon.title'),
    description: t('admin.dashboard.healthActions.expiringSoon.description'),
    count: dashboardData.expiringSoonCount,
    health: 'expiring_soon',
    tone: dashboardData.expiringSoonCount > 0 ? 'warning' : 'success'
  },
  {
    key: 'neverRetrieved',
    label: t('admin.dashboard.healthActions.neverRetrieved.title'),
    description: t('admin.dashboard.healthActions.neverRetrieved.description'),
    count: dashboardData.neverRetrievedCount,
    health: 'never_retrieved',
    tone: dashboardData.neverRetrievedCount > 0 ? 'neutral' : 'success'
  },
  {
    key: 'permanent',
    label: t('admin.dashboard.healthActions.permanent.title'),
    description: t('admin.dashboard.healthActions.permanent.description'),
    count: dashboardData.permanentCount,
    health: 'permanent',
    tone: 'success'
  }
])

const healthActionIconMap: Record<DashboardHealthAction['tone'], Component> = {
  danger: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
  neutral: ShieldCheckIcon
}

const getHealthActionIcon = (tone: DashboardHealthAction['tone']) => healthActionIconMap[tone]

const getHealthActionClass = (tone: DashboardHealthAction['tone']) => {
  const darkClasses: Record<DashboardHealthAction['tone'], string> = {
    danger: 'border-red-500/20 bg-red-500/10 text-red-200 hover:border-red-400/40',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200 hover:border-amber-400/40',
    success: 'border-zinc-500/20 bg-white/5 text-zinc-200 hover:border-zinc-400/40',
    neutral: 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/15'
  }
  const lightClasses: Record<DashboardHealthAction['tone'], string> = {
    danger: 'border-red-100 bg-red-50 text-red-700 hover:border-red-200',
    warning: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200',
    success: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300',
    neutral: 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200'
  }

  return isDarkMode.value ? darkClasses[tone] : lightClasses[tone]
}

const openHealthQueue = (health: DashboardHealthAction['health']) => {
  void router.push({
    path: ROUTES.FILE_MANAGE,
    query: { health }
  })
}

const MetricProgress = defineComponent({
  name: 'MetricProgress',
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    detail: { type: String, required: true },
    tone: {
      type: String as PropType<'zinc'>,
      required: true
    }
  },
  setup(props) {
    const toneClass = computed(() => 'bg-zinc-500')

    return () =>
      h('div', { class: 'rounded-lg border p-4 border-gray-200/60 dark:border-gray-700' }, [
        h('div', { class: 'mb-2 flex items-center justify-between text-sm' }, [
          h('span', { class: 'text-gray-500 dark:text-gray-400' }, props.label),
          h('span', { class: 'font-medium text-gray-900 dark:text-white' }, `${props.value}%`)
        ]),
        h('div', { class: 'h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700' }, [
          h('div', {
            class: ['h-full rounded-full', toneClass.value],
            style: { width: `${props.value}%` }
          })
        ]),
        h('p', { class: 'mt-2 text-sm text-gray-500 dark:text-gray-400' }, props.detail)
      ])
  }
})

const PolicyRow = defineComponent({
  name: 'PolicyRow',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          class:
            'theme-divider flex items-center justify-between gap-4 border-b pb-3 last:border-b-0'
        },
        [
          h('span', { class: 'theme-text-muted text-sm' }, props.label),
          h('span', { class: 'theme-text-strong text-sm font-medium' }, props.value)
        ]
      )
  }
})

onMounted(() => {
  void fetchDashboardData()
})
</script>
