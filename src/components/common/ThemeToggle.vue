<script setup lang="ts">
import { inject } from 'vue'
import { SunIcon, MoonIcon } from 'lucide-vue-next'

const isDarkMode = inject('isDarkMode') as { value: boolean }
const toggleTheme = inject('toggleTheme') as () => void

const toggleColorMode = () => {
  toggleTheme()
}
</script>

<template>
  <button
    @click="toggleColorMode"
    class="p-2 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:rotate-180"
    :class="isDarkMode ? 'bg-gray-800 text-yellow-300' : 'bg-white text-gray-800'"
  >
    <SunIcon v-if="!isDarkMode" class="w-6 h-6" />
    <MoonIcon v-else class="w-6 h-6" />
  </button>
</template>
