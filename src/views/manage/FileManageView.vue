<template>
  <div class="p-6 overflow-y-auto custom-scrollbar">
    <!-- 页面标题和统计信息 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
        {{ t('fileManage.title') }}
      </h2>
    </div>

    <!-- 搜索和操作栏 -->
    <div
      class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-opacity-70 p-4 rounded-lg shadow-sm"
      :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']"
    >
      <div class="flex flex-1 gap-4 w-full sm:w-auto">
        <div class="relative flex-1">
          <input
            type="text"
            v-model="params.keyword"
            @keyup.enter="handleSearch"
            :class="[
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
              'w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            ]"
            :placeholder="t('fileManage.searchPlaceholder')"
          />
          <SearchIcon
            class="absolute left-3 top-3 w-5 h-5"
            :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
          />
        </div>
        <button
          @click="handleSearch"
          class="px-4 py-2.5 rounded-lg inline-flex items-center transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <SearchIcon class="w-5 h-5 mr-2" />
          {{ t('common.search') }}
        </button>
      </div>
    </div>

    <!-- 文件列表 -->
    <DataTable :title="t('fileManage.allFiles')" :headers="fileTableHeaders">
      <template #body>
        <tr
          v-for="file in tableData"
          :key="file.id"
          class="hover:bg-opacity-50 transition-colors duration-200"
          :class="[isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50']"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <span
                class="font-medium select-all"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
              >
                {{ file.code }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center group relative">
              <FileIcon
                class="w-5 h-5 mr-2 flex-shrink-0"
                :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-500']"
              />
              <span
                class="font-medium truncate max-w-[200px]"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
                :title="file.prefix"
              >
                {{ file.prefix }}
              </span>
              <!-- 悬浮提示 -->
              <div
                class="absolute left-0 -top-2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                <div class="bg-gray-900 text-white text-sm rounded px-2 py-1 max-w-xs break-all">
                  {{ file.prefix }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="[isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800']"
            >
              {{ file.displaySize }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span
                class="block truncate max-w-[200px]"
                :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
              >
                {{ file.text || '-' }}
              </span>
              <!-- 查看全文按钮 - 仅当文本超过一定长度时显示 -->
              <button
                v-if="file.canPreviewText"
                @click="openTextPreview(file.text || '')"
                class="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs transition-colors duration-200"
                :class="[
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                <EyeIcon class="w-3 h-3 mr-1" />
                {{ t('fileManage.viewText') }}
              </button>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="[
                file.expired_at
                  ? isDarkMode
                    ? 'bg-yellow-900/30 text-yellow-400'
                    : 'bg-yellow-100 text-yellow-800'
                  : isDarkMode
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-green-100 text-green-800'
              ]"
            >
              {{ file.displayExpiredAt }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center space-x-2">
              <button
                @click="openEditModal(file)"
                class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200"
                :class="[
                  isDarkMode
                    ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                ]"
              >
                <PencilIcon class="w-4 h-4 mr-1.5" />
                {{ t('common.edit') }}
              </button>
              <button
                @click="deleteFile(file.id)"
                class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200"
                :class="[
                  isDarkMode
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                ]"
              >
                <TrashIcon class="w-4 h-4 mr-1.5" />
                {{ t('common.delete') }}
              </button>
            </div>
          </td>
        </tr>
      </template>
      <template #footer>
        <DataPagination
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
        <BaseButton variant="secondary" @click="closeEditModal">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton @click="handleUpdate">
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
import { inject, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FileIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  EyeIcon,
  CopyIcon,
  FileTextIcon
} from 'lucide-vue-next'
import DataTable from '@/components/common/DataTable.vue'
import DataPagination from '@/components/common/DataPagination.vue'
import FileEditField from '@/components/common/FileEditField.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAdminFiles } from '@/composables'

const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
// 修改文件表头
const fileTableHeaders = computed(() => [
  t('fileManage.headers.code'),
  t('fileManage.headers.name'),
  t('fileManage.headers.size'),
  t('fileManage.headers.description'),
  t('fileManage.headers.expiration'),
  t('fileManage.headers.actions')
])

const {
  tableData,
  params,
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
  openTextPreview
} = useAdminFiles()

onMounted(() => {
  void loadFiles()
})
</script>
