<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  PencilIcon,
  RefreshCwIcon,
  InboxIcon,
  CopyIcon,
  ExternalLinkIcon,
  SearchIcon,
  XIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import DataTable from '@/components/common/DataTable.vue'
import DataPagination from '@/components/common/DataPagination.vue'
import type { useDeliveryAdmin } from '@/composables'
import { toRefs, reactive } from 'vue'

import DeliveryBatchActions from './DeliveryBatchActions.vue'
// 页面状态由父层唯一创建，子组件只负责对应区域。
const props = defineProps<{ state: ReturnType<typeof useDeliveryAdmin> }>()
const {
  openEdit,
  filters,
  hasActiveFilters,
  selectedIds,
  toggleSelection,
  search,
  resetFilters,
  filterByTag,
  codes,
  page,
  total,
  loading,
  acting,
  pendingDelete,
  openCreate,
  refresh,
  viewFiles,
  toggle,
  copyListedCode
} = toRefs(reactive(props.state))
const { t } = useI18n()
const sortOptions = computed(() => [
  { value: 'created_at', label: t('delivery.sort.createdAt') },
  { value: 'expires_at', label: t('delivery.sort.expiresAt') },
  { value: 'name', label: t('delivery.sort.name') },
  { value: 'used_count', label: t('delivery.sort.usedCount') },
  { value: 'max_uploads', label: t('delivery.sort.maxUploads') }
])
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 class="theme-text-strong text-2xl font-bold">{{ t('delivery.manage') }}</h2>
      <p class="theme-text-muted mt-1 text-sm">{{ t('delivery.manageSubtitle') }}</p>
    </div>
    <div class="flex flex-wrap gap-2 self-start sm:self-auto">
      <!-- 寄件入口和新建码仅属于寄件管理，不扩展通用表格组件。 -->
      <RouterLink
        to="/delivery"
        class="theme-control inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
      >
        <ExternalLinkIcon class="h-4 w-4" />{{ t('delivery.title') }}
      </RouterLink>
      <BaseButton size="sm" @click="openCreate">
        <template #icon><PlusIcon class="mr-2 h-4 w-4" /></template>
        {{ t('delivery.create') }}
      </BaseButton>
      <BaseButton variant="secondary" :loading="loading" @click="refresh">
        <template #icon><RefreshCwIcon class="mr-2 h-4 w-4" /></template>
        {{ t('fileManage.refresh') }}
      </BaseButton>
    </div>
  </div>
  <!-- 筛选区与文件管理保持相同结构，关键字查询名称与备注，标签使用独立精确筛选。 -->
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
    <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
  <DeliveryBatchActions :state="props.state" />
  <DataTable
    class="delivery-code-table"
    :title="t('delivery.list')"
    :headers="[
      '',
      t('delivery.name'),
      t('delivery.code'),
      t('delivery.expires'),
      t('delivery.status'),
      t('delivery.usage'),
      t('delivery.actions')
    ]"
  >
    <template #body>
      <tr v-if="!codes.length">
        <td colspan="7" class="px-6 py-14 text-center">
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
          <BaseButton size="sm" variant="outline" @click="copyListedCode(item)">
            <CopyIcon class="mr-1 h-4 w-4" />{{ t('delivery.viewCode') }}
          </BaseButton>
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
            <BaseButton
              size="sm"
              variant="danger"
              :disabled="acting"
              @click="pendingDelete = { kind: 'code', id: item.id, name: item.name }"
            >{{ t('common.delete') }}</BaseButton>
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

<style scoped src="./delivery.css"></style>
