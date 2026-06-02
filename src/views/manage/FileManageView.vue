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
          @click="resetFilters"
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
                @click="resetFilters"
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
            :class="[isDarkMode ? 'hover:bg-gray-700/70' : 'hover:bg-gray-50']"
          >
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
                  v-if="file.canPreviewText"
                  type="button"
                  :title="t('fileManage.viewText')"
                  class="inline-flex items-center rounded-md px-3 py-1.5 transition-colors duration-200"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                  @click="openTextPreview(file.text || '')"
                >
                  <EyeIcon class="mr-1.5 h-4 w-4" />
                  {{ t('fileManage.viewText') }}
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
            {{ t('fileManage.textPreview') }}
          </h3>
        </div>
      </template>

      <div
        class="max-h-[60vh] overflow-y-auto rounded-lg p-4 custom-scrollbar"
        :class="[isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50']"
      >
        <pre
          class="whitespace-pre-wrap break-words text-sm font-mono"
          :class="[isDarkMode ? 'text-gray-200' : 'text-gray-700']"
          >{{ previewText }}</pre
        >
      </div>
      <div class="mt-2 text-xs" :class="[isDarkMode ? 'text-gray-500' : 'text-gray-400']">
        {{ t('fileManage.charCount', { count: previewText.length }) }}
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="copyText">
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
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
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
  EyeIcon,
  FileIcon,
  FileTextIcon,
  FilterIcon,
  HardDriveIcon,
  PencilIcon,
  RefreshCwIcon,
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

const fileTableHeaders = computed(() => [
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
  isSaving,
  params,
  storageUsedText,
  summary,
  showEditModal,
  editForm,
  showTextPreview,
  previewText,
  closeEditModal,
  closeTextPreview,
  copyText,
  deleteFile,
  handlePageChange,
  handleSearch,
  handleUpdate,
  loadFiles,
  openEditModal,
  openTextPreview,
  refreshFiles,
  resetFilters,
  setStatusFilter,
  setTypeFilter
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

const getPillClass = (active: boolean) => {
  if (active) return 'bg-indigo-600 text-white'
  return isDarkMode.value
    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}

const getStatusFilterClass = (value: AdminFileStatusFilter) =>
  getPillClass(params.value.status === value)

const getTypeFilterClass = (value: AdminFileTypeFilter) => getPillClass(params.value.type === value)

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

onMounted(() => {
  void loadFiles()
})
</script>
