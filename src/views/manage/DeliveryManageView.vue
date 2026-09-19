<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { STORAGE_METHOD_OPTIONS } from '@/constants'
import {
  PlusIcon,
  PencilIcon,
  RefreshCwIcon,
  InboxIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon
} from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DeleteActionButton from '@/components/common/DeleteActionButton.vue'
import FileManageView from './FileManageView.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import DataTable from '@/components/common/DataTable.vue'
import DataPagination from '@/components/common/DataPagination.vue'
import { useDeliveryAdmin } from '@/composables'
import { formatFileSize } from '@/utils/common'

// 接入原 AdminLayout，不再维护第二套登录、导航或主题状态。
const { t } = useI18n()
const codeInput = ref<HTMLInputElement | null>(null)
const linkInput = ref<HTMLInputElement | null>(null)
// 每行保留展示文本引用，复制受限时直接选中原文，不再展示可编辑输入框。
const codeElements = new Map<number, HTMLElement>()
function registerCodeElement(id: number, element: unknown) {
  if (element instanceof HTMLElement) codeElements.set(id, element)
  else codeElements.delete(id)
}
const {
  customStorage,
  editing,
  createdItem,
  createdLink,
  minimumUploads,
  openEdit,
  copyLink,
  filters,
  hasActiveFilters,
  selectedIds,
  selectedCount,
  hasSelection,
  isAllCurrentPageSelected,
  showBatchEdit,
  batchForm,
  toggleSelection,
  toggleCurrentPageSelection,
  clearSelection,
  search,
  resetFilters,
  filterByTag,
  batch,
  openBatchEdit,
  codes,
  files,
  page,
  total,
  filePage,
  fileTotal,
  loading,
  filesLoading,
  creating,
  acting,
  showCreate,
  createdCode,
  copyMessage,
  showCreated,
  selected,
  pendingDelete,
  form,
  openCreate,
  refresh,
  loadFiles,
  viewFiles,
  closeFiles,
  create,
  toggle,
  confirmDelete,
  copy,
  copyListedCode,
  closeCreated,
  download
} = useDeliveryAdmin()
const receivedRefresh = ref(0)
// 两类记录分页独立；刷新时同时更新普通分享列表与历史/处理中收件。
function refreshReceived() {
  receivedRefresh.value++
  void loadFiles()
}
onMounted(refresh)
const sortOptions = computed(() => [
  { value: 'created_at', label: t('delivery.sort.createdAt') },
  { value: 'expires_at', label: t('delivery.sort.expiresAt') },
  { value: 'name', label: t('delivery.sort.name') },
  { value: 'code', label: t('delivery.sort.code') },
  { value: 'used_count', label: t('delivery.sort.usedCount') },
  { value: 'max_uploads', label: t('delivery.sort.maxUploads') }
])
</script>

