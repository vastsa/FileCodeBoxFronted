<template>
  <div class="p-6 overflow-y-auto custom-scrollbar">
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

    <section
      v-if="dashboardData.hasExtendedStats && dashboardData.operationalInsights.length > 0"
      class="mt-6"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
            {{ t('admin.dashboard.operationalInsightsTitle') }}
          </h3>
          <p class="text-sm" :class="[mutedTextClass]">
            {{ t('admin.dashboard.operationalInsightsDesc') }}
          </p>
        </div>
        <LightbulbIcon
          class="hidden h-5 w-5 sm:block"
          :class="[isDarkMode ? 'text-amber-300' : 'text-amber-500']"
        />
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <button
          v-for="insight in dashboardData.operationalInsights"
          :key="insight.key"
          type="button"
          class="group flex min-h-40 flex-col rounded-lg border p-4 text-left transition-colors"
          :class="getOperationalInsightClass(insight.severity)"
          @click="openOperationalInsight(insight)"
        >
          <span class="flex items-start justify-between gap-3">
            <span class="rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-current/15">
              {{ getOperationalInsightSeverityLabel(insight.severity) }}
            </span>
            <component :is="getOperationalInsightIcon(insight.severity)" class="h-5 w-5 shrink-0" />
          </span>
          <strong class="mt-4 text-base">
            {{ getOperationalInsightTitle(insight) }}
          </strong>
          <span class="mt-2 line-clamp-3 text-sm opacity-80">
            {{ getOperationalInsightDescription(insight) }}
          </span>
          <span class="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-medium">
            <span>{{ getOperationalInsightActionLabel(insight) }}</span>
            <ArrowRightIcon
              class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </button>
      </div>
    </section>

    <section
      v-if="dashboardData.hasExtendedStats && dashboardData.maintenanceItems.length > 0"
      class="mt-6 rounded-lg p-5 shadow-sm"
      :class="[panelClass]"
    >
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
            {{ t('admin.dashboard.maintenanceQueueTitle') }}
          </h3>
          <p class="text-sm" :class="[mutedTextClass]">
            {{ t('admin.dashboard.maintenanceQueueDesc') }}
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
          <div class="rounded-lg border px-3 py-2" :class="[subtlePanelClass]">
            <p class="text-xs" :class="[mutedTextClass]">
              {{ t('admin.dashboard.maintenanceActionable') }}
            </p>
            <strong class="mt-1 block text-xl" :class="[primaryTextClass]">
              {{ dashboardData.maintenanceSummary.actionableCount }}
            </strong>
          </div>
          <div class="rounded-lg border px-3 py-2" :class="[subtlePanelClass]">
            <p class="text-xs" :class="[mutedTextClass]">
              {{ t('admin.dashboard.maintenanceFileQueue') }}
            </p>
            <strong class="mt-1 block text-xl" :class="[primaryTextClass]">
              {{ dashboardData.maintenanceSummary.fileQueueCount }}
            </strong>
          </div>
          <div class="rounded-lg border px-3 py-2" :class="[subtlePanelClass]">
            <p class="text-xs" :class="[mutedTextClass]">
              {{ t('admin.dashboard.maintenanceSettings') }}
            </p>
            <strong class="mt-1 block text-xl" :class="[primaryTextClass]">
              {{ dashboardData.maintenanceSummary.settingsCount }}
            </strong>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="item in dashboardData.maintenanceItems"
          :key="item.key"
          type="button"
          class="group flex min-h-36 flex-col rounded-lg border p-4 text-left transition-colors"
          :class="getMaintenanceQueueClass(item.severity)"
          @click="openMaintenanceQueueItem(item)"
        >
          <span class="flex items-start justify-between gap-3">
            <span class="rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-current/15">
              {{ getOperationalInsightSeverityLabel(item.severity) }}
            </span>
            <component :is="getMaintenanceQueueIcon(item.severity)" class="h-5 w-5 shrink-0" />
          </span>
          <strong class="mt-3 text-base">
            {{ getMaintenanceQueueTitle(item) }}
          </strong>
          <span class="mt-2 line-clamp-2 text-sm opacity-80">
            {{ getMaintenanceQueueDescription(item) }}
          </span>
          <span class="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-medium">
            <span>{{ getMaintenanceQueueActionLabel(item) }}</span>
            <ArrowRightIcon
              class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </button>
      </div>
    </section>

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
          <ActivityIcon
            class="h-5 w-5"
            :class="[isDarkMode ? 'text-indigo-300' : 'text-indigo-500']"
          />
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
          <PolicyRow :label="t('admin.dashboard.maxSaveTime')" :value="maxSaveTimeText" />
        </div>

        <div class="mt-5">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span :class="[mutedTextClass]">{{ t('admin.dashboard.todayCapacityReference') }}</span>
            <span :class="[primaryTextClass]">{{ dashboardData.todaySizeRatio }}%</span>
          </div>
          <div
            class="h-2 overflow-hidden rounded-full"
            :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
          >
            <div
              class="h-full rounded-full bg-indigo-500"
              :style="{ width: `${dashboardData.todaySizeRatio}%` }"
            ></div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="dashboardData.hasExtendedStats" class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
      <section class="rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
          {{ t('admin.dashboard.fileTypeDistribution') }}
        </h3>
        <div class="mt-4 space-y-3">
          <div
            v-if="dashboardData.topSuffixes.length === 0"
            class="text-sm"
            :class="[mutedTextClass]"
          >
            {{ t('common.noData') }}
          </div>
          <div v-for="item in dashboardData.topSuffixes" :key="item.suffix" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span :class="[primaryTextClass]">{{
                item.suffix || t('admin.dashboard.textType')
              }}</span>
              <span :class="[mutedTextClass]">{{ item.count }}</span>
            </div>
            <div
              class="h-2 overflow-hidden rounded-full"
              :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
            >
              <div
                class="h-full rounded-full bg-purple-500"
                :style="{ width: `${getSuffixRatio(item.count)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg p-5 shadow-sm" :class="[panelClass]">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold" :class="[primaryTextClass]">
              {{ t('admin.dashboard.recentActivities') }}
            </h3>
            <p class="text-sm" :class="[mutedTextClass]">
              {{ t('admin.dashboard.recentActivitiesDesc') }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            :class="[
              isDarkMode
                ? 'bg-gray-900 text-indigo-200 hover:bg-gray-700'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            ]"
            @click="handleOpenActivityTimeline"
          >
            <HistoryIcon class="h-4 w-4" />
            {{ t('admin.dashboard.viewAllActivities') }}
          </button>
        </div>

        <div
          v-if="dashboardData.recentActivities.length === 0"
          class="rounded-lg border px-4 py-6 text-center text-sm"
          :class="[subtlePanelClass, mutedTextClass]"
        >
          {{ t('admin.dashboard.noActivities') }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="activity in dashboardData.recentActivities"
            :key="activity.id"
            class="rounded-lg border px-3 py-3"
            :class="[subtlePanelClass]"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                :class="getActivityIconClass(activity.action)"
              >
                <component :is="getActivityIcon(activity.action)" class="h-4 w-4" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium" :class="[primaryTextClass]">
                  {{ getActivityTitle(activity.action) }}
                </p>
                <p class="mt-1 truncate text-xs" :class="[mutedTextClass]">
                  {{ getActivityDescription(activity) }}
                </p>
                <p class="mt-2 text-xs" :class="[mutedTextClass]">
                  {{ formatCreatedAt(activity.createdAtValue) }}
                </p>
              </div>
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

        <div
          class="overflow-hidden rounded-lg border"
          :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']"
        >
          <table
            class="min-w-full divide-y"
            :class="[isDarkMode ? 'divide-gray-700' : 'divide-gray-200']"
          >
            <thead :class="[isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50']">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  :class="[mutedTextClass]"
                >
                  {{ t('admin.dashboard.table.file') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  :class="[mutedTextClass]"
                >
                  {{ t('admin.dashboard.table.size') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  :class="[mutedTextClass]"
                >
                  {{ t('admin.dashboard.table.usage') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  :class="[mutedTextClass]"
                >
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
                    <div
                      class="rounded-lg p-2"
                      :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
                    >
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

  <SideDrawer
    :visible="isActivityTimelineOpen"
    :title="t('admin.dashboard.activityTimelineTitle')"
    @close="closeActivityTimeline"
  >
    <div class="flex min-h-0 flex-1 flex-col">
      <div class="border-b p-5" :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border p-3" :class="[subtlePanelClass]">
            <p class="text-xs" :class="[mutedTextClass]">
              {{ t('admin.dashboard.activityTimelineFiltered') }}
            </p>
            <strong class="mt-1 block text-2xl" :class="[primaryTextClass]">
              {{ activityTimelineTotal }}
            </strong>
          </div>
          <div class="rounded-lg border p-3" :class="[subtlePanelClass]">
            <p class="text-xs" :class="[mutedTextClass]">
              {{ t('admin.dashboard.activityTimelineStoredTotal') }}
            </p>
            <strong class="mt-1 block text-2xl" :class="[primaryTextClass]">
              {{ activityTimelineStoredTotal }}
            </strong>
          </div>
        </div>

        <form class="mt-4 space-y-3" @submit.prevent="handleApplyActivityFilters">
          <label class="block">
            <span class="mb-1 block text-xs font-medium" :class="[mutedTextClass]">
              {{ t('admin.dashboard.activityKeyword') }}
            </span>
            <span class="relative block">
              <SearchIcon
                class="pointer-events-none absolute left-3 top-2.5 h-4 w-4"
                :class="[mutedTextClass]"
              />
              <input
                v-model="activityFilters.keyword"
                type="search"
                class="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors"
                :class="[
                  isDarkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 focus:border-indigo-400'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-400'
                ]"
                :placeholder="t('admin.dashboard.activityKeywordPlaceholder')"
              />
            </span>
          </label>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-medium" :class="[mutedTextClass]">
                {{ t('admin.dashboard.activityActionFilter') }}
              </span>
              <select
                v-model="activityFilters.action"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                :class="[
                  isDarkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
                ]"
              >
                <option value="">{{ t('admin.dashboard.activityAllActions') }}</option>
                <option
                  v-for="option in activityActionOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ getActivityTitle(option.value) }} ({{ option.count }})
                </option>
              </select>
            </label>

            <label class="block">
              <span class="mb-1 block text-xs font-medium" :class="[mutedTextClass]">
                {{ t('admin.dashboard.activityTargetTypeFilter') }}
              </span>
              <select
                v-model="activityFilters.targetType"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                :class="[
                  isDarkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
                ]"
              >
                <option value="">{{ t('admin.dashboard.activityAllTargets') }}</option>
                <option
                  v-for="option in activityTargetTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ getActivityTargetTypeTitle(option.value) }} ({{ option.count }})
                </option>
              </select>
            </label>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="[
                isDarkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              :disabled="!hasActivityFilters || isActivityTimelineLoading"
              @click="handleResetActivityFilters"
            >
              {{ t('admin.dashboard.activityResetFilters') }}
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                :class="[
                  isDarkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
                :disabled="isActivityTimelineLoading"
                @click="handleRefreshActivityTimeline"
              >
                <RefreshCwIcon
                  class="h-4 w-4"
                  :class="{ 'animate-spin': isActivityTimelineLoading }"
                />
                {{ t('admin.dashboard.activityRefresh') }}
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isActivityTimelineLoading"
              >
                <ListFilterIcon class="h-4 w-4" />
                {{ t('admin.dashboard.activityApplyFilters') }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div
          v-if="activityTimelineError"
          class="mb-4 rounded-lg border px-4 py-3 text-sm"
          :class="[
            isDarkMode
              ? 'border-red-900/50 bg-red-950/30 text-red-200'
              : 'border-red-200 bg-red-50 text-red-700'
          ]"
        >
          {{ activityTimelineError }}
        </div>

        <div
          v-if="isActivityTimelineLoading"
          class="flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm"
          :class="[subtlePanelClass, mutedTextClass]"
        >
          <RefreshCwIcon class="h-4 w-4 animate-spin" />
          {{ t('admin.dashboard.activityLoading') }}
        </div>

        <div
          v-else-if="activityTimeline.length === 0"
          class="rounded-lg border px-4 py-8 text-center text-sm"
          :class="[subtlePanelClass, mutedTextClass]"
        >
          {{
            hasActivityFilters
              ? t('admin.dashboard.activityNoFiltered')
              : t('admin.dashboard.noActivities')
          }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="activity in activityTimeline"
            :key="activity.id"
            class="rounded-lg border p-4"
            :class="[subtlePanelClass]"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                :class="getActivityIconClass(activity.action)"
              >
                <component :is="getActivityIcon(activity.action)" class="h-4 w-4" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold" :class="[primaryTextClass]">
                      {{ getActivityTitle(activity.action) }}
                    </p>
                    <p class="mt-1 text-sm" :class="[mutedTextClass]">
                      {{ getActivityDescription(activity) }}
                    </p>
                  </div>
                  <span
                    class="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="[isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600']"
                  >
                    {{ getActivityTargetTypeTitle(activity.targetTypeValue) }}
                  </span>
                </div>
                <div
                  class="mt-3 flex flex-wrap items-center gap-2 text-xs"
                  :class="[mutedTextClass]"
                >
                  <span>{{ formatCreatedAt(activity.createdAtValue) }}</span>
                  <span v-if="activity.count > 1"
                    >· {{ activity.count }} {{ t('common.files') }}</span
                  >
                  <span v-if="activity.targetId ?? activity.target_id">
                    · ID {{ activity.targetId ?? activity.target_id }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SideDrawer>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'
import type { Component, PropType } from 'vue'
import { useRouter } from 'vue-router'
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadCloudIcon,
  FileIcon,
  FilesIcon,
  FileTextIcon,
  HardDriveIcon,
  HistoryIcon,
  LightbulbIcon,
  ListFilterIcon,
  PencilIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  UploadCloudIcon
} from 'lucide-vue-next'
import StatCard from '@/components/common/StatCard.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import { useDashboardStats, useInjectedDarkMode } from '@/composables'
import { useI18n } from 'vue-i18n'
import { formatFileSize, formatTimestamp } from '@/utils/common'
import { ROUTES } from '@/constants'
import type {
  DashboardActivityViewItem,
  DashboardHealthAction,
  DashboardInsightSeverity,
  DashboardMaintenanceQueueViewItem,
  DashboardOperationalInsightViewItem
} from '@/types'

const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const router = useRouter()
const {
  activityActionOptions,
  activityFilters,
  activityTargetTypeOptions,
  activityTimeline,
  activityTimelineError,
  activityTimelineStoredTotal,
  activityTimelineTotal,
  applyActivityFilters,
  closeActivityTimeline,
  dashboardData,
  errorMessage,
  fetchActivityTimeline,
  fetchDashboardData,
  hasActivityFilters,
  isActivityTimelineLoading,
  isActivityTimelineOpen,
  isLoading,
  lastUpdatedText,
  openActivityTimeline,
  resetActivityFilters
} = useDashboardStats({
  activityLoadFailedMessage: t('admin.dashboard.activityLoadFailed'),
  loadFailedMessage: t('admin.dashboard.loadFailed')
})

const handleOpenActivityTimeline = () => {
  void openActivityTimeline()
}

const handleApplyActivityFilters = () => {
  void applyActivityFilters()
}

const handleResetActivityFilters = () => {
  void resetActivityFilters()
}

const handleRefreshActivityTimeline = () => {
  void fetchActivityTimeline()
}

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

const getSuffixRatio = (count: number) => Math.round((count / maxSuffixCount.value) * 100)

const operationalInsightIconMap: Record<DashboardInsightSeverity, Component> = {
  danger: AlertTriangleIcon,
  warning: ClockIcon,
  success: CheckCircleIcon,
  neutral: ShieldCheckIcon
}

const getOperationalInsightIcon = (severity: DashboardInsightSeverity) =>
  operationalInsightIconMap[severity]

const getOperationalInsightClass = (severity: DashboardInsightSeverity) => {
  const darkClasses: Record<DashboardInsightSeverity, string> = {
    danger: 'border-red-500/25 bg-red-500/10 text-red-100 hover:border-red-400/60',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100 hover:border-amber-400/60',
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/60',
    neutral: 'border-gray-700 bg-gray-800/70 text-gray-100 hover:border-indigo-500/50'
  }
  const lightClasses: Record<DashboardInsightSeverity, string> = {
    danger: 'border-red-100 bg-red-50 text-red-800 hover:border-red-300',
    warning: 'border-amber-100 bg-amber-50 text-amber-800 hover:border-amber-300',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-300',
    neutral: 'border-gray-100 bg-white text-gray-800 shadow-sm hover:border-indigo-200'
  }

  return isDarkMode.value ? darkClasses[severity] : lightClasses[severity]
}

const getOperationalInsightSeverityLabel = (severity: DashboardInsightSeverity) =>
  t(`admin.dashboard.operationalInsightSeverity.${severity}`)

const getOperationalInsightTitle = (insight: DashboardOperationalInsightViewItem) => {
  const key = `admin.dashboard.operationalInsights.${insight.key}.title`
  const title = t(key, { count: insight.count })
  return title === key ? insight.key : title
}

const getOperationalInsightDescription = (insight: DashboardOperationalInsightViewItem) => {
  const key = `admin.dashboard.operationalInsights.${insight.key}.description`
  const description = t(key, { count: insight.count })
  return description === key ? insight.key : description
}

const getOperationalInsightActionLabel = (insight: DashboardOperationalInsightViewItem) =>
  insight.actionTypeValue === 'settings'
    ? t('admin.dashboard.operationalInsightActionSettings')
    : t('admin.dashboard.operationalInsightActionFileQueue')

const openOperationalInsight = (insight: DashboardOperationalInsightViewItem) => {
  if (insight.actionTypeValue === 'settings') {
    void router.push({ path: ROUTES.SETTINGS })
    return
  }

  const health = insight.targetHealthValue
  void router.push({
    path: ROUTES.FILE_MANAGE,
    query: health ? { health } : {}
  })
}

const getMaintenanceQueueIcon = (severity: DashboardInsightSeverity) =>
  operationalInsightIconMap[severity]

const getMaintenanceQueueClass = (severity: DashboardInsightSeverity) =>
  getOperationalInsightClass(severity)

const getMaintenanceQueueTitle = (item: DashboardMaintenanceQueueViewItem) => {
  const key = `admin.dashboard.maintenanceQueueItems.${item.key}.title`
  const title = t(key, { count: item.count })
  return title === key ? item.key : title
}

const getMaintenanceQueueDescription = (item: DashboardMaintenanceQueueViewItem) => {
  const key = `admin.dashboard.maintenanceQueueItems.${item.key}.description`
  const description = t(key, { count: item.count })
  return description === key ? item.key : description
}

const getMaintenanceQueueActionLabel = (item: DashboardMaintenanceQueueViewItem) =>
  item.actionTypeValue === 'settings'
    ? t('admin.dashboard.maintenanceQueueActionSettings')
    : t('admin.dashboard.maintenanceQueueActionFileQueue')

const openMaintenanceQueueItem = (item: DashboardMaintenanceQueueViewItem) => {
  if (item.actionTypeValue === 'settings') {
    void router.push({ path: ROUTES.SETTINGS })
    return
  }

  const health = item.targetHealthValue
  void router.push({
    path: ROUTES.FILE_MANAGE,
    query: health ? { health } : {}
  })
}

const formatCreatedAt = (value: string | null) => {
  if (!value) return '-'
  return formatTimestamp(value, 'datetime')
}

type ActivityTone = 'danger' | 'warning' | 'success' | 'neutral'

const activityIconMap: Record<string, Component> = {
  'file.delete': TrashIcon,
  'files.batch_delete': TrashIcon,
  'file.update': PencilIcon,
  'files.batch_update': PencilIcon,
  'file.policy_action': ClockIcon,
  'files.batch_policy_action': ClockIcon,
  'file.metadata_update': FileTextIcon,
  'file.view_preset_create': SlidersHorizontalIcon,
  'file.view_preset_update': SlidersHorizontalIcon,
  'file.view_preset_delete': SlidersHorizontalIcon,
  'config.update': SlidersHorizontalIcon,
  'local_file.delete': TrashIcon,
  'local_file.share': UploadCloudIcon
}

const getActivityIcon = (action: string) => activityIconMap[action] || HistoryIcon

const getActivityTone = (action: string): ActivityTone => {
  if (action.includes('delete')) return 'danger'
  if (action.includes('policy') || action.includes('update')) return 'warning'
  if (action.includes('share') || action.includes('create')) return 'success'
  return 'neutral'
}

const getActivityIconClass = (action: string) => {
  const tone = getActivityTone(action)
  const darkClasses: Record<ActivityTone, string> = {
    danger: 'bg-red-500/10 text-red-300',
    warning: 'bg-amber-500/10 text-amber-300',
    success: 'bg-emerald-500/10 text-emerald-300',
    neutral: 'bg-gray-700 text-gray-300'
  }
  const lightClasses: Record<ActivityTone, string> = {
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
    neutral: 'bg-gray-100 text-gray-700'
  }

  return isDarkMode.value ? darkClasses[tone] : lightClasses[tone]
}

const getActivityTitle = (action: string) => {
  const key = `admin.dashboard.activityActions.${action}`
  const title = t(key)
  return title === key ? action : title
}

const getActivityTargetTypeTitle = (targetType: string) => {
  const key = `admin.dashboard.activityTargetTypes.${targetType}`
  const title = t(key)
  return title === key ? targetType : title
}

const getActivityDescription = (activity: DashboardActivityViewItem) => {
  const targetName = activity.targetNameValue || t('admin.dashboard.activityUnknownTarget')
  if (activity.count > 1) {
    return t('admin.dashboard.activityBatchDescription', {
      target: targetName,
      count: activity.count
    })
  }

  return t('admin.dashboard.activityDescription', {
    target: targetName
  })
}

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
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/40',
    neutral: 'border-gray-700 bg-gray-900/30 text-gray-300 hover:border-gray-600'
  }
  const lightClasses: Record<DashboardHealthAction['tone'], string> = {
    danger: 'border-red-100 bg-red-50 text-red-700 hover:border-red-200',
    warning: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200',
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
      h(
        'div',
        {
          class:
            'flex items-center justify-between gap-4 border-b border-gray-200/60 pb-3 last:border-b-0 dark:border-gray-700'
        },
        [
          h('span', { class: 'text-sm text-gray-500 dark:text-gray-400' }, props.label),
          h('span', { class: 'text-sm font-medium text-gray-900 dark:text-white' }, props.value)
        ]
      )
  }
})

onMounted(() => {
  void fetchDashboardData()
})
</script>
