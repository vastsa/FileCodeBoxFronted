<template>
  <div
    class="overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl transition-all duration-300"
    :class="[
      isDarkMode
        ? 'border-white/10 bg-white/[0.06] shadow-[0_22px_54px_-36px_rgba(255,255,255,0.22)]'
        : 'border-white/80 bg-white/70 shadow-[0_22px_54px_-36px_rgba(24,24,27,0.28)]'
    ]"
  >
    <div
      class="px-6 py-4 border-b"
      :class="[isDarkMode ? 'border-white/10' : 'border-zinc-200/70']"
    >
      <h3 class="text-lg font-medium" :class="[isDarkMode ? 'text-white' : 'text-zinc-950']">
        {{ title }}
      </h3>
    </div>
    <div class="overflow-x-auto">
      <table
        class="min-w-full divide-y"
        :class="[isDarkMode ? 'divide-white/10' : 'divide-zinc-200/70']"
      >
        <thead :class="[isDarkMode ? 'bg-zinc-950/35' : 'bg-zinc-50/80']">
          <tr>
            <th
              v-for="header in headers"
              :key="header"
              class="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider"
              :class="[isDarkMode ? 'text-zinc-400' : 'text-zinc-500']"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody
          :class="[
            isDarkMode
              ? 'bg-transparent divide-y divide-white/10'
              : 'bg-white/40 divide-y divide-zinc-200/70'
          ]"
        >
          <slot name="body"></slot>
        </tbody>
      </table>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  title: string
  headers: string[]
}

defineProps<Props>()

const isDarkMode = inject('isDarkMode')
</script>
