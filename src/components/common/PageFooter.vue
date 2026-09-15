<template>
  <div
    class="flex items-center justify-between border-t px-5 py-4 transition-colors sm:px-8 sm:py-6"
    :class="isDarkMode ? 'border-zinc-800/60 bg-zinc-900/40' : 'border-slate-100 bg-slate-50/50'"
  >
    <router-link
      v-if="linkText && linkTo"
      :to="linkTo"
      class="group flex items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm"
      :class="
        isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-zinc-950'
      "
    >
      <component
        :is="linkMode === 'retrieve' ? CloudDownloadIcon : SendIcon"
        class="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
      />
      {{ linkText }}
    </router-link>
    <span v-else></span>

    <!-- 发送与取件页面共用中间寄件入口，避免只调整其中一页造成位置不一致。 -->
    <router-link
      v-if="showDelivery"
      :to="ROUTES.DELIVERY"
      class="group flex items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm"
      :class="
        isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-zinc-950'
      "
    >
      <InboxIcon class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {{ t('delivery.title') }}
    </router-link>

    <button
      type="button"
      @click="$emit('toggle-drawer')"
      class="group flex items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm"
      :class="
        isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-zinc-950'
      "
    >
      <HistoryIcon class="h-3.5 w-3.5 transition-transform group-hover:-rotate-12 sm:h-4 sm:w-4" />
      {{ drawerText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { ROUTES } from '@/constants'
import { CloudDownloadIcon, HistoryIcon, InboxIcon, SendIcon } from 'lucide-vue-next'

interface Props {
  // 寄件页复用发送表单时隐藏自身入口，普通收发页均显示。
  showDelivery?: boolean
  linkMode?: 'send' | 'retrieve'
  linkText?: string
  linkTo?: string
  drawerText: string
}

interface Emits {
  'toggle-drawer': []
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
</script>
