<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TrashIcon } from 'lucide-vue-next'
import { useInjectedDarkMode } from '@/composables'

// 文件管理与寄件管理共用行内删除样式；确认和删除语义仍由各自业务处理。
defineProps<{ disabled?: boolean }>()
defineEmits<{ click: [event: MouseEvent] }>()
const { t } = useI18n()
const isDarkMode = useInjectedDarkMode()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      isDarkMode
        ? 'bg-red-900/20 text-red-300 hover:bg-red-900/30'
        : 'bg-red-50 text-red-600 hover:bg-red-100'
    "
    @click="$emit('click', $event)"
  >
    <TrashIcon class="mr-1.5 h-4 w-4" />
    {{ t('common.delete') }}
  </button>
</template>
