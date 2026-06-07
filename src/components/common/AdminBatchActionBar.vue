<template>
  <section
    v-if="visible"
    class="mb-4 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    :class="[panelClass]"
  >
    <label class="inline-flex items-center gap-2 text-sm" :class="[primaryTextClass]">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-zinc-600 focus:ring-zinc-500"
        :checked="isAllCurrentPageSelected"
        :disabled="isBatchActionRunning"
        :indeterminate="isCurrentPagePartiallySelected"
        @change="$emit('toggle-current-page-selection')"
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
        @click="$emit('clear-selection')"
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
        @click="$emit('apply-policy-action', option.action)"
      >
        <template #icon>
          <component :is="getPolicyActionIcon(option.action)" class="mr-2 h-4 w-4" />
        </template>
        {{ option.label }}
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="!hasSelectedFiles || isBatchDeleting || isBatchPolicyActionRunning"
        :loading="isBatchUpdating"
        @click="$emit('open-batch-edit')"
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
        @click="$emit('delete-selected')"
      >
        <template #icon>
          <TrashIcon class="mr-2 h-4 w-4" />
        </template>
        {{ t('fileManage.batchDelete') }}
      </BaseButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClockIcon, InfinityIcon, RotateCcwIcon, TrashIcon, XIcon } from 'lucide-vue-next'
import type { AdminFilePolicyAction } from '@/types'
import BaseButton from './BaseButton.vue'

type BatchPolicyActionOption = {
  action: AdminFilePolicyAction
  label: string
  description: string
}

defineProps<{
  visible: boolean
  panelClass: string
  primaryTextClass: string
  isAllCurrentPageSelected: boolean
  isCurrentPagePartiallySelected: boolean
  isBatchActionRunning: boolean
  hasSelectedFiles: boolean
  selectedCount: number
  isBatchDeleting: boolean
  isBatchUpdating: boolean
  isBatchPolicyActionRunning: boolean
  batchPolicyActionOptions: BatchPolicyActionOption[]
}>()

defineEmits<{
  'toggle-current-page-selection': []
  'clear-selection': []
  'apply-policy-action': [action: AdminFilePolicyAction]
  'open-batch-edit': []
  'delete-selected': []
}>()

const { t } = useI18n()

const policyActionIconMap: Record<AdminFilePolicyAction, Component> = {
  extend_24h: ClockIcon,
  extend_7d: ClockIcon,
  make_permanent: InfinityIcon,
  reset_download_limit: RotateCcwIcon
}

const getPolicyActionIcon = (action: AdminFilePolicyAction) => policyActionIconMap[action]
</script>
