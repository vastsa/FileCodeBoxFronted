<template>
  <div class="space-y-6 p-6">

    <section class="theme-panel rounded-2xl border p-5 shadow-sm sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="theme-text-muted text-xs font-semibold uppercase tracking-wider">
            {{ t('admin.mcp.endpointLabel') }}
          </p>
          <code class="theme-text-strong mt-2 block break-all text-sm sm:text-base">{{ endpoint }}</code>
          <p class="theme-text-muted mt-2 text-xs">{{ t('admin.mcp.transport') }}</p>
        </div>
        <BaseButton variant="secondary" :disabled="isLoading" @click="copyEndpoint">
          <template #icon><CopyIcon class="mr-2 h-4 w-4" /></template>
          {{ t('admin.mcp.copyEndpoint') }}
        </BaseButton>
      </div>
    </section>

    <section class="theme-panel rounded-2xl border p-5 shadow-sm sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="max-w-2xl">
          <h3 class="theme-text-strong text-base font-semibold">{{ t('admin.mcp.securityTitle') }}</h3>
          <p class="theme-text-muted mt-1 text-sm">{{ t('admin.mcp.securityHelp') }}</p>
        </div>
        <fieldset :disabled="isLoading || isSaving" class="m-0 min-w-0 border-0 p-0">
          <legend class="sr-only">{{ t('admin.mcp.securityTitle') }}</legend>
          <SettingSwitch
            :label="t('admin.mcp.requireToken')"
            :model-value="requireToken"
            :enabled-text="t('common.enabled')"
            :disabled-text="t('common.disabled')"
            @toggle="toggleTokenRequirement"
          />
        </fieldset>
      </div>
      <p
        class="mt-4 rounded-xl border px-4 py-3 text-sm"
        :class="effectiveTokenRequired
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'theme-divider theme-text-muted bg-black/[0.02] dark:bg-white/[0.03]'"
      >
        {{ effectiveTokenRequired ? t('admin.mcp.tokenRequiredStatus') : t('admin.mcp.tokenOptionalStatus') }}
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <article
        v-for="tool in tools"
        :key="tool.name"
        class="theme-panel rounded-2xl border p-5 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="theme-brand flex h-10 w-10 items-center justify-center rounded-xl">
            <component :is="tool.icon" class="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 class="theme-text-strong font-semibold">{{ t(tool.title) }}</h3>
            <code class="theme-text-muted text-xs">{{ tool.name }}</code>
          </div>
        </div>
        <p class="theme-text-muted mt-4 text-sm">{{ t(tool.description) }}</p>
      </article>
    </section>

    <section class="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-5 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="max-w-2xl">
          <h3 class="theme-text-strong flex items-center gap-2 text-base font-semibold">
            <SparklesIcon class="h-5 w-5 text-violet-500" aria-hidden="true" />
            {{ t('admin.mcp.aiSetupTitle') }}
          </h3>
          <p class="theme-text-muted mt-1 text-sm">{{ t('admin.mcp.aiSetupHelp') }}</p>
        </div>
        <BaseButton :disabled="isLoading" @click="copyAiSetupPrompt">
          <template #icon><SparklesIcon class="mr-2 h-4 w-4" /></template>
          {{ t('admin.mcp.aiSetupButton') }}
        </BaseButton>
      </div>
      <label v-if="aiSetupPromptText" class="mt-4 block space-y-2">
        <span class="theme-text-muted text-xs">{{ t('admin.mcp.aiSetupFallback') }}</span>
        <textarea
          :value="aiSetupPromptText"
          readonly
          rows="7"
          class="w-full resize-y rounded-xl border px-3 py-2 font-mono text-xs"
          :class="isDarkMode ? 'border-white/10 bg-zinc-950/60 text-zinc-200' : 'border-zinc-200 bg-white/80 text-zinc-800'"
          :aria-label="t('admin.mcp.aiSetupFallback')"
          @focus="($event.target as HTMLTextAreaElement).select()"
        />
      </label>
      <p class="theme-text-muted mt-3 text-xs">{{ t('admin.mcp.aiSetupPrivacy') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInjectedDarkMode } from '@/composables'
import {
  CopyIcon,
  FileTextIcon,
  NetworkIcon,
  RefreshCwIcon,
  SparklesIcon,
  UploadIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import SettingSwitch from '@/components/common/SettingSwitch.vue'
import { useMcpSettings } from '@/composables'
import { buildAbsoluteUrl } from '@/utils/share-url'

import { useAdminHeaderActions } from '@/composables'
const { t } = useI18n()
const {
  isLoading,
  isSaving,
  requireToken,
  guestUploadOpen,
  loadSettings,
  toggleTokenRequirement,
  copyText
} = useMcpSettings()
const aiSetupPromptText = ref('')
const isDarkMode = useInjectedDarkMode()

const endpoint = computed(() => buildAbsoluteUrl('/mcp'))
const effectiveTokenRequired = computed(() => requireToken.value === 1 || guestUploadOpen.value === 0)
const tools = [
  {
    name: 'share_text',
    title: 'admin.mcp.shareTextTitle',
    description: 'admin.mcp.shareTextHelp',
    icon: FileTextIcon
  },
  {
    name: 'share_file',
    title: 'admin.mcp.shareFileTitle',
    description: 'admin.mcp.shareFileHelp',
    icon: UploadIcon
  }
]

const copyEndpoint = () => copyText(endpoint.value)

const copyAiSetupPrompt = async () => {
  const authentication = effectiveTokenRequired.value
    ? t('admin.mcp.aiAuthRequired')
    : t('admin.mcp.aiAuthOptional')
  const prompt = t('admin.mcp.aiSetupPrompt', { endpoint: endpoint.value, authentication })
  const copied = await copyText(prompt)
  aiSetupPromptText.value = copied ? '' : prompt
}

const headerConfig = computed(() => ({
  subtitle: t('admin.mcp.subtitle'),
  actions: [
    {
      key: 'refresh',
      label: t('admin.mcp.refresh'),
      icon: RefreshCwIcon,
      loading: isLoading.value,
      onClick: () => void loadSettings()
    }
  ]
}))
useAdminHeaderActions(headerConfig)

onMounted(() => {
  void loadSettings()
})
</script>
