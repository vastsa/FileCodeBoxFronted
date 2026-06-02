<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
      {{ label }}
    </label>
    <div class="flex items-center space-x-2">
      <input
        type="number"
        :value="modelValue"
        class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        :class="[
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
        ]"
        @input="handleInput"
      />
      <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

defineProps<{
  label: string
  modelValue: number
  suffix: string
}>()

const isDarkMode = inject('isDarkMode')

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.value) {
    emit('update:modelValue', 0)
    return
  }

  const nextValue = input.valueAsNumber
  if (!Number.isNaN(nextValue)) {
    emit('update:modelValue', nextValue)
  }
}
</script>
