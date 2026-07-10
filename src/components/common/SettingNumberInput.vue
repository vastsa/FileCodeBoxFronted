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
        :min="min"
        :max="max"
        step="1"
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

const props = defineProps<{
  label: string
  modelValue: number
  suffix: string
  min?: number
  max?: number
}>()

const isDarkMode = inject('isDarkMode')

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.value) {
    emit('update:modelValue', props.min ?? 0)
    return
  }

  const nextValue = input.valueAsNumber
  if (!Number.isNaN(nextValue)) {
    const integerValue = Math.round(nextValue)
    const lowerBound = props.min ?? Number.NEGATIVE_INFINITY
    const upperBound = props.max ?? Number.POSITIVE_INFINITY
    emit('update:modelValue', Math.min(upperBound, Math.max(lowerBound, integerValue)))
  }
}
</script>
