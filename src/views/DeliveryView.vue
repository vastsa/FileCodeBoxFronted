<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SendFileView from './SendFileView.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useDelivery } from '@/composables'

// 此页只负责验证寄件码，验证后直接挂载普通发送页。
const { t } = useI18n()
const router = useRouter()
const { code, session, verifying, message, verify, uploaded } = useDelivery()
</script>

<template>
  <SendFileView
    v-if="session"
    :delivery-session="session"
    @change-delivery="session = null"
    @delivery-success="uploaded"
  />
  <div
    v-else
    class="theme-page flex min-h-screen items-center justify-center px-4 pb-8 pt-24 sm:p-8"
  >
    <div
      class="theme-surface w-full max-w-md rounded-[2rem] border px-5 py-8 shadow-sm sm:rounded-[2.5rem] sm:px-8 sm:py-12"
    >
      <PageHeader
        :title="t('delivery.title')"
        :subtitle="t('delivery.subtitle')"
        mode="send"
        @title-click="router.push('/')"
      />
      <form class="space-y-6" @submit.prevent="verify">
        <label class="block space-y-2 text-sm font-medium">
          <span class="theme-text-muted">{{ t('delivery.code') }}</span>
          <input
            v-model="code"
            :aria-label="t('delivery.code')"
            :placeholder="t('delivery.codePlaceholder')"
            autocomplete="off"
            spellcheck="false"
            required
            minlength="8"
            maxlength="64"
            :disabled="verifying"
            class="theme-control w-full rounded-2xl border px-4 py-3.5 outline-none focus:ring-2"
          />
        </label>
        <BaseButton type="submit" class="w-full !rounded-2xl !py-3.5" :loading="verifying">{{
          t('delivery.verify')
        }}</BaseButton>
        <p class="theme-text-muted text-center text-xs leading-5">
          {{ t('delivery.privateNote') }}
        </p>
        <p v-if="message" role="alert" class="text-sm text-red-600 dark:text-red-400">
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>
