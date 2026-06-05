<template>
  <div class="space-y-2">
    <label
      class="block text-sm font-medium"
      :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
    >
      {{ label }}
    </label>
    <div class="flex items-center space-x-2">
      <input
        type="number"
        :value="modelValue"
        class="w-24 rounded-xl border px-4 py-2.5 shadow-sm outline-none transition-all duration-200 ease-in-out focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500"
        :class="[
          isDarkMode
            ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
            : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
        ]"
        @input="handleInput"
      />
      <span :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']">{{ suffix }}</span>
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
