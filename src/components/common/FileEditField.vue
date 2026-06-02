<template>
  <div class="space-y-2 group">
    <label
      class="text-sm font-medium flex items-center space-x-2 transition-colors duration-200"
      :class="[
        isDarkMode
          ? 'text-gray-300 group-focus-within:text-indigo-400'
          : 'text-gray-700 group-focus-within:text-indigo-600'
      ]"
    >
      <span>{{ label }}</span>
      <div
        class="h-px flex-1 transition-colors duration-200"
        :class="[
          isDarkMode
            ? 'bg-gray-700 group-focus-within:bg-indigo-500/50'
            : 'bg-gray-200 group-focus-within:bg-indigo-500/30'
        ]"
      ></div>
    </label>
    <div class="relative rounded-lg shadow-sm">
      <input
        :type="type"
        :value="modelValue ?? ''"
        class="block w-full rounded-lg border-0 py-2.5 pl-4 pr-10 transition-all duration-200 focus:ring-2 focus:ring-inset sm:text-sm"
        :class="[
          isDarkMode
            ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:ring-indigo-500/50'
            : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-indigo-500'
        ]"
        :placeholder="placeholder"
        @input="handleInput"
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-opacity duration-200 opacity-0 group-focus-within:opacity-100"
      >
        <CheckIcon class="w-5 h-5" :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CheckIcon } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string | number | null
    placeholder?: string
    type?: 'text' | 'number' | 'datetime-local'
  }>(),
  {
    placeholder: '',
    type: 'text'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isDarkMode = inject('isDarkMode')

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? null : target.valueAsNumber)
    return
  }

  emit('update:modelValue', target.value)
}
</script>
