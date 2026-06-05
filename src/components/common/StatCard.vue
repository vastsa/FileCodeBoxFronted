<template>
  <div
    class="rounded-2xl border p-5 shadow-sm backdrop-blur-xl transition-colors duration-300"
    :class="[
      isDarkMode
        ? 'border-white/10 bg-white/[0.06] shadow-[0_20px_50px_-34px_rgba(255,255,255,0.2)]'
        : 'border-white/80 bg-white/70 shadow-[0_20px_50px_-34px_rgba(24,24,27,0.28)]'
    ]"
  >
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium" :class="[isDarkMode ? 'text-zinc-400' : 'text-zinc-500']">
          {{ title }}
        </p>
        <h3
          class="text-2xl font-semibold mt-1"
          :class="[isDarkMode ? 'text-white' : 'text-zinc-950']"
        >
          {{ value }}
        </h3>
      </div>
      <div class="p-3 rounded-full" :class="iconBgClass">
        <component :is="icon" class="w-6 h-6" :class="iconClass" />
      </div>
    </div>
    <p class="text-sm mt-2" :class="descriptionClass">
      <slot name="description"></slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useInjectedDarkMode } from '@/composables'

interface Props {
  title: string
  value: string | number
  icon: Component
  iconColor: 'zinc'
  descriptionType?: 'success' | 'error' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  descriptionType: 'neutral'
})

const isDarkMode = useInjectedDarkMode()

const iconBgClass = computed(() => {
  return isDarkMode.value ? 'bg-white/10' : 'bg-zinc-100/90'
})

const iconClass = computed(() => {
  return isDarkMode.value ? 'text-zinc-100' : 'text-zinc-700'
})

const descriptionClass = computed(() => {
  const typeMap = {
    success: isDarkMode.value ? 'text-zinc-200' : 'text-zinc-700',
    error: isDarkMode.value ? 'text-red-400' : 'text-red-600',
    neutral: isDarkMode.value ? 'text-zinc-500' : 'text-zinc-500'
  }
  return typeMap[props.descriptionType]
})
</script>
