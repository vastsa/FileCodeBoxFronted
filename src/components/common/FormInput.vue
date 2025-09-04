<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :minlength="minlength"
        :maxlength="maxlength"
        class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        :class="[
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400 placeholder-gray-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        ]"
      />
      <slot name="suffix"></slot>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p v-if="hint" class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  minlength?: number
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isDarkMode = inject('isDarkMode')
</script>