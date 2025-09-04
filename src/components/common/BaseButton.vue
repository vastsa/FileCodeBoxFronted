<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    class="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      sizeClasses,
      variantClasses,
      loading ? 'cursor-wait' : '',
      disabled ? 'pointer-events-none' : ''
    ]"
  >
    <slot name="icon" v-if="$slots.icon && !loading"></slot>
    <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const isDarkMode = inject('isDarkMode')

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const baseClasses = 'focus:ring-2 focus:ring-offset-2'
  
  if (props.variant === 'primary') {
    return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`
  }
  
  if (props.variant === 'secondary') {
    return isDarkMode
      ? `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500 border border-gray-600`
      : `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300`
  }
  
  if (props.variant === 'danger') {
    return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
  }
  
  if (props.variant === 'success') {
    return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`
  }
  
  if (props.variant === 'outline') {
    return isDarkMode
      ? `${baseClasses} border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500`
      : `${baseClasses} border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500`
  }
  
  return ''
})
</script>