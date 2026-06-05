<template>
  <div v-if="visible">
    <transition name="drawer-overlay" appear>
      <div
        class="fixed inset-0 z-40 backdrop-blur-sm"
        :class="isDarkMode ? 'bg-black/60' : 'bg-slate-900/20'"
        @click="$emit('close')"
      ></div>
    </transition>

    <transition name="drawer" appear>
      <aside
        class="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-hidden border-l shadow-2xl sm:w-[28rem]"
        :class="
          isDarkMode
            ? 'border-zinc-800 bg-zinc-950'
            : 'border-white/50 bg-white/95 backdrop-blur-xl'
        "
      >
        <div
          class="flex items-center justify-between border-b px-5 py-5 sm:px-8 sm:py-6"
          :class="isDarkMode ? 'border-zinc-800/80' : 'border-slate-100'"
        >
          <h3
            class="flex items-center gap-2 text-lg font-semibold tracking-tight sm:gap-3 sm:text-xl"
            :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
          >
            <span
              class="rounded-lg p-1.5 sm:rounded-xl sm:p-2"
              :class="isDarkMode ? 'bg-white/10 text-zinc-100' : 'bg-zinc-100 text-zinc-900'"
            >
              <HistoryIcon class="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            </span>
            {{ title }}
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg p-1.5 transition-all duration-300 hover:scale-105 active:scale-95 sm:rounded-xl sm:p-2"
            :class="
              isDarkMode
                ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            "
          >
            <XIcon class="h-5 w-5" />
          </button>
        </div>
        <slot></slot>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { HistoryIcon, XIcon } from 'lucide-vue-next'

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
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
