<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium mb-2" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
      {{ label }}
    </label>
    <div class="flex items-center">
      <button
        type="button"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :class="[modelValue === 1 ? 'bg-indigo-600' : 'bg-gray-200']"
        role="switch"
        :aria-checked="modelValue === 1"
        @click="$emit('toggle')"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="[
            modelValue === 1 ? 'translate-x-5' : 'translate-x-0',
            isDarkMode && modelValue !== 1 ? 'bg-gray-100' : 'bg-white'
          ]"
        />
      </button>
      <span class="ml-3 text-sm" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
        {{ modelValue === 1 ? enabledText : disabledText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

defineProps<{
  label: string
  modelValue: number
  enabledText: string
  disabledText: string
}>()

defineEmits<{
  toggle: []
}>()

const isDarkMode = inject('isDarkMode')
</script>
