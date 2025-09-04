<template>
  <transition name="drawer">
    <div
      v-if="visible"
      class="fixed inset-y-0 right-0 w-full sm:w-120 bg-opacity-70 backdrop-filter backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col"
      :class="[isDarkMode ? 'bg-gray-900' : 'bg-white']"
    >
      <div
        class="flex justify-between items-center p-6 border-b"
        :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']"
      >
        <h3 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
          {{ title }}
        </h3>
        <button
          @click="$emit('close')"
          class="hover:text-white transition duration-300"
          :class="[isDarkMode ? 'text-gray-400' : 'text-gray-800']"
        >
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <slot></slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { XIcon } from 'lucide-vue-next'

interface Props {
  visible: boolean
  title: string
}

interface Emits {
  close: []
}

defineProps<Props>()
defineEmits<Emits>()
const isDarkMode = inject('isDarkMode')
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

@media (min-width: 640px) {
  .sm\:w-120 {
    width: 30rem;
    /* 480px */
  }
}
</style>