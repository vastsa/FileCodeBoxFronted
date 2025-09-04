<template>
  <div class="p-6 rounded-lg shadow-md transition-colors duration-300"
    :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
          {{ title }}
        </p>
        <h3 class="text-2xl font-bold mt-1" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
          {{ value }}
        </h3>
      </div>
      <div class="p-3 rounded-full" :class="iconBgClass">
        <component :is="icon" class="w-6 h-6" :class="iconClass" />
      </div>
    </div>
    <p class="text-sm mt-2" :class="descriptionClass">
      <slot name="description"></slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import type { Component } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: Component
  iconColor: 'indigo' | 'purple' | 'green' | 'blue'
  descriptionType?: 'success' | 'error' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  descriptionType: 'neutral'
})

const isDarkMode = inject('isDarkMode')

const iconBgClass = computed(() => {
  const colorMap = {
    indigo: isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100',
    purple: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
    green: isDarkMode ? 'bg-green-900' : 'bg-green-100',
    blue: isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
  }
  return colorMap[props.iconColor]
})

const iconClass = computed(() => {
  const colorMap = {
    indigo: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
    purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    green: isDarkMode ? 'text-green-400' : 'text-green-600',
    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600'
  }
  return colorMap[props.iconColor]
})

const descriptionClass = computed(() => {
  const typeMap = {
    success: isDarkMode ? 'text-green-400' : 'text-green-600',
    error: isDarkMode ? 'text-red-400' : 'text-red-600',
    neutral: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  }
  return typeMap[props.descriptionType]
})
</script>