<template>
  <div class="space-y-2">
    <label
      v-if="label"
      class="block text-sm font-medium"
      :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
    >
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
        class="w-full rounded-xl border px-4 py-2.5 shadow-sm outline-none transition-all duration-200 ease-in-out focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500"
        :class="[
          isDarkMode
            ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
            : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        ]"
      />
      <slot name="suffix"></slot>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p v-if="hint" class="text-sm" :class="[isDarkMode ? 'text-zinc-400' : 'text-zinc-500']">
      {{ hint }}
    </p>
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