<template>
  <div class="delivery-management p-4 sm:p-6">
    <template v-if="!selected">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="theme-text-strong text-2xl font-bold">{{ t('delivery.manage') }}</h2>
          <p class="theme-text-muted mt-1 text-sm">{{ t('delivery.manageSubtitle') }}</p>
        </div>
        <!-- 刷新沿用文件管理的文案和按钮，置于页面标题旁，不单独占用白色面板。 -->
        <BaseButton
          class="self-start sm:self-auto"
          variant="secondary"
          :loading="loading"
          @click="refresh"
        >
          <template #icon><RefreshCwIcon class="mr-2 h-4 w-4" /></template>
          {{ t('fileManage.refresh') }}
        </BaseButton>
      </div>
      <!-- 筛选区与文件管理保持相同结构，关键字覆盖名称、口令、备注和标签。 -->
      <section class="theme-panel mb-4 rounded-xl border p-4">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label class="relative">
            <SearchIcon class="theme-text-muted absolute left-3 top-3 h-4 w-4" />
            <input
              v-model="filters.keyword"
              class="delivery-input !pl-10"
              :placeholder="t('delivery.searchPlaceholder')"
              @keyup.enter="search"
            />
          </label>
          <BaseButton :loading="loading" @click="search"
            ><SearchIcon class="mr-2 h-4 w-4" />{{ t('common.search') }}</BaseButton
          >
        </div>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label class="delivery-label"
            >{{ t('delivery.status')
            }}<select v-model="filters.status" class="delivery-input" @change="search">
              <option
                v-for="state in ['all', 'active', 'disabled', 'expired', 'exhausted']"
                :key="state"
                :value="state"
              >
                {{ state === 'all' ? t('delivery.all') : t(`delivery.states.${state}`) }}
              </option>
            </select></label
          >
          <label class="delivery-label"
            >{{ t('delivery.storage')
            }}<select v-model="filters.storage_type" class="delivery-input" @change="search">
              <option value="all">{{ t('delivery.all') }}</option>
              <option value="system">{{ t('delivery.followSystem') }}</option>
              <option
                v-for="option in STORAGE_METHOD_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ t(option.label) }}
              </option>
            </select></label
          >
          <label class="delivery-label"
            >{{ t('delivery.tag')
            }}<input
              v-model="filters.tag"
              class="delivery-input"
              maxlength="24"
              :placeholder="t('delivery.tagPlaceholder')"
              @keyup.enter="search"
          /></label>
          <label class="delivery-label"
            >{{ t('delivery.sort.label')
            }}<select v-model="filters.sort_by" class="delivery-input" @change="search">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select></label
          >
          <label class="delivery-label"
            >{{ t('delivery.sort.order')
            }}<select v-model="filters.sort_order" class="delivery-input" @change="search">
              <option value="desc">{{ t('delivery.sort.desc') }}</option>
              <option value="asc">{{ t('delivery.sort.asc') }}</option>
            </select></label
          >
        </div>
        <div v-if="hasActiveFilters" class="mt-3 flex justify-end">
          <BaseButton size="sm" variant="outline" :disabled="loading" @click="resetFilters"
            ><XIcon class="mr-2 h-4 w-4" />{{ t('delivery.clearFilters') }}</BaseButton
          >
        </div>
      </section>
      <section
        v-if="codes.length"
        class="theme-panel mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <label class="theme-text-strong inline-flex items-center gap-2 text-sm"
          ><input
            type="checkbox"
            :checked="isAllCurrentPageSelected"
            :disabled="acting"
            @change="toggleCurrentPageSelection"
          />{{
            hasSelection
              ? t('delivery.selectedCount', { count: selectedCount })
              : t('delivery.selectCurrentPage')
          }}</label
        >
        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-if="hasSelection"
            size="sm"
            variant="outline"
            :disabled="acting"
            @click="clearSelection"
            ><XIcon class="mr-1 h-4 w-4" />{{ t('delivery.clearSelection') }}</BaseButton
          ><BaseButton
            size="sm"
            variant="outline"
            :disabled="!hasSelection || acting"
            @click="batch('enable')"
            ><CheckIcon class="mr-1 h-4 w-4" />{{ t('delivery.batchEnable') }}</BaseButton
          ><BaseButton
            size="sm"
            variant="outline"
            :disabled="!hasSelection || acting"
            @click="batch('disable')"
            >{{ t('delivery.batchDisable') }}</BaseButton
          ><BaseButton
            size="sm"
            variant="secondary"
            :disabled="!hasSelection || acting"
            @click="openBatchEdit"
            ><ClockIcon class="mr-1 h-4 w-4" />{{ t('delivery.batchEdit') }}</BaseButton
          ><BaseButton
            size="sm"
            variant="danger"
            :disabled="!hasSelection || acting"
            @click="
              pendingDelete = {
                kind: 'batch',
                id: 0,
                name: t('delivery.selectedCount', { count: selectedCount })
              }
            "
            ><TrashIcon class="mr-1 h-4 w-4" />{{ t('delivery.batchDelete') }}</BaseButton
          >
        </div>
      </section>
      <DataTable
        class="delivery-code-table"
        :title="t('delivery.list')"
        :headers="[
          '',
          t('delivery.name'),
          t('delivery.code'),
          t('delivery.storage'),
          t('delivery.expires'),
          t('delivery.status'),
          t('delivery.usage'),
          t('delivery.actions')
        ]"
      >
        <!-- 两个寄件操作与列表标题同排，统一高度，窄屏允许自然换行。 -->
        <template #actions>
          <RouterLink
            to="/delivery"
            class="theme-control inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm font-medium"
          >
            <ExternalLinkIcon class="h-4 w-4" />{{ t('delivery.title') }}
          </RouterLink>
          <BaseButton size="sm" class="h-9 whitespace-nowrap" @click="openCreate">
            <template #icon><PlusIcon class="mr-2 h-4 w-4" /></template>
            {{ t('delivery.create') }}
          </BaseButton>
        </template>
        <template #body>
          <tr v-if="!codes.length">
            <td colspan="8" class="px-6 py-14 text-center">
              <InboxIcon class="theme-text-muted mx-auto mb-3 h-8 w-8" />
              <p class="theme-text-strong font-medium">
                {{ t(loading ? 'common.loading' : 'delivery.empty') }}
              </p>
              <p v-if="!loading" class="theme-text-muted mt-1 text-sm">
                {{ t('delivery.emptyHint') }}
              </p>
            </td>
          </tr>
          <tr v-for="item in codes" :key="item.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedIds.has(item.id)"
                :disabled="acting"
                :aria-label="t('delivery.selectCode', { name: item.name })"
                @change="toggleSelection(item.id)"
              />
            </td>
            <td>
              <span class="theme-text-strong font-medium">{{ item.name }}</span
              ><span class="theme-text-muted mt-1 block text-xs">#{{ item.id }}</span>
              <p
                v-if="item.note"
                class="theme-text-muted mt-1 max-w-64 whitespace-pre-wrap break-words text-xs"
              >
                {{ item.note }}
              </p>
              <div v-if="item.tags?.length" class="mt-2 flex flex-wrap gap-1">
                <button
                  v-for="tag in item.tags"
                  :key="tag"
                  type="button"
                  class="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs hover:bg-zinc-500/20"
                  :title="t('delivery.filterByTag', { tag })"
                  @click="filterByTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </td>
            <td>
              <div v-if="item.code" class="flex items-center gap-2">
                <code
                  :ref="(el) => registerCodeElement(item.id, el)"
                  :aria-label="`${t('delivery.code')} #${item.id}`"
                  tabindex="0"
                  class="theme-text-strong max-w-64 select-all break-all font-mono text-sm font-semibold tracking-wide"
                  >{{ item.code }}</code
                >
                <BaseButton
                  size="sm"
                  variant="outline"
                  :aria-label="`${t('delivery.copy')} #${item.id}`"
                  @click="copyListedCode(item, codeElements.get(item.id) || null)"
                  ><CopyIcon class="h-4 w-4"
                /></BaseButton>
              </div>
              <span
                v-else
                class="theme-text-muted block max-w-48 text-xs leading-5"
                :title="t('delivery.legacyCodeHint')"
                >{{ t('delivery.legacyCode') }}</span
              >
            </td>
            <td>
              <span :class="{ uppercase: item.storage_type !== 'system' }">{{
                item.storage_type === 'system' ? t('delivery.followSystem') : item.storage_type
              }}</span
              ><span class="theme-text-muted mt-1 block max-w-48 break-all text-xs">{{
                item.storage_type === 'system' ? t('delivery.systemPath') : item.target_path
              }}</span>
            </td>
            <td class="whitespace-nowrap">{{ new Date(item.expires_at).toLocaleString() }}</td>
            <td>
              <span
                class="inline-block whitespace-nowrap rounded-lg px-2 py-1 text-xs"
                :class="
                  item.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'theme-control'
                "
                >{{ t(`delivery.states.${item.status}`) }}</span
              >
            </td>
            <td class="whitespace-nowrap tabular-nums">
              {{ item.used_count }} / {{ item.reserved_count }} / {{ item.max_uploads }}
            </td>
            <td>
              <div class="flex flex-wrap gap-2">
                <BaseButton size="sm" variant="outline" @click="viewFiles(item)">{{
                  t('delivery.viewFiles')
                }}</BaseButton>
                <BaseButton size="sm" variant="outline" :disabled="acting" @click="toggle(item)">{{
                  t(item.enabled ? 'delivery.disable' : 'delivery.enable')
                }}</BaseButton>
                <!-- 编辑沿用文件管理的铅笔入口，配置表单回填当前记录。 -->
                <BaseButton
                  size="sm"
                  variant="outline"
                  :disabled="acting"
                  :aria-label="t('delivery.edit')"
                  @click="openEdit(item)"
                >
                  <PencilIcon class="mr-2 h-4 w-4" />{{ t('common.edit') }}
                </BaseButton>
                <DeleteActionButton
                  :disabled="acting"
                  @click="pendingDelete = { kind: 'code', id: item.id, name: item.name }"
                />
              </div>
            </td>
          </tr>
        </template>
        <template #footer
          ><DataPagination
            v-if="total > 0"
            :current-page="page"
            :page-size="20"
            :total="total"
            @page-change="page = $event"
        /></template>
      </DataTable>
    </template>

    <BaseModal
      :show="showCreate"
      :title="t(editing ? 'delivery.edit' : 'delivery.create')"
      size="lg"
      :closable="!creating"
      :close-on-backdrop="false"
      @close="showCreate = false"
    >
      <template #header>
        <div class="theme-text-strong flex items-center gap-3">
          <div class="theme-control rounded-lg p-2">
            <PencilIcon v-if="editing" class="h-5 w-5" /><PlusIcon v-else class="h-5 w-5" />
          </div>
          <h3 class="text-xl font-semibold">
            {{ t(editing ? 'delivery.edit' : 'delivery.create') }}
          </h3>
        </div>
      </template>
      <!-- 创建与编辑共用字段；未改口令不进入 PUT，兼容历史超长口令。 -->
      <form id="delivery-create-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="create">
        <label class="delivery-label"
          >{{ t('delivery.name')
          }}<input
            v-model="form.name"
            required
            maxlength="100"
            :placeholder="t('delivery.namePlaceholder')"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t(editing ? 'delivery.code' : 'delivery.customCode')
          }}<input
            v-model="form.code"
            minlength="8"
            :maxlength="editing && form.code === (editing.code || '') ? undefined : 32"
            :pattern="
              editing && form.code === (editing.code || '') ? undefined : '[A-Za-z0-9_-]{8,32}'
            "
            autocomplete="off"
            :placeholder="t(editing ? 'delivery.legacyCode' : 'delivery.autoCode')"
            class="delivery-input"
        /></label>
        <!-- 大多数寄件码只需沿用设置；勾选后才展开独立存储字段。 -->
        <div class="space-y-2 sm:col-span-2">
          <label class="theme-text-strong flex items-center gap-2 text-sm">
            <input v-model="customStorage" type="checkbox" />{{ t('delivery.customStorage') }}
          </label>
          <p class="theme-text-muted text-xs leading-5">
            {{ t(customStorage ? 'delivery.configHint' : 'delivery.followSystemHint') }}
          </p>
        </div>
        <label v-if="customStorage" class="delivery-label"
          >{{ t('delivery.storage')
          }}<select v-model="form.storage_type" class="delivery-input">
            <!-- 历史类型仅作只读提示，保存前需选择当前支持的存储或跟随系统。 -->
            <option
              v-if="!STORAGE_METHOD_OPTIONS.some((option) => option.value === form.storage_type)"
              :value="form.storage_type"
              disabled
            >
              {{ form.storage_type }} · {{ t('delivery.unsupportedStorage') }}
            </option>
            <option
              v-for="option in STORAGE_METHOD_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ t(option.label) }}
            </option>
          </select></label
        >
        <label v-if="customStorage" class="delivery-label"
          >{{ t('delivery.target')
          }}<input
            v-model="form.target_path"
            required
            maxlength="200"
            :placeholder="t('delivery.targetPlaceholder')"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.expiresLocal')
          }}<input
            v-model="form.expires_at"
            required
            type="datetime-local"
            step="1"
            class="delivery-input"
        /></label>
        <label class="delivery-label sm:col-span-2"
          >{{ t('delivery.note')
          }}<textarea
            v-model="form.note"
            maxlength="2000"
            rows="3"
            class="delivery-input resize-y"
            :placeholder="t('delivery.notePlaceholder')"
          />
        </label>
        <label class="delivery-label sm:col-span-2"
          >{{ t('delivery.tags')
          }}<input
            v-model="form.tagsText"
            class="delivery-input"
            :placeholder="t('delivery.tagsPlaceholder')"
          /><span class="theme-text-muted mt-1 text-xs">{{ t('delivery.tagsHint') }}</span></label
        >
        <label class="delivery-label"
          >{{ t('delivery.maxUploads')
          }}<input
            v-model.number="form.max_uploads"
            required
            type="number"
            :min="minimumUploads"
            max="100000"
            step="1"
            class="delivery-input"
        /></label>
        <p class="theme-text-muted text-xs leading-5 sm:col-span-2">
          {{ t('delivery.editHint') }}
        </p>
      </form>
      <template #footer
        ><BaseButton variant="secondary" :disabled="creating" @click="showCreate = false">{{
          t('common.cancel')
        }}</BaseButton
        ><BaseButton type="submit" form="delivery-create-form" :loading="creating">{{
          t(editing ? 'common.save' : 'delivery.create')
        }}</BaseButton></template
      >
    </BaseModal>

    <BaseModal
      :show="showBatchEdit"
      :title="t('delivery.batchEdit')"
      :closable="!acting"
      :close-on-backdrop="false"
      @close="showBatchEdit = false"
    >
      <p class="theme-text-muted mb-4 text-sm">
        {{ t('delivery.batchEditHint', { count: selectedCount }) }}
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="delivery-label"
          >{{ t('delivery.expiresLocal')
          }}<input
            v-model="batchForm.expires_at"
            type="datetime-local"
            step="1"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.maxUploads')
          }}<input
            v-model.number="batchForm.max_uploads"
            type="number"
            min="1"
            max="100000"
            class="delivery-input"
        /></label>
      </div>
      <template #footer
        ><BaseButton variant="secondary" :disabled="acting" @click="showBatchEdit = false">{{
          t('common.cancel')
        }}</BaseButton
        ><BaseButton :loading="acting" @click="batch('update')">{{
          t('common.save')
        }}</BaseButton></template
      >
    </BaseModal>

    <!-- 成功结果沿用取件详情的概览、口令卡片和二维码布局。 -->
    <BaseModal
      :show="showCreated"
      :title="t('delivery.created')"
      size="lg"
      :close-on-backdrop="false"
      @close="closeCreated"
    >
      <div v-if="createdItem" class="theme-control mb-5 rounded-2xl p-4">
        <p class="theme-text-strong break-words font-semibold">{{ createdItem.name }}</p>
        <div class="theme-text-muted mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span
            >{{ t('delivery.expires') }}
            {{ new Date(createdItem.expires_at).toLocaleString() }}</span
          >
          <span>{{ t('delivery.remaining', { count: createdItem.remaining }) }}</span>
        </div>
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="min-w-0 space-y-4">
          <label
            class="block rounded-2xl bg-zinc-800 p-4 text-white dark:bg-zinc-200 dark:text-zinc-950"
          >
            <span class="text-sm font-medium">{{ t('delivery.code') }}</span>
            <input
              ref="codeInput"
              :value="createdCode"
              readonly
              class="mt-3 w-full min-w-0 bg-transparent py-2 text-center font-mono text-xl font-bold tracking-wide outline-none"
              @click="codeInput?.select()"
            />
          </label>
          <label class="delivery-label"
            >{{ t('delivery.link') }}
            <input
              ref="linkInput"
              :value="createdLink"
              readonly
              class="delivery-input"
              @click="linkInput?.select()"
            />
          </label>
          <p class="theme-text-muted text-xs leading-5">{{ t('delivery.saveCode') }}</p>
        </div>
        <div class="theme-control flex flex-col items-center justify-center gap-3 rounded-2xl p-4">
          <div class="rounded-xl bg-white p-3">
            <QrcodeVue v-if="createdLink" :value="createdLink" :size="160" level="M" />
          </div>
          <p class="theme-text-muted text-sm">{{ t('delivery.scanDeliver') }}</p>
        </div>
      </div>
      <p v-if="copyMessage" role="status" class="theme-text-muted mt-3 text-sm">
        {{ copyMessage }}
      </p>
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-2">
          <BaseButton variant="secondary" @click="copy(codeInput)"
            ><CopyIcon class="mr-2 h-4 w-4" />{{ t('delivery.copy') }}</BaseButton
          >
          <BaseButton variant="secondary" @click="copyLink(linkInput)">{{
            t('delivery.copyLink')
          }}</BaseButton>
          <a
            :href="createdLink"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-950"
          >
            <ExternalLinkIcon class="h-4 w-4" />{{ t('delivery.goDeliver') }}
          </a>
        </div>
      </template>
    </BaseModal>

    <section v-if="selected">
      <div class="mb-5 flex items-center justify-between gap-3">
        <h2 class="theme-text-strong text-xl font-bold">
          {{ selected.name }} · {{ t('delivery.received') }}
        </h2>
        <BaseButton variant="secondary" @click="closeFiles">{{
          t('delivery.backToCodes')
        }}</BaseButton>
      </div>
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="theme-text-muted text-xs leading-5">{{ t('delivery.retained') }}</p>
        <BaseButton variant="outline" size="sm" :loading="filesLoading" @click="refreshReceived">{{
          t('delivery.refresh')
        }}</BaseButton>
      </div>
      <FileManageView
        :key="selected.id"
        embedded
        :delivery-id="selected.id"
        :refresh-key="receivedRefresh"
      />
      <!-- 不把旧私有或未完成收件伪造成普通文件；这些记录继续使用原有受限操作。 -->
      <div v-if="fileTotal > 0 || filesLoading" class="mt-6 overflow-x-auto">
        <h3 class="theme-text-strong mb-3 font-semibold">{{ t('delivery.otherReceipts') }}</h3>
        <table class="delivery-legacy-table w-full text-sm">
          <thead class="theme-text-muted text-left text-xs">
            <tr>
              <th>{{ t('delivery.filename') }}</th>
              <th>{{ t('delivery.size') }}</th>
              <th>{{ t('delivery.retrievalCode') }}</th>
              <th>{{ t('delivery.status') }}</th>
              <th>{{ t('delivery.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!files.length">
              <td colspan="5" class="!py-10 text-center theme-text-muted">
                {{ t(filesLoading ? 'common.loading' : 'delivery.noFiles') }}
              </td>
            </tr>
            <tr v-for="file in files" :key="file.id" class="theme-divider border-t">
              <td>
                <div class="flex gap-2">
                  <FileIcon class="mt-0.5 h-4 w-4 shrink-0" /><span class="max-w-64 break-all"
                    >{{ file.filename || t('delivery.states.pending')
                    }}<span class="theme-text-muted mt-1 block text-xs">{{
                      new Date(file.created_at).toLocaleString()
                    }}</span></span
                  >
                </div>
              </td>
              <td class="whitespace-nowrap">{{ formatFileSize(file.size) }}</td>
              <td>
                <code v-if="file.retrieval_code" class="select-all font-mono tracking-wider">{{
                  file.retrieval_code
                }}</code
                ><span v-else class="theme-text-muted text-xs">{{
                  file.status === 'stored' ? t('delivery.privateLegacy') : '—'
                }}</span>
              </td>
              <td class="whitespace-nowrap">{{ t(`delivery.states.${file.status}`) }}</td>
              <td>
                <div class="flex gap-2">
                  <BaseButton
                    v-if="['stored', 'shared'].includes(file.status)"
                    variant="outline"
                    size="sm"
                    :disabled="acting"
                    @click="download(file)"
                    >{{ t('delivery.download') }}</BaseButton
                  ><DeleteActionButton
                    v-if="!['pending', 'finalizing'].includes(file.status)"
                    :disabled="acting"
                    @click="pendingDelete = { kind: 'file', id: file.id, name: file.filename }"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <DataPagination
        v-if="fileTotal > 0"
        :current-page="filePage"
        :page-size="20"
        :total="fileTotal"
        @page-change="filePage = $event"
      />
    </section>

    <BaseModal
      :show="!!pendingDelete"
      :title="
        t(
          pendingDelete?.kind === 'batch'
            ? 'delivery.batchDelete'
            : pendingDelete?.kind === 'code'
              ? 'delivery.deleteCode'
              : 'delivery.removeFile'
        )
      "
      :closable="!acting"
      :close-on-backdrop="false"
      @close="pendingDelete = null"
    >
      <p class="theme-text-strong mb-3 break-all font-medium">{{ pendingDelete?.name }}</p>
      <p class="theme-text-muted text-sm">
        {{
          t(
            pendingDelete?.kind === 'batch'
              ? 'delivery.confirmBatchDelete'
              : pendingDelete?.kind === 'code'
                ? 'delivery.confirmCode'
                : 'delivery.confirmFile'
          )
        }}
      </p>
      <template #footer
        ><BaseButton variant="secondary" :disabled="acting" @click="pendingDelete = null">{{
          t('common.cancel')
        }}</BaseButton
        ><BaseButton variant="danger" :loading="acting" @click="confirmDelete">{{
          t('common.delete')
        }}</BaseButton></template
      >
    </BaseModal>
  </div>
</template>

<style scoped>
/* 与上游 theme-control 使用相同变量，弹窗被 Teleport 后也能继承全局主题。 */
.delivery-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-text-muted));
}
.delivery-input {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.875rem;
  color: rgb(var(--color-text-strong));
  background: rgb(var(--color-surface-input) / 0.8);
  outline: none;
}
.delivery-input:focus {
  border-color: rgb(var(--color-focus-ring));
  box-shadow: 0 0 0 3px rgb(var(--color-focus-ring) / 0.15);
}
/* 寄件码/历史收件的局部样式不能覆盖嵌入的原文件管理表格。 */
:deep(.delivery-code-table td),
:deep(.delivery-code-table th),
.delivery-legacy-table td,
.delivery-legacy-table th {
  padding: 1rem;
  vertical-align: top;
  font-size: 0.875rem;
}
@media (max-width: 640px) {
  :deep(.delivery-code-table td),
  :deep(.delivery-code-table th),
  .delivery-legacy-table td,
  .delivery-legacy-table th {
    padding: 0.75rem;
  }
  :deep(.delivery-code-table .mt-4.flex.items-center.justify-between) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
