<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDeliveryAdmin } from '@/composables'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import FileManageView from './FileManageView.vue'
import DeliveryCodeList from '@/components/delivery/DeliveryCodeList.vue'
import DeliveryCodeEditor from '@/components/delivery/DeliveryCodeEditor.vue'
import DeliveryCodeShare from '@/components/delivery/DeliveryCodeShare.vue'

// 父页面仅协调列表与收件页面，表单和批量操作各自封装。
const { t } = useI18n()
const state = useDeliveryAdmin()
const { selected, pendingDelete, acting, confirmDelete, closeFiles, refresh } = state
onMounted(refresh)
</script>

<template>
  <div class="delivery-management p-4 sm:p-6">
    <DeliveryCodeList v-if="!selected" :state="state" />
    <DeliveryCodeEditor :state="state" />
    <DeliveryCodeShare :state="state" />
    <section v-if="selected">
      <div class="mb-5 flex items-center justify-between gap-3">
        <h2 class="theme-text-strong text-xl font-bold">{{ selected.name }} · {{ t('delivery.received') }}</h2>
        <BaseButton variant="secondary" @click="closeFiles">{{ t('delivery.backToCodes') }}</BaseButton>
      </div>
      <FileManageView :key="selected.id" embedded :delivery-id="selected.id" />
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
