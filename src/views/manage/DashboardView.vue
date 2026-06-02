<template>
  <div class="p-6 overflow-y-auto custom-scrollbar">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm" :class="[mutedTextClass]">FileCodeBox Admin</p>
        <h2 class="text-2xl font-bold" :class="[primaryTextClass]">
          {{ t('admin.dashboard.title') }}
        </h2>
      </div>
      <button
        type="button"
        @click="fetchDashboardData"
        class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="[
          isDarkMode
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'
        ]"
      >
        <RefreshCwIcon class="mr-2 h-4 w-4" />
        {{ t('admin.dashboard.refresh') }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        :title="t('admin.dashboard.totalFiles')"
        :value="dashboardData.totalFiles"
        :icon="FilesIcon"
        icon-color="indigo"
      >
        <template #description>
          {{ t('admin.dashboard.yesterdayShares', { count: dashboardData.yesterdayCount }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.storageSpace')"
        :value="dashboardData.storageUsedText"
        :icon="HardDriveIcon"
        icon-color="purple"
      >
        <template #description>
          {{ t('admin.dashboard.todayIncrease', { count: dashboardData.todaySizeText }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.todayShares')"
        :value="dashboardData.todayCount"
        :icon="UploadCloudIcon"
        icon-color="green"
      >
        <template #description>
          {{ t('admin.dashboard.yesterdayShares', { count: dashboardData.yesterdayCount }) }}
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.totalRetrievals')"
        :value="dashboardData.usedCount"
        :icon="DownloadCloudIcon"
        icon-color="blue"
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
          <ActivityIcon class="h-5 w-5" :class="[isDarkMode ? 'text-indigo-300' : 'text-indigo-500']" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricProgress
            :label="t('admin.dashboard.activeFileRatio')"
            :value="dashboardData.activeRatio"
            :detail="`${dashboardData.activeCount} / ${dashboardData.totalFiles}`"
            tone="green"
          />
          <MetricProgress
            :label="t('admin.dashboard.fileShareRatio')"
            :value="dashboardData.fileRatio"
            :detail="t('admin.dashboard.binaryFiles', { count: dashboardData.fileCount })"
            tone="indigo"
          />
          <MetricProgress
            :label="t('admin.dashboard.textShareRatio')"
            :value="dashboardData.textRatio"
            :detail="t('admin.dashboard.textShares', { count: dashboardData.textCount })"
            tone="purple"
          />
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

      <section class="rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <div class="mb-5">
          <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
            {{ t('admin.dashboard.storagePolicy') }}
          </h3>
          <p class="text-sm" :class="[mutedTextClass]">
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
          <PolicyRow
            :label="t('admin.dashboard.maxSaveTime')"
            :value="maxSaveTimeText"
          />
        </div>

        <div class="mt-5">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span :class="[mutedTextClass]">{{ t('admin.dashboard.todayCapacityReference') }}</span>
            <span :class="[primaryTextClass]">{{ dashboardData.todaySizeRatio }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full" :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
            <div
              class="h-full rounded-full bg-indigo-500"
              :style="{ width: `${dashboardData.todaySizeRatio}%` }"
            ></div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="dashboardData.hasExtendedStats" class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
          {{ t('admin.dashboard.fileTypeDistribution') }}
        </h3>
        <div class="mt-4 space-y-3">
          <div v-if="dashboardData.topSuffixes.length === 0" class="text-sm" :class="[mutedTextClass]">
            {{ t('common.noData') }}
          </div>
          <div v-for="item in dashboardData.topSuffixes" :key="item.suffix" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span :class="[primaryTextClass]">{{ item.suffix || t('admin.dashboard.textType') }}</span>
              <span :class="[mutedTextClass]">{{ item.count }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full" :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
              <div
                class="h-full rounded-full bg-purple-500"
                :style="{ width: `${getSuffixRatio(item.count)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section class="xl:col-span-2 rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
              {{ t('admin.dashboard.recentFiles') }}
            </h3>
            <p class="text-sm" :class="[mutedTextClass]">
              {{ t('admin.dashboard.recentFilesDesc') }}
            </p>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg border" :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']">
          <table class="min-w-full divide-y" :class="[isDarkMode ? 'divide-gray-700' : 'divide-gray-200']">
            <thead :class="[isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50']">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="[mutedTextClass]">
                  {{ t('admin.dashboard.table.file') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="[mutedTextClass]">
                  {{ t('admin.dashboard.table.size') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="[mutedTextClass]">
                  {{ t('admin.dashboard.table.usage') }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="[mutedTextClass]">
                  {{ t('admin.dashboard.table.status') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y" :class="[isDarkMode ? 'divide-gray-700' : 'divide-gray-100']">
              <tr v-if="dashboardData.recentFiles.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-sm" :class="[mutedTextClass]">
                  {{ t('common.noData') }}
                </td>
              </tr>
              <tr v-for="file in dashboardData.recentFiles" :key="file.id">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="rounded-lg p-2" :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
                      <FileTextIcon v-if="file.text" class="h-4 w-4" :class="[mutedTextClass]" />
                      <FileIcon v-else class="h-4 w-4" :class="[mutedTextClass]" />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium" :class="[primaryTextClass]">
                        {{ file.name || file.code }}
                      </p>
                      <p class="text-xs" :class="[mutedTextClass]">
                        {{ file.code }} · {{ formatCreatedAt(file.createdAt) }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm" :class="[primaryTextClass]">
                  {{ formatFileSize(file.size) }}
                </td>
                <td class="px-4 py-3 text-sm" :class="[primaryTextClass]">
                  {{ file.usedCount }} {{ t('common.times') }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="[
                      file.isExpired
                        ? isDarkMode
                          ? 'bg-red-900/40 text-red-300'
                          : 'bg-red-100 text-red-700'
                        : isDarkMode
                          ? 'bg-green-900/40 text-green-300'
                          : 'bg-green-100 text-green-700'
                    ]"
                  >
                    {{ file.isExpired ? t('common.expiredFile') : t('admin.dashboard.available') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'
import type { PropType } from 'vue'
import {
  ActivityIcon,
  DownloadCloudIcon,
  FileIcon,
  FilesIcon,
  FileTextIcon,
  HardDriveIcon,
  RefreshCwIcon,
  UploadCloudIcon
} from 'lucide-vue-next'
import StatCard from '@/components/common/StatCard.vue'
import { useDashboardStats, useInjectedDarkMode } from '@/composables'
import { useI18n } from 'vue-i18n'
import { formatFileSize, formatTimestamp } from '@/utils/common'

const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const { dashboardData, fetchDashboardData } = useDashboardStats()

const primaryTextClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-gray-900'))
const mutedTextClass = computed(() => (isDarkMode.value ? 'text-gray-400' : 'text-gray-500'))
const panelClass = computed(() =>
  isDarkMode.value ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-100'
)
const subtlePanelClass = computed(() =>
  isDarkMode.value ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50'
)
const maxSuffixCount = computed(() =>
  Math.max(...dashboardData.topSuffixes.map((item) => item.count), 1)
)
const maxSaveTimeText = computed(() => {
  if (!dashboardData.maxSaveSeconds) return t('admin.dashboard.noSaveLimit')
  const days = Math.floor(dashboardData.maxSaveSeconds / 86400)
  if (days >= 1) return `${days}${t('common.day')}`
  const hours = Math.floor(dashboardData.maxSaveSeconds / 3600)
  if (hours >= 1) return `${hours}${t('common.hour')}`
  return `${Math.floor(dashboardData.maxSaveSeconds / 60)}${t('common.minute')}`
})

const getSuffixRatio = (count: number) => Math.round((count / maxSuffixCount.value) * 100)

const formatCreatedAt = (value: string | null) => {
  if (!value) return '-'
  return formatTimestamp(value, 'datetime')
}

const MetricProgress = defineComponent({
  name: 'MetricProgress',
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    detail: { type: String, required: true },
    tone: {
      type: String as PropType<'green' | 'indigo' | 'purple'>,
      required: true
    }
  },
  setup(props) {
    const toneClass = computed(() => {
      const classes = {
        green: 'bg-green-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500'
      }
      return classes[props.tone]
    })

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
      h('div', { class: 'flex items-center justify-between gap-4 border-b border-gray-200/60 pb-3 last:border-b-0 dark:border-gray-700' }, [
        h('span', { class: 'text-sm text-gray-500 dark:text-gray-400' }, props.label),
        h('span', { class: 'text-sm font-medium text-gray-900 dark:text-white' }, props.value)
      ])
  }
})

onMounted(() => {
  void fetchDashboardData()
})
</script>
