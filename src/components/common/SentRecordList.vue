<template>
  <div class="flex-1 overflow-y-auto p-4 sm:p-6">
    <transition-group v-if="records.length" name="list" tag="div" class="space-y-3 sm:space-y-4">
      <div
        v-for="record in records"
        :key="record.id"
        class="group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-300 sm:gap-4 sm:rounded-2xl sm:p-4"
        :class="
          isDarkMode
            ? 'border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/80'
            : 'border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-slate-200 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)]'
        "
        @click="$emit('view-details', record)"
      >
        <div
          class="rounded-lg p-2.5 transition-colors sm:rounded-[1rem] sm:p-3.5"
          :class="
            isDarkMode
              ? 'bg-zinc-950 text-zinc-200 group-hover:bg-white/10'
              : 'bg-zinc-100 text-zinc-800 group-hover:bg-zinc-200'
          "
        >
          <FileIcon class="h-5 w-5" :stroke-width="1.5" />
        </div>
        <div class="min-w-0 flex-1">
          <p
            class="mb-0.5 truncate text-sm font-medium sm:mb-1"
            :class="isDarkMode ? 'text-zinc-200' : 'text-slate-700'"
          >
            {{ record.filename ? record.filename : 'Text' }}
          </p>
          <div
            class="flex items-center gap-1.5 truncate text-[10px] font-medium sm:gap-2 sm:text-xs"
            :class="isDarkMode ? 'text-zinc-500' : 'text-slate-400'"
          >
            <span>{{ record.size }}</span>
            <span class="h-1 w-1 rounded-full bg-current opacity-50"></span>
            <span class="truncate">{{ record.date }}</span>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            @click.stop="$emit('copy-link', record)"
            class="rounded-lg p-2 opacity-100 transition-all duration-300 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:rounded-xl sm:p-2.5"
            :class="
              isDarkMode ? 'text-zinc-300 hover:bg-zinc-700' : 'text-slate-600 hover:bg-slate-100'
            "
            :aria-label="t('fileManage.copyLink')"
          >
            <ClipboardCopyIcon class="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
          <button
            type="button"
            @click.stop="$emit('view-details', record)"
            class="rounded-lg p-2 opacity-100 transition-all duration-300 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:rounded-xl sm:p-2.5"
            :class="
              isDarkMode ? 'text-zinc-300 hover:bg-zinc-700' : 'text-slate-600 hover:bg-slate-100'
            "
            :aria-label="t('fileRecord.viewDetails')"
          >
            <EyeIcon class="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
          <button
            type="button"
            @click.stop="$emit('delete-record', record.id)"
            class="rounded-lg p-2 opacity-100 transition-all duration-300 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:rounded-xl sm:p-2.5"
            :class="
              isDarkMode ? 'text-red-300 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
            "
            :aria-label="t('fileRecord.deleteRecord')"
          >
            <TrashIcon class="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        </div>
      </div>
    </transition-group>
    <div
      v-else
      class="rounded-2xl border px-4 py-10 text-center text-sm"
      :class="
        isDarkMode
          ? 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
          : 'border-slate-100 bg-white text-slate-400'
      "
    >
      {{ t('common.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ClipboardCopyIcon, EyeIcon, FileIcon, TrashIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { SentFileRecord } from '@/types'

const { t } = useI18n()

defineProps<{
  records: SentFileRecord[]
}>()

defineEmits<{
  'copy-link': [record: SentFileRecord]
  'view-details': [record: SentFileRecord]
  'delete-record': [id: number]
}>()

const isDarkMode = inject('isDarkMode')
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
