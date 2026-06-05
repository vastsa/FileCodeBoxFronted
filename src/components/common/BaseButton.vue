<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    class="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      sizeClasses,
      variantClasses,
      loading ? 'cursor-wait' : '',
      disabled ? 'pointer-events-none' : ''
    ]"
  >
    <slot name="icon" v-if="$slots.icon && !loading"></slot>
    <div
      v-if="loading"
      class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
    ></div>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInjectedDarkMode } from '@/composables'

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

const isDarkMode = useInjectedDarkMode()

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
    return isDarkMode.value
      ? `${baseClasses} bg-zinc-200 text-zinc-950 hover:bg-zinc-100 focus:ring-zinc-500 focus:ring-offset-zinc-950 shadow-[0_12px_24px_-18px_rgba(255,255,255,0.45)]`
      : `${baseClasses} bg-zinc-900 text-white hover:bg-zinc-950 focus:ring-zinc-500 shadow-[0_12px_24px_-18px_rgba(24,24,27,0.45)]`
  }

  if (props.variant === 'secondary') {
    return isDarkMode.value
      ? `${baseClasses} border border-white/10 bg-white/[0.06] text-zinc-300 hover:bg-white/10 focus:ring-zinc-500 focus:ring-offset-zinc-950`
      : `${baseClasses} border border-white/80 bg-white/70 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500`
  }

  if (props.variant === 'danger') {
    return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
  }

  if (props.variant === 'success') {
    return isDarkMode.value
      ? `${baseClasses} bg-zinc-200 text-zinc-950 hover:bg-zinc-100 focus:ring-zinc-500 focus:ring-offset-zinc-950`
      : `${baseClasses} bg-zinc-900 text-white hover:bg-zinc-950 focus:ring-zinc-500`
  }

  if (props.variant === 'outline') {
    return isDarkMode.value
      ? `${baseClasses} border border-white/10 text-zinc-300 hover:bg-white/10 focus:ring-zinc-500 focus:ring-offset-zinc-950`
      : `${baseClasses} border border-zinc-200/80 bg-white/40 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500`
  }

  return ''
})
</script>
