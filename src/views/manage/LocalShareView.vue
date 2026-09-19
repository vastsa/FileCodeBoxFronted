<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-2xl font-bold" :class="[primaryTextClass]">
          {{ t('admin.localShare.title') }}
        </h2>
        <p class="mt-1 text-sm" :class="[mutedTextClass]">
          {{ t('admin.localShare.subtitle') }}
        </p>
      </div>
      <BaseButton variant="secondary" :loading="isLoading" @click="loadDirectory(currentPath)">
        <template #icon>
          <RefreshCwIcon class="mr-2 h-4 w-4" />
        </template>
        {{ t('admin.localShare.refresh') }}
      </BaseButton>
    </div>

    <p class="mb-4 rounded-lg border px-4 py-3 text-sm" :class="[hintClass]">
      {{ t('admin.localShare.mountHint') }}
    </p>

    <nav class="mb-4 flex flex-wrap items-center gap-1 text-sm" :class="[mutedTextClass]">
      <button type="button" class="rounded-md px-2 py-1 hover:underline" @click="loadDirectory('')">
        {{ t('admin.localShare.root') }}
      </button>
      <template v-for="crumb in breadcrumbs" :key="crumb.path">
        <ChevronRightIcon class="h-4 w-4 shrink-0" />
        <button
          type="button"
          class="rounded-md px-2 py-1 hover:underline"
          @click="loadDirectory(crumb.path)"
        >
          {{ crumb.name }}
        </button>
      </template>
    </nav>

    <p
      v-if="truncated"
      class="mb-4 rounded-lg border px-4 py-2 text-sm"
      :class="[warnClass]"
    >
      {{ t('admin.localShare.truncated', { count: 500 }) }}
    </p>

    <section class="overflow-hidden rounded-lg border" :class="[panelClass]">
      <div v-if="isLoading" class="px-6 py-16 text-center text-sm" :class="[mutedTextClass]">
        {{ t('common.loading') }}
      </div>
      <div
        v-else-if="items.length === 0"
        class="px-6 py-16 text-center text-sm"
        :class="[mutedTextClass]"
      >
        {{ t('admin.localShare.empty') }}
      </div>
      <ul v-else class="divide-y" :class="[dividerClass]">
        <li
          v-for="item in items"
          :key="item.path"
          class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            v-if="item.type === 'dir'"
            type="button"
            class="flex min-w-0 items-center gap-3 text-left"
            @click="loadDirectory(item.path)"
          >
            <FolderIcon class="h-5 w-5 shrink-0" :class="[mutedTextClass]" />
            <span>
              <span class="block truncate text-sm font-medium" :class="[primaryTextClass]">
                {{ item.name }}
              </span>
              <span class="mt-0.5 block text-xs" :class="[mutedTextClass]">
                {{ t('admin.localShare.typeDir') }}
                <template v-if="item.ctime"> · {{ item.ctime }}</template>
              </span>
            </span>
          </button>
          <div v-else class="flex min-w-0 items-center gap-3">
            <FileIcon class="h-5 w-5 shrink-0" :class="[mutedTextClass]" />
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium" :class="[primaryTextClass]">
                {{ item.name }}
              </span>
              <span class="mt-0.5 block text-xs" :class="[mutedTextClass]">
                {{ formatFileSize(item.size || 0) }}
                <template v-if="item.ctime"> · {{ item.ctime }}</template>
              </span>
            </span>
          </div>
          <div v-if="item.type === 'file'" class="flex flex-wrap gap-2">
            <BaseButton size="sm" @click="openShare(item)">
              {{ t('admin.localShare.share') }}
            </BaseButton>
            <BaseButton size="sm" variant="danger" :loading="deletingPath === item.path" @click="removeFile(item)">
              {{ t('admin.localShare.delete') }}
            </BaseButton>
          </div>
        </li>
      </ul>
    </section>

    <BaseModal :show="showShareModal" :title="shareModalTitle" @close="closeShareModal">
      <div v-if="shareResult" class="space-y-4">
        <p class="text-sm" :class="[mutedTextClass]">{{ t('admin.localShare.shareHint') }}</p>
        <p class="break-all text-2xl font-semibold tracking-widest" :class="[primaryTextClass]">
          {{ shareResult.code }}
        </p>
        <p class="text-sm" :class="[mutedTextClass]">{{ shareResult.name }}</p>
      </div>
      <div v-else class="space-y-4">
        <p class="break-all text-sm font-medium" :class="[primaryTextClass]">
          {{ sharingItem?.path }}
        </p>
        <p class="text-sm" :class="[mutedTextClass]">{{ t('admin.localShare.shareHint') }}</p>
        <label class="block space-y-1">
          <span class="text-xs font-medium" :class="[mutedTextClass]">
            {{ t('admin.localShare.expire') }}
          </span>
          <select v-model="expireStyle" class="w-full rounded-lg border px-3 py-2 text-sm" :class="[fieldClass]">
            <option v-for="option in expireOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label v-if="expireStyle !== 'forever'" class="block space-y-1">
          <span class="text-xs font-medium" :class="[mutedTextClass]">
            {{ t('admin.localShare.expireValue') }}
          </span>
          <input
            v-model.number="expireValue"
            type="number"
            min="1"
            class="w-full rounded-lg border px-3 py-2 text-sm"
            :class="[fieldClass]"
          />
        </label>
      </div>
      <template #footer>
        <template v-if="shareResult">
          <BaseButton variant="secondary" @click="copyCode">
            {{ t('admin.localShare.copyCode') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="copyLink">
            {{ t('admin.localShare.copyLink') }}
          </BaseButton>
          <BaseButton @click="goToFiles">{{ t('admin.localShare.openFiles') }}</BaseButton>
        </template>
        <template v-else>
          <BaseButton variant="outline" @click="closeShareModal">{{ t('common.cancel') }}</BaseButton>
          <BaseButton :loading="isSharing" @click="confirmShare">{{ t('admin.localShare.share') }}</BaseButton>
        </template>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, FileIcon, FolderIcon, RefreshCwIcon } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { ROUTES } from '@/constants'
import { useInjectedDarkMode, useLocalShare } from '@/composables'
import { formatFileSize } from '@/utils/common'

const { t } = useI18n()
const router = useRouter()
const isDarkMode = useInjectedDarkMode()
const {
  breadcrumbs,
  currentPath,
  deletingPath,
  expireOptions,
  expireStyle,
  expireValue,
  isLoading,
  isSharing,
  items,
  shareModalTitle,
  shareResult,
  sharingItem,
  showShareModal,
  truncated,
  closeShareModal,
  confirmShare,
  copyCode,
  copyLink,
  loadDirectory,
  openShare,
  removeFile
} = useLocalShare()

const primaryTextClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-zinc-950'))
const mutedTextClass = computed(() => (isDarkMode.value ? 'text-zinc-400' : 'text-zinc-500'))
const panelClass = computed(() =>
  isDarkMode.value
    ? 'border-white/10 bg-white/[0.06] shadow-[0_22px_54px_-36px_rgba(255,255,255,0.22)] backdrop-blur-xl'
    : 'border-white/80 bg-white/70 shadow-[0_22px_54px_-36px_rgba(24,24,27,0.28)] backdrop-blur-xl'
)
const fieldClass = computed(() =>
  isDarkMode.value
    ? 'border-white/10 bg-zinc-950/45 text-white'
    : 'border-zinc-200/80 bg-white/80 text-zinc-950'
)
const hintClass = computed(() =>
  isDarkMode.value
    ? 'border-white/10 bg-white/[0.04] text-zinc-300'
    : 'border-zinc-200/80 bg-white/80 text-zinc-600'
)
const warnClass = computed(() =>
  isDarkMode.value ? 'border-amber-500/20 bg-amber-500/10 text-amber-200' : 'border-amber-100 bg-amber-50 text-amber-800'
)
const dividerClass = computed(() => (isDarkMode.value ? 'divide-white/10' : 'divide-zinc-200/80'))

const goToFiles = () => {
  closeShareModal()
  void router.push(ROUTES.FILE_MANAGE)
}

onMounted(() => {
  void loadDirectory('')
})
</script>
