<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CopyIcon, ExternalLinkIcon } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { useDeliveryAdmin } from '@/composables'
import { toRefs, reactive } from 'vue'

// 页面状态由父层唯一创建，子组件只负责对应区域。
const props = defineProps<{ state: ReturnType<typeof useDeliveryAdmin> }>()
const {
  createdItem,
  createdLink,
  copyLink,
  createdCode,
  copyMessage,
  showCreated,
  copy,
  closeCreated
} = toRefs(reactive(props.state))
const { t } = useI18n()
const codeInput = ref<HTMLInputElement | null>(null)
const linkInput = ref<HTMLInputElement | null>(null)
</script>

<template>
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
          >{{ t('delivery.expires') }} {{ new Date(createdItem.expires_at).toLocaleString() }}</span
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
</template>

<style scoped src="./delivery.css"></style>
