<template>
  <div class="rounded-lg shadow-sm overflow-hidden transition-all duration-300"
    :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
    <div class="px-6 py-4 border-b" :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']">
      <h3 class="text-lg font-medium" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
        {{ title }}
      </h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y" :class="[isDarkMode ? 'divide-gray-700' : 'divide-gray-200']">
        <thead :class="[isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50']">
          <tr>
            <th v-for="header in headers" :key="header"
              class="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider"
              :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody :class="[
          isDarkMode
            ? 'bg-gray-800/50 divide-y divide-gray-700'
            : 'bg-white divide-y divide-gray-200'
        ]">
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