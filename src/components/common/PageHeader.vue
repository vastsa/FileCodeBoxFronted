<template>
  <div class="mb-7 flex flex-col items-center text-center sm:mb-10">
    <button
      type="button"
      @click="$emit('title-click')"
      class="group relative mb-4 flex h-14 w-14 items-center justify-center rounded-[1rem] border transition-transform duration-300 hover:scale-105 sm:mb-6 sm:h-16 sm:w-16 sm:rounded-[1.25rem]"
      :class="
        isDarkMode
          ? 'border-white/10 bg-white/10 text-zinc-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
          : 'border-white/80 bg-zinc-100 text-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_4px_10px_rgba(24,24,27,0.04)]'
      "
      :aria-label="title"
    >
      <div
        class="absolute inset-0 rounded-[1rem] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 sm:rounded-[1.25rem]"
        :class="isDarkMode ? 'bg-white/10' : 'bg-zinc-300/40'"
      ></div>
      <component :is="headerIcon" class="relative z-10 h-7 w-7 sm:h-8 sm:w-8" :stroke-width="1.5" />
    </button>
    <h1
      @click="$emit('title-click')"
      class="mb-2 cursor-pointer text-xl font-semibold tracking-tight sm:text-2xl"
      :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
    >
      {{ title }}
    </h1>
    <p
      v-if="subtitle"
      class="text-xs font-medium sm:text-sm"
      :class="isDarkMode ? 'text-zinc-400' : 'text-slate-500'"
    >
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { CloudDownloadIcon, SendIcon } from 'lucide-vue-next'

interface Props {
  title: string
  subtitle?: string
  mode?: 'retrieve' | 'send'
}

interface Emits {
  'title-click': []
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  mode: 'retrieve'
})
defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')
const headerIcon = computed(() => (props.mode === 'send' ? SendIcon : CloudDownloadIcon))
</script>
