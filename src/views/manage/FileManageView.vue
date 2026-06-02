<template>
  <div class="p-6 overflow-y-auto custom-scrollbar">
    <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-2xl font-bold" :class="[primaryTextClass]">
          {{ t('fileManage.title') }}
        </h2>
        <p class="mt-1 text-sm" :class="[mutedTextClass]">
          {{ t('fileManage.subtitle', { count: summary.totalFiles }) }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" :loading="isLoading" @click="refreshFiles">
          <template #icon>
            <RefreshCwIcon class="mr-2 h-4 w-4" />
          </template>
          {{ t('fileManage.refresh') }}
        </BaseButton>
        <BaseButton
          v-if="hasActiveFilters"
          variant="outline"
          :disabled="isLoading"
          @click="handleResetFilters"
        >
          <template #icon>
            <XIcon class="mr-2 h-4 w-4" />
          </template>
          {{ t('fileManage.resetFilters') }}
        </BaseButton>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-lg border p-4"
        :class="[panelClass]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm" :class="[mutedTextClass]">{{ card.label }}</p>
            <p class="mt-2 text-2xl font-semibold" :class="[primaryTextClass]">
              {{ card.value }}
            </p>
          </div>
          <div class="rounded-lg p-2" :class="[card.iconClass]">
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>

    <section class="mb-6 rounded-lg border p-4" :class="[panelClass]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
          <div class="relative min-w-[220px] flex-1">
            <input
              v-model="params.keyword"
              type="text"
              :placeholder="t('fileManage.searchPlaceholder')"
              class="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              :class="[
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              ]"
              @keyup.enter="handleSearch"
            />
            <SearchIcon
              class="absolute left-3 top-3 h-4 w-4"
              :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
            />
          </div>
          <BaseButton :loading="isLoading" @click="handleSearch">
            <template #icon>
              <SearchIcon class="mr-2 h-4 w-4" />
            </template>
            {{ t('common.search') }}
          </BaseButton>
        </div>

        <div class="flex flex-col gap-3 xl:items-end">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center text-xs font-medium" :class="[mutedTextClass]">
              <FilterIcon class="mr-1 h-3.5 w-3.5" />
              {{ t('fileManage.statusLabel') }}
            </span>
            <button
              v-for="option in statusFilterOptions"
              :key="option.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="getStatusFilterClass(option.value)"
              @click="setStatusFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center text-xs font-medium" :class="[mutedTextClass]">
              <ActivityIcon class="mr-1 h-3.5 w-3.5" />
              {{ t('fileManage.healthLabel') }}
            </span>
            <button
              v-for="option in healthFilterOptions"
              :key="option.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="getHealthFilterClass(option.value)"
              @click="handleHealthFilterChange(option.value)"
            >
              <span>{{ option.label }}</span>
              <span v-if="typeof option.count === 'number'">({{ option.count }})</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center text-xs font-medium" :class="[mutedTextClass]">
              <ArchiveIcon class="mr-1 h-3.5 w-3.5" />
              {{ t('fileManage.typeLabel') }}
            </span>
            <button
              v-for="option in typeFilterOptions"
              :key="option.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="getTypeFilterClass(option.value)"
              @click="setTypeFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="text-sm" :class="[mutedTextClass]">
          {{ t('fileManage.sortBy') }}
        </label>
        <select
          v-model="params.sortBy"
          class="rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          :class="[fieldClass]"
          @change="handleSearch"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <select
          v-model="params.sortOrder"
          class="rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          :class="[fieldClass]"
          @change="handleSearch"
        >
          <option v-for="option in sortOrderOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </section>

    <section
      v-if="tableData.length > 0"
      class="mb-4 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      :class="[panelClass]"
    >
      <label class="inline-flex items-center gap-2 text-sm" :class="[primaryTextClass]">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          :checked="isAllCurrentPageSelected"
          :disabled="isBatchActionRunning"
          :indeterminate="isCurrentPagePartiallySelected"
          @change="toggleCurrentPageSelection"
        />
        <span>
          {{
            hasSelectedFiles
              ? t('fileManage.selectedCount', { count: selectedCount })
              : t('fileManage.selectCurrentPage')
          }}
        </span>
      </label>

      <div class="flex flex-wrap items-center gap-2">
        <BaseButton
          v-if="hasSelectedFiles"
          variant="outline"
          size="sm"
          :disabled="isBatchActionRunning"
          @click="clearSelection"
        >
          <template #icon>
            <XIcon class="mr-2 h-4 w-4" />
          </template>
          {{ t('fileManage.clearSelection') }}
        </BaseButton>
        <BaseButton
          v-for="option in batchPolicyActionOptions"
          :key="option.action"
          variant="outline"
          size="sm"
          :title="option.description"
          :disabled="!hasSelectedFiles || isBatchDeleting || isBatchUpdating"
          :loading="isBatchPolicyActionRunning"
          @click="applySelectedPolicyAction(option.action)"
        >
          <template #icon>
            <component :is="getDetailPolicyActionIcon(option.action)" class="mr-2 h-4 w-4" />
          </template>
          {{ option.label }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="!hasSelectedFiles || isBatchDeleting || isBatchPolicyActionRunning"
          :loading="isBatchUpdating"
          @click="openBatchEditModal"
        >
          <template #icon>
            <ClockIcon class="mr-2 h-4 w-4" />
          </template>
          {{ t('fileManage.batchEdit') }}
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          :disabled="!hasSelectedFiles || isBatchUpdating || isBatchPolicyActionRunning"
          :loading="isBatchDeleting"
          @click="deleteSelectedFiles"
        >
          <template #icon>
            <TrashIcon class="mr-2 h-4 w-4" />
          </template>
          {{ t('fileManage.batchDelete') }}
        </BaseButton>
      </div>
    </section>

    <DataTable :title="t('fileManage.allFiles')" :headers="fileTableHeaders">
      <template #body>
        <tr v-if="isLoading">
          <td :colspan="fileTableHeaders.length" class="px-6 py-12 text-center">
            <div class="inline-flex items-center text-sm" :class="[mutedTextClass]">
              <RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
              {{ t('common.loading') }}
            </div>
          </td>
        </tr>

        <tr v-else-if="hasLoadError">
          <td :colspan="fileTableHeaders.length" class="px-6 py-12 text-center">
            <div class="mx-auto max-w-sm">
              <p class="font-medium" :class="[primaryTextClass]">
                {{ t('fileManage.loadError') }}
              </p>
              <BaseButton class="mt-4" variant="secondary" @click="refreshFiles">
                <template #icon>
                  <RefreshCwIcon class="mr-2 h-4 w-4" />
                </template>
                {{ t('fileManage.refresh') }}
              </BaseButton>
            </div>
          </td>
        </tr>

        <tr v-else-if="tableData.length === 0">
          <td :colspan="fileTableHeaders.length" class="px-6 py-12 text-center">
            <div class="mx-auto max-w-sm">
              <p class="font-medium" :class="[primaryTextClass]">
                {{ hasActiveFilters ? t('fileManage.noMatches') : t('common.noData') }}
              </p>
              <BaseButton
                v-if="hasActiveFilters"
                class="mt-4"
                variant="secondary"
                @click="handleResetFilters"
              >
                <template #icon>
                  <XIcon class="mr-2 h-4 w-4" />
                </template>
                {{ t('fileManage.resetFilters') }}
              </BaseButton>
            </div>
          </td>
        </tr>

        <template v-else>
          <tr
            v-for="file in tableData"
            :key="file.id"
            class="transition-colors duration-200"
            :class="[
              selectedFileIds.has(file.id)
                ? isDarkMode
                  ? 'bg-indigo-950/30'
                  : 'bg-indigo-50/70'
                : '',
              isDarkMode ? 'hover:bg-gray-700/70' : 'hover:bg-gray-50'
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                :checked="selectedFileIds.has(file.id)"
                :disabled="isBatchActionRunning"
                :aria-label="t('fileManage.selectFile', { name: file.displayName })"
                @change="toggleFileSelection(file.id)"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-medium select-all" :class="[primaryTextClass]">
                {{ file.code }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex min-w-0 items-center gap-3">
                <div class="rounded-lg p-2" :class="[isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
                  <FileTextIcon v-if="file.isTextFile" class="h-4 w-4" :class="[mutedTextClass]" />
                  <FileIcon v-else class="h-4 w-4" :class="[mutedTextClass]" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium" :class="[primaryTextClass]">
                    {{ file.displayName }}
                  </p>
                  <p class="mt-0.5 truncate text-xs" :class="[mutedTextClass]">
                    {{ file.suffix || t('fileManage.textType') }}
                  </p>
                  <div class="mt-2 flex max-w-sm flex-wrap items-center gap-1.5">
                    <span
                      class="inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="getInsightBadgeClass(file.statusInsightSeverity)"
                      :title="file.displayHealthAction"
                    >
                      {{ file.displayHealthState }}
                    </span>
                    <span
                      class="max-w-[16rem] truncate text-xs"
                      :class="[mutedTextClass]"
                      :title="file.displayHealthAction"
                    >
                      {{ file.displayHealthAction }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                :class="getTypeBadgeClass(file)"
              >
                {{ getTypeLabel(file) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                :class="[isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800']"
              >
                {{ file.displaySize }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm" :class="[primaryTextClass]">{{ file.displayUsage }}</div>
              <div class="mt-0.5 text-xs" :class="[mutedTextClass]">
                {{
                  file.remainingDownloadsValue === null
                    ? t('fileManage.unlimited')
                    : t('fileManage.remaining', { count: file.remainingDownloadsValue })
                }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm" :class="[primaryTextClass]">
                {{ file.displayExpiredAt }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                :class="getStatusBadgeClass(file)"
              >
                {{ file.isExpiredFile ? t('fileManage.expired') : t('fileManage.active') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  :title="t('fileManage.detail')"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200"
                  :class="[
                    isDarkMode
                      ? 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/30'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  ]"
                  @click="openFileDetail(file)"
                >
                  <FileTextIcon class="mr-1.5 h-4 w-4" />
                  {{ t('fileManage.detail') }}
                </button>
                <button
                  v-if="file.canPreviewText"
                  type="button"
                  :title="t('fileManage.viewText')"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                  @click="openTextPreview(file)"
                >
                  <EyeIcon class="mr-1.5 h-4 w-4" />
                  {{ t('fileManage.viewText') }}
                </button>
                <button
                  type="button"
                  :title="
                    file.isTextFile ? t('fileManage.exportText') : t('fileManage.downloadFile')
                  "
                  :disabled="Boolean(downloadingFileId)"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                  :class="[
                    isDarkMode
                      ? 'bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  ]"
                  @click="downloadFile(file)"
                >
                  <RefreshCwIcon
                    v-if="downloadingFileId === file.id"
                    class="mr-1.5 h-4 w-4 animate-spin"
                  />
                  <DownloadIcon v-else class="mr-1.5 h-4 w-4" />
                  {{ file.isTextFile ? t('fileManage.exportText') : t('fileManage.downloadFile') }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200"
                  :class="[
                    isDarkMode
                      ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  ]"
                  @click="openEditModal(file)"
                >
                  <PencilIcon class="mr-1.5 h-4 w-4" />
                  {{ t('common.edit') }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200"
                  :class="[
                    isDarkMode
                      ? 'bg-red-900/20 text-red-300 hover:bg-red-900/30'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  ]"
                  @click="deleteFile(file.id)"
                >
                  <TrashIcon class="mr-1.5 h-4 w-4" />
                  {{ t('common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </template>
      </template>
      <template #footer>
        <DataPagination
          v-if="params.total > 0"
          :current-page="params.page"
          :page-size="params.size"
          :total="params.total"
          @page-change="handlePageChange"
        />
      </template>
    </DataTable>

    <BaseModal :show="showFileDetailModal" size="xl" @close="closeFileDetail">
      <template #header>
        <div class="flex min-w-0 items-center space-x-3">
          <div class="rounded-lg p-2" :class="[isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50']">
            <FileTextIcon
              class="h-5 w-5"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
          </div>
          <div class="min-w-0">
            <h3
              class="truncate text-xl font-semibold leading-6"
              :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
            >
              {{ t('fileManage.detailTitle') }}
            </h3>
            <p v-if="selectedFileDetail" class="mt-1 truncate text-sm" :class="[mutedTextClass]">
              {{ selectedFileDetail.displayName }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedFileDetail" class="space-y-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex min-w-0 items-start gap-3">
            <div
              class="rounded-lg p-3"
              :class="[isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700']"
            >
              <FileTextIcon v-if="selectedFileDetail.isTextFile" class="h-5 w-5" />
              <FileIcon v-else class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <h4 class="break-words text-lg font-semibold" :class="[primaryTextClass]">
                {{ selectedFileDetail.displayName }}
              </h4>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="getTypeBadgeClass(selectedFileDetail)"
                >
                  {{ getTypeLabel(selectedFileDetail) }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="getStatusBadgeClass(selectedFileDetail)"
                >
                  {{
                    selectedFileDetail.isExpiredFile
                      ? t('fileManage.expired')
                      : t('fileManage.active')
                  }}
                </span>
                <span
                  v-if="selectedFileDetail.isPermanentFile"
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    isDarkMode
                      ? 'bg-emerald-900/30 text-emerald-300'
                      : 'bg-emerald-100 text-emerald-700'
                  "
                >
                  {{ t('fileManage.permanent') }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="isDetailLoading"
            class="inline-flex items-center text-sm"
            :class="[mutedTextClass]"
          >
            <RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
            {{ t('fileManage.detailLoading') }}
          </div>
        </div>

        <div
          class="rounded-lg border px-4 py-3"
          :class="[isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50']"
        >
          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase" :class="[mutedTextClass]">
                {{ t('fileManage.form.code') }}
              </p>
              <p class="mt-1 select-all text-lg font-semibold" :class="[primaryTextClass]">
                {{ selectedFileDetail.code }}
              </p>
              <p class="mt-1 truncate text-xs" :class="[mutedTextClass]">
                {{ selectedFileDetail.displayRetrieveUrl }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton size="sm" variant="secondary" @click="copyDetailRetrieveCode">
                <template #icon>
                  <CopyIcon class="mr-2 h-4 w-4" />
                </template>
                {{ t('fileManage.copyCode') }}
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="copyDetailRetrieveLink">
                <template #icon>
                  <CopyIcon class="mr-2 h-4 w-4" />
                </template>
                {{ t('fileManage.copyLink') }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            class="flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :class="detailActionClass"
            @click="openDetailEditModal"
          >
            <PencilIcon class="mr-2 h-4 w-4" />
            {{ t('common.edit') }}
          </button>
          <button
            v-if="selectedFileDetail.canPreviewText"
            type="button"
            class="flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="detailActionClass"
            @click="openDetailTextPreview"
          >
            <EyeIcon class="mr-2 h-4 w-4" />
            {{ t('fileManage.viewText') }}
          </button>
          <button
            type="button"
            class="flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :class="detailActionClass"
            :disabled="!selectedFileDetail.canDownloadFile || Boolean(downloadingFileId)"
            @click="downloadFile(selectedFileDetail)"
          >
            <RefreshCwIcon
              v-if="downloadingFileId === selectedFileDetail.id"
              class="mr-2 h-4 w-4 animate-spin"
            />
            <DownloadIcon v-else class="mr-2 h-4 w-4" />
            {{
              selectedFileDetail.isTextFile
                ? t('fileManage.exportText')
                : t('fileManage.downloadFile')
            }}
          </button>
        </div>

        <section
          class="rounded-lg border px-4 py-4"
          :class="getInsightPanelClass(selectedFileDetail.statusInsightSeverity)"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase" :class="[mutedTextClass]">
                {{ t('fileManage.statusInsight') }}
              </p>
              <h4 class="mt-1 text-base font-semibold" :class="[primaryTextClass]">
                {{ getInsightStateLabel(selectedFileDetail.statusInsightState) }}
              </h4>
              <p class="mt-1 text-sm" :class="[mutedTextClass]">
                {{ t('fileManage.nextAction') }}:
                {{ getInsightActionLabel(selectedFileDetail.statusInsightNextAction) }}
              </p>
            </div>
            <span
              class="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium"
              :class="getInsightBadgeClass(selectedFileDetail.statusInsightSeverity)"
            >
              {{ getInsightSeverityLabel(selectedFileDetail.statusInsightSeverity) }}
            </span>
          </div>

          <div v-if="detailInsightReasonLabels.length > 0" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="reason in detailInsightReasonLabels"
              :key="reason"
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'"
            >
              {{ reason }}
            </span>
          </div>

          <div class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <button
              v-for="action in detailPolicyActionOptions"
              :key="action.action"
              type="button"
              class="flex min-h-16 items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="detailPolicyActionClass"
              :disabled="isDetailPolicyActionRunning || isDetailLoading"
              :title="action.description"
              @click="applyDetailPolicyAction(action.action)"
            >
              <RefreshCwIcon
                v-if="isDetailPolicyActionRunning"
                class="mt-0.5 h-4 w-4 shrink-0 animate-spin"
              />
              <component
                :is="getDetailPolicyActionIcon(action.action)"
                v-else
                class="mt-0.5 h-4 w-4 shrink-0"
              />
              <span class="min-w-0">
                <span class="block text-sm font-medium">{{ action.label }}</span>
                <span class="mt-0.5 block text-xs leading-4" :class="[mutedTextClass]">
                  {{ action.description }}
                </span>
              </span>
            </button>
          </div>
        </section>

        <section class="space-y-3">
          <h4 class="text-sm font-semibold" :class="[primaryTextClass]">
            {{ t('fileManage.overview') }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="item in detailOverviewItems"
              :key="item.label"
              class="rounded-lg border px-4 py-3"
              :class="[isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white']"
            >
              <p class="text-xs" :class="[mutedTextClass]">{{ item.label }}</p>
              <p class="mt-1 break-words text-sm font-medium" :class="[primaryTextClass]">
                {{ item.value }}
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-3">
          <h4 class="text-sm font-semibold" :class="[primaryTextClass]">
            {{ t('fileManage.policyInfo') }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="item in detailPolicyItems"
              :key="item.label"
              class="rounded-lg border px-4 py-3"
              :class="[isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white']"
            >
              <p class="text-xs" :class="[mutedTextClass]">{{ item.label }}</p>
              <p class="mt-1 break-words text-sm font-medium" :class="[primaryTextClass]">
                {{ item.value }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="selectedFileDetail.detailTimeline.length > 0" class="space-y-3">
          <h4 class="text-sm font-semibold" :class="[primaryTextClass]">
            {{ t('fileManage.lifecycle') }}
          </h4>
          <div
            class="rounded-lg border px-4 py-4"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white']"
          >
            <div
              v-for="(item, index) in selectedFileDetail.detailTimeline"
              :key="`${item.key}-${index}`"
              class="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
            >
              <div class="flex flex-col items-center">
                <span
                  class="mt-1 h-3 w-3 rounded-full"
                  :class="getTimelineDotClass(item.severity)"
                />
                <span
                  v-if="index < selectedFileDetail.detailTimeline.length - 1"
                  class="my-1 w-px flex-1"
                  :class="[isDarkMode ? 'bg-gray-600' : 'bg-gray-200']"
                />
              </div>
              <div
                class="mb-3 rounded-lg border px-3 py-2 last:mb-0"
                :class="[
                  isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50'
                ]"
              >
                <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p class="text-sm font-medium" :class="[primaryTextClass]">
                    {{ item.displayTitle }}
                  </p>
                  <p class="text-xs" :class="[mutedTextClass]">
                    {{ item.displayMeta }}
                  </p>
                </div>
                <p class="mt-1 text-sm" :class="[mutedTextClass]">
                  {{ item.displayDescription }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-3">
          <h4 class="text-sm font-semibold" :class="[primaryTextClass]">
            {{ t('fileManage.storageInfo') }}
          </h4>
          <div class="grid gap-3">
            <div
              v-for="item in detailStorageItems"
              :key="item.label"
              class="grid gap-1 rounded-lg border px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center"
              :class="[isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white']"
            >
              <p class="text-xs" :class="[mutedTextClass]">{{ item.label }}</p>
              <p
                class="break-all text-sm font-medium"
                :class="[item.mono ? 'font-mono' : '', primaryTextClass]"
              >
                {{ item.value }}
              </p>
            </div>
          </div>
        </section>
      </div>
      <div
        v-else
        class="flex min-h-32 items-center justify-center text-sm"
        :class="[mutedTextClass]"
      >
        <RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
        {{ t('fileManage.detailLoading') }}
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeFileDetail">
          {{ t('common.close') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showEditModal" size="lg" @close="closeEditModal">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-lg" :class="[isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50']">
            <PencilIcon
              class="w-5 h-5"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
          </div>
          <h3
            class="text-xl font-semibold leading-6"
            :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
          >
            {{ t('fileManage.editFileInfo') }}
          </h3>
        </div>
      </template>

      <div class="grid gap-6">
        <FileEditField
          v-model="editForm.code"
          :label="t('fileManage.form.code')"
          :placeholder="t('fileManage.form.codePlaceholder')"
        />
        <FileEditField
          v-model="editForm.prefix"
          :label="t('fileManage.form.filename')"
          :placeholder="t('fileManage.form.filenamePlaceholder')"
        />
        <FileEditField
          v-model="editForm.suffix"
          :label="t('fileManage.form.suffix')"
          :placeholder="t('fileManage.form.suffixPlaceholder')"
        />
        <FileEditField
          v-model="editForm.expired_at"
          type="datetime-local"
          :label="t('send.expiration.label')"
        />
        <FileEditField
          v-model="editForm.expired_count"
          type="number"
          :label="t('fileManage.form.downloadLimit')"
          :placeholder="t('fileManage.form.downloadLimitPlaceholder')"
        />
      </div>

      <template #footer>
        <BaseButton variant="secondary" :disabled="isSaving" @click="closeEditModal">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton :loading="isSaving" @click="handleUpdate">
          <template #icon>
            <CheckIcon class="w-4 h-4 mr-2" />
          </template>
          {{ t('fileManage.saveChanges') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showBatchEditModal" size="lg" @close="closeBatchEditModal()">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-lg" :class="[isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50']">
            <ClockIcon
              class="w-5 h-5"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
          </div>
          <h3
            class="text-xl font-semibold leading-6"
            :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
          >
            {{ t('fileManage.batchEditTitle') }}
          </h3>
        </div>
      </template>

      <div class="space-y-5">
        <div
          class="rounded-lg border px-4 py-3 text-sm"
          :class="[
            isDarkMode
              ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200'
              : 'border-indigo-100 bg-indigo-50 text-indigo-700'
          ]"
        >
          {{ t('fileManage.batchEditSelected', { count: selectedCount }) }}
        </div>

        <div class="space-y-3">
          <p class="text-sm font-medium" :class="[primaryTextClass]">
            {{ t('fileManage.batchEditMode') }}
          </p>
          <div class="grid gap-2 sm:grid-cols-3">
            <button
              v-for="option in batchEditModeOptions"
              :key="option.value"
              type="button"
              class="flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              :class="getBatchEditModeClass(option.value)"
              :disabled="isBatchUpdating"
              @click="batchEditForm.mode = option.value"
            >
              <component :is="option.icon" class="mr-2 h-4 w-4" />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <FileEditField
          v-if="batchEditForm.mode === 'expiresAt'"
          v-model="batchEditForm.expired_at"
          type="datetime-local"
          :label="t('fileManage.batchEditExpiresAt')"
        />
        <FileEditField
          v-else-if="batchEditForm.mode === 'downloadLimit'"
          v-model="batchEditForm.expired_count"
          type="number"
          :label="t('fileManage.batchEditDownloadLimit')"
          :placeholder="t('fileManage.form.downloadLimitPlaceholder')"
        />
        <div
          v-else
          class="rounded-lg border px-4 py-3 text-sm"
          :class="[
            isDarkMode
              ? 'border-gray-700 bg-gray-700/50 text-gray-300'
              : 'border-gray-200 bg-gray-50 text-gray-600'
          ]"
        >
          {{ t('fileManage.batchEditForeverHint') }}
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" :disabled="isBatchUpdating" @click="closeBatchEditModal()">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton :loading="isBatchUpdating" @click="handleBatchUpdate">
          <template #icon>
            <CheckIcon class="w-4 h-4 mr-2" />
          </template>
          {{ t('fileManage.applyBatchEdit') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showTextPreview" size="lg" @close="closeTextPreview">
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-lg" :class="[isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50']">
            <FileTextIcon
              class="w-5 h-5"
              :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
            />
          </div>
          <h3
            class="text-xl font-semibold leading-6"
            :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
          >
            {{ previewFile?.displayName || t('fileManage.textPreview') }}
          </h3>
        </div>
      </template>

      <div
        class="max-h-[60vh] overflow-y-auto rounded-lg p-4 custom-scrollbar"
        :class="[isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50']"
      >
        <div
          v-if="isPreviewLoading"
          class="flex min-h-32 items-center justify-center text-sm"
          :class="[mutedTextClass]"
        >
          <RefreshCwIcon class="mr-2 h-4 w-4 animate-spin" />
          {{ t('fileManage.loadingPreview') }}
        </div>
        <pre
          v-else
          class="whitespace-pre-wrap break-words text-sm font-mono"
          :class="[isDarkMode ? 'text-gray-200' : 'text-gray-700']"
          >{{ previewText }}</pre
        >
      </div>
      <div class="mt-2 text-xs" :class="[isDarkMode ? 'text-gray-500' : 'text-gray-400']">
        {{ previewMetaText || t('fileManage.charCount', { count: previewText.length }) }}
      </div>

      <template #footer>
        <BaseButton
          variant="secondary"
          :disabled="isPreviewLoading || !previewText"
          @click="exportPreviewText"
        >
          <template #icon>
            <DownloadIcon class="w-4 h-4 mr-2" />
          </template>
          {{ t('fileManage.exportText') }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          :disabled="isPreviewLoading || !previewText"
          @click="copyText"
        >
          <template #icon>
            <CopyIcon class="w-4 h-4 mr-2" />
          </template>
          {{ t('fileManage.copyText') }}
        </BaseButton>
        <BaseButton @click="closeTextPreview">
          {{ t('common.close') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type {
  AdminBatchEditMode,
  AdminFileHealthFilter,
  AdminFileInsightSeverity,
  AdminFilePolicyAction,
  AdminFileSortBy,
  AdminFileSortOrder,
  AdminFileStatusFilter,
  AdminFileTypeFilter,
  AdminFileViewItem
} from '@/types'
import {
  ActivityIcon,
  ArchiveIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  FilterIcon,
  HardDriveIcon,
  InfinityIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'
import DataTable from '@/components/common/DataTable.vue'
import DataPagination from '@/components/common/DataPagination.vue'
import FileEditField from '@/components/common/FileEditField.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAdminFiles, useInjectedDarkMode } from '@/composables'

const { t } = useI18n()
const isDarkMode = useInjectedDarkMode()
const route = useRoute()
const router = useRouter()

const fileTableHeaders = computed(() => [
  t('fileManage.headers.select'),
  t('fileManage.headers.code'),
  t('fileManage.headers.name'),
  t('fileManage.headers.type'),
  t('fileManage.headers.size'),
  t('fileManage.headers.usage'),
  t('fileManage.headers.expiration'),
  t('fileManage.headers.status'),
  t('fileManage.headers.actions')
])

const {
  tableData,
  hasActiveFilters,
  hasLoadError,
  isLoading,
  isAllCurrentPageSelected,
  isBatchActionRunning,
  isBatchDeleting,
  isBatchPolicyActionRunning,
  isBatchUpdating,
  isCurrentPagePartiallySelected,
  isDetailLoading,
  isDetailPolicyActionRunning,
  isPreviewLoading,
  isSaving,
  batchEditForm,
  batchPolicyActionOptions,
  detailPolicyActionOptions,
  downloadingFileId,
  healthFilterOptions,
  hasSelectedFiles,
  params,
  previewFile,
  previewMetaText,
  selectedFileDetail,
  selectedCount,
  selectedFileIds,
  storageUsedText,
  summary,
  showBatchEditModal,
  showEditModal,
  showFileDetailModal,
  editForm,
  showTextPreview,
  previewText,
  closeBatchEditModal,
  closeEditModal,
  closeFileDetail,
  closeTextPreview,
  copyDetailRetrieveCode,
  copyDetailRetrieveLink,
  copyText,
  clearSelection,
  deleteFile,
  deleteSelectedFiles,
  downloadFile,
  exportPreviewText,
  handlePageChange,
  handleSearch,
  applyDetailPolicyAction,
  applySelectedPolicyAction,
  handleBatchUpdate,
  handleUpdate,
  loadFiles,
  openBatchEditModal,
  openEditModal,
  openFileDetail,
  openTextPreview,
  refreshFiles,
  resetFilters,
  setHealthFilter,
  setStatusFilter,
  setTypeFilter,
  toggleCurrentPageSelection,
  toggleFileSelection
} = useAdminFiles()

const primaryTextClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-gray-900'))
const mutedTextClass = computed(() => (isDarkMode.value ? 'text-gray-400' : 'text-gray-500'))
const panelClass = computed(() =>
  isDarkMode.value ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-white'
)
const fieldClass = computed(() =>
  isDarkMode.value
    ? 'border-gray-600 bg-gray-700 text-white'
    : 'border-gray-300 bg-white text-gray-900'
)
const detailActionClass = computed(() =>
  isDarkMode.value
    ? 'border-gray-700 bg-gray-700/50 text-gray-300 hover:border-gray-600 hover:bg-gray-700'
    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
)
const detailPolicyActionClass = computed(() =>
  isDarkMode.value
    ? 'border-gray-700 bg-gray-800/70 text-gray-200 hover:border-blue-500/40 hover:bg-blue-500/10'
    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
)

type DetailInfoItem = {
  label: string
  value: string
  mono?: boolean
}

const emptyDetailValue = '-'
const getBooleanLabel = (value: boolean) => t(value ? 'fileManage.yes' : 'fileManage.no')
const formatDetailValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return emptyDetailValue
  return String(value)
}

const detailOverviewItems = computed<DetailInfoItem[]>(() => {
  const file = selectedFileDetail.value
  if (!file) return []

  return [
    { label: t('fileManage.form.code'), value: file.code, mono: true },
    { label: t('fileManage.createdAt'), value: file.displayCreatedAt },
    { label: t('fileManage.headers.size'), value: file.displaySize },
    { label: t('fileManage.headers.usage'), value: file.displayUsage },
    {
      label: t('fileManage.remainingDownloads'),
      value:
        file.remainingDownloadsValue === null
          ? t('fileManage.unlimited')
          : t('fileManage.remaining', { count: file.remainingDownloadsValue })
    },
    {
      label: t('fileManage.textLength'),
      value: file.isTextFile
        ? t('fileManage.charCount', { count: file.textLengthValue })
        : emptyDetailValue
    }
  ]
})

const detailPolicyItems = computed<DetailInfoItem[]>(() => {
  const file = selectedFileDetail.value
  if (!file) return []

  return [
    { label: t('fileManage.permanent'), value: getBooleanLabel(file.isPermanentFile) },
    {
      label: t('fileManage.hasDownloadLimit'),
      value: getBooleanLabel(file.hasDownloadLimitFile)
    },
    {
      label: t('fileManage.hasExpirationTime'),
      value: getBooleanLabel(file.hasExpirationTimeFile)
    },
    { label: t('fileManage.headers.expiration'), value: file.displayExpiredAt },
    {
      label: t('fileManage.canPreviewText'),
      value: getBooleanLabel(file.canPreviewText)
    },
    {
      label: t('fileManage.canDownload'),
      value: getBooleanLabel(file.canDownloadFile)
    }
  ]
})

const detailStorageItems = computed<DetailInfoItem[]>(() => {
  const file = selectedFileDetail.value
  if (!file) return []

  return [
    {
      label: t('fileManage.storageBackend'),
      value: formatDetailValue(file.storageBackendValue)
    },
    {
      label: t('fileManage.fileHash'),
      value: formatDetailValue(file.fileHashValue),
      mono: true
    },
    {
      label: t('fileManage.isChunked'),
      value: getBooleanLabel(file.isChunkedStorage)
    },
    {
      label: t('fileManage.filePath'),
      value: formatDetailValue(file.filePathValue),
      mono: true
    },
    {
      label: t('fileManage.uuidFileName'),
      value: formatDetailValue(file.uuidFileNameValue),
      mono: true
    },
    {
      label: t('fileManage.uploadId'),
      value: formatDetailValue(file.uploadIdValue),
      mono: true
    }
  ]
})

const detailInsightReasonLabels = computed(() => {
  const file = selectedFileDetail.value
  if (!file) return []

  return file.statusInsightReasons.map((reason) => t(`fileManage.insightReasons.${reason}`))
})

const openDetailEditModal = () => {
  if (!selectedFileDetail.value) return

  const file = selectedFileDetail.value
  closeFileDetail()
  openEditModal(file)
}

const openDetailTextPreview = () => {
  if (!selectedFileDetail.value) return

  const file = selectedFileDetail.value
  closeFileDetail()
  void openTextPreview(file)
}

const summaryCards = computed(() => [
  {
    label: t('fileManage.totalFiles'),
    value: summary.value.totalFiles,
    icon: ArchiveIcon,
    iconClass: isDarkMode.value
      ? 'bg-indigo-900/30 text-indigo-300'
      : 'bg-indigo-50 text-indigo-600'
  },
  {
    label: t('fileManage.activeFiles'),
    value: summary.value.activeCount,
    icon: ActivityIcon,
    iconClass: isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-600'
  },
  {
    label: t('fileManage.expiredFiles'),
    value: summary.value.expiredCount,
    icon: ClockIcon,
    iconClass: isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'
  },
  {
    label: t('fileManage.storageUsed'),
    value: storageUsedText.value,
    icon: HardDriveIcon,
    iconClass: isDarkMode.value
      ? 'bg-purple-900/30 text-purple-300'
      : 'bg-purple-50 text-purple-600'
  }
])

const statusFilterOptions = computed<{ value: AdminFileStatusFilter; label: string }[]>(() => [
  { value: 'all', label: t('fileManage.all') },
  { value: 'active', label: t('fileManage.active') },
  { value: 'expired', label: t('fileManage.expired') }
])

const typeFilterOptions = computed<{ value: AdminFileTypeFilter; label: string }[]>(() => [
  { value: 'all', label: t('fileManage.all') },
  { value: 'file', label: t('fileManage.fileType') },
  { value: 'text', label: t('fileManage.textType') },
  { value: 'chunked', label: t('fileManage.chunkedType') }
])

const sortOptions = computed<{ value: AdminFileSortBy; label: string }[]>(() => [
  { value: 'created_at', label: t('fileManage.sort.createdAt') },
  { value: 'expired_at', label: t('fileManage.sort.expiredAt') },
  { value: 'name', label: t('fileManage.sort.name') },
  { value: 'size', label: t('fileManage.sort.size') },
  { value: 'used_count', label: t('fileManage.sort.usedCount') },
  { value: 'code', label: t('fileManage.sort.code') }
])

const sortOrderOptions = computed<{ value: AdminFileSortOrder; label: string }[]>(() => [
  { value: 'desc', label: t('fileManage.sort.desc') },
  { value: 'asc', label: t('fileManage.sort.asc') }
])

const healthFilterValues: AdminFileHealthFilter[] = [
  'all',
  'attention',
  'danger',
  'warning',
  'healthy',
  'expired',
  'expiring_soon',
  'storage_issue',
  'never_retrieved',
  'permanent'
]

const getRouteHealthFilter = (): AdminFileHealthFilter => {
  const health = route.query.health
  if (typeof health === 'string' && healthFilterValues.includes(health as AdminFileHealthFilter)) {
    return health as AdminFileHealthFilter
  }
  return 'all'
}

const syncHealthFilterQuery = async (health: AdminFileHealthFilter) => {
  const query = { ...route.query }
  if (health === 'all') {
    delete query.health
  } else {
    query.health = health
  }
  await router.replace({ query })
}

const handleHealthFilterChange = async (health: AdminFileHealthFilter) => {
  await setHealthFilter(health)
  await syncHealthFilterQuery(health)
}

const handleResetFilters = async () => {
  await resetFilters()
  await syncHealthFilterQuery('all')
}

const batchEditModeOptions = computed<
  { value: AdminBatchEditMode; label: string; icon: Component }[]
>(() => [
  {
    value: 'expiresAt',
    label: t('fileManage.batchEditExpiresAt'),
    icon: ClockIcon
  },
  {
    value: 'downloadLimit',
    label: t('fileManage.batchEditDownloadLimit'),
    icon: DownloadIcon
  },
  {
    value: 'forever',
    label: t('fileManage.batchEditForever'),
    icon: CheckIcon
  }
])

const detailPolicyActionIconMap: Record<AdminFilePolicyAction, Component> = {
  extend_24h: ClockIcon,
  extend_7d: ClockIcon,
  make_permanent: InfinityIcon,
  reset_download_limit: RotateCcwIcon
}

const getDetailPolicyActionIcon = (action: AdminFilePolicyAction) =>
  detailPolicyActionIconMap[action]

const getPillClass = (active: boolean) => {
  if (active) return 'bg-indigo-600 text-white'
  return isDarkMode.value
    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}

const getStatusFilterClass = (value: AdminFileStatusFilter) =>
  getPillClass(params.value.status === value)

const getTypeFilterClass = (value: AdminFileTypeFilter) => getPillClass(params.value.type === value)

const getHealthFilterClass = (value: AdminFileHealthFilter) =>
  getPillClass(params.value.health === value)

const getBatchEditModeClass = (value: AdminBatchEditMode) => {
  if (batchEditForm.value.mode === value) {
    return isDarkMode.value
      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
      : 'border-indigo-500 bg-indigo-50 text-indigo-700'
  }

  return isDarkMode.value
    ? 'border-gray-700 bg-gray-700/50 text-gray-300 hover:border-gray-600 hover:bg-gray-700'
    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
}

const getTypeLabel = (file: AdminFileViewItem) => {
  if (file.isChunkedFile) return t('fileManage.chunkedType')
  return file.isTextFile ? t('fileManage.textType') : t('fileManage.fileType')
}

const getTypeBadgeClass = (file: AdminFileViewItem) => {
  if (file.isChunkedFile) {
    return isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
  }
  if (file.isTextFile) {
    return isDarkMode.value ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
  }
  return isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
}

const getStatusBadgeClass = (file: AdminFileViewItem) => {
  if (file.isExpiredFile) {
    return isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
  }
  return isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
}

const getInsightSeverityLabel = (severity: AdminFileInsightSeverity) =>
  t(`fileManage.insightSeverity.${severity}`)

const getInsightStateLabel = (state: string) => t(`fileManage.insightStates.${state}`)

const getInsightActionLabel = (action: string) => t(`fileManage.insightActions.${action}`)

const getInsightPanelClass = (severity: AdminFileInsightSeverity) => {
  const darkClasses: Record<AdminFileInsightSeverity, string> = {
    success: 'border-emerald-500/20 bg-emerald-500/10',
    warning: 'border-amber-500/20 bg-amber-500/10',
    danger: 'border-red-500/20 bg-red-500/10',
    info: 'border-blue-500/20 bg-blue-500/10',
    neutral: 'border-gray-700 bg-gray-700/30'
  }
  const lightClasses: Record<AdminFileInsightSeverity, string> = {
    success: 'border-emerald-100 bg-emerald-50',
    warning: 'border-amber-100 bg-amber-50',
    danger: 'border-red-100 bg-red-50',
    info: 'border-blue-100 bg-blue-50',
    neutral: 'border-gray-200 bg-gray-50'
  }

  return isDarkMode.value ? darkClasses[severity] : lightClasses[severity]
}

const getInsightBadgeClass = (severity: AdminFileInsightSeverity) => {
  const darkClasses: Record<AdminFileInsightSeverity, string> = {
    success: 'bg-emerald-900/40 text-emerald-200',
    warning: 'bg-amber-900/40 text-amber-200',
    danger: 'bg-red-900/40 text-red-200',
    info: 'bg-blue-900/40 text-blue-200',
    neutral: 'bg-gray-700 text-gray-300'
  }
  const lightClasses: Record<AdminFileInsightSeverity, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-100 text-gray-700'
  }

  return isDarkMode.value ? darkClasses[severity] : lightClasses[severity]
}

const getTimelineDotClass = (severity: AdminFileInsightSeverity) => {
  const classes: Record<AdminFileInsightSeverity, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: isDarkMode.value ? 'bg-gray-500' : 'bg-gray-300'
  }

  return classes[severity]
}

watch(
  () => route.query.health,
  async () => {
    const health = getRouteHealthFilter()
    if (params.value.health === health) return
    await setHealthFilter(health)
  }
)

onMounted(() => {
  params.value.health = getRouteHealthFilter()
  void loadFiles()
})
</script>
