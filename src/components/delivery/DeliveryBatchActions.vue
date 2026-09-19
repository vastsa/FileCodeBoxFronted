<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { XIcon, CheckIcon, TrashIcon, ClockIcon } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { useDeliveryAdmin } from '@/composables'
import { toRefs, reactive } from 'vue'

// 页面状态由父层唯一创建，子组件只负责对应区域。
const props = defineProps<{ state: ReturnType<typeof useDeliveryAdmin> }>()
const {
  selectedCount,
  hasSelection,
  isAllCurrentPageSelected,
  showBatchEdit,
  batchForm,
  toggleCurrentPageSelection,
  clearSelection,
  batch,
  openBatchEdit,
  codes,
  acting,
  pendingDelete
} = toRefs(reactive(props.state))
const { t } = useI18n()
</script>

<template>
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
</template>

<style scoped src="./delivery.css"></style>
