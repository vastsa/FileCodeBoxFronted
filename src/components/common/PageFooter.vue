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
      <SendIcon
        class="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
      />
      {{ linkText }}
    </router-link>
    <span v-else></span>

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
import { HistoryIcon, SendIcon } from 'lucide-vue-next'

interface Props {
  linkText?: string
  linkTo?: string
  drawerText: string
}

interface Emits {
  'toggle-drawer': []
}

defineProps<Props>()
defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')
</script>
