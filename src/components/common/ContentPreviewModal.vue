<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out sm:p-6"
        :class="isDarkMode ? 'border-zinc-800 bg-zinc-950/95' : 'border-white/50 bg-white/95'"
      >
        <div class="flex justify-between items-center mb-4 flex-shrink-0">
          <h3
            class="text-xl font-semibold tracking-tight sm:text-2xl"
            :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
          >
            {{ t('contentPreview.title') }}
          </h3>
          <div class="flex items-center gap-3">
            <button
              @click="$emit('copy-content')"
              class="flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-medium transition duration-300"
              :class="
                isDarkMode
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              "
            >
              <CopyIcon class="w-4 h-4" />
              {{ t('common.copy') }}
            </button>
            <button
              @click="$emit('close')"
              class="rounded-xl p-1.5 transition duration-300"
              :class="
                isDarkMode
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              "
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div
            class="prose max-w-none p-6 rounded-xl break-words overflow-wrap-anywhere"
            :class="isDarkMode ? 'prose-invert bg-zinc-900/60' : 'bg-slate-50'"
            v-html="renderedContent"
          ></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { CopyIcon, XIcon } from 'lucide-vue-next'

interface Props {
  visible: boolean
  renderedContent: string
}

interface Emits {
  close: []
  'copy-content': []
}

defineProps<Props>()
defineEmits<Emits>()
const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) rgba(243, 244, 246, 0.5);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
  transition: background-color 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 深色模式下的滚动条样式 */
:deep([class*='dark']) .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.5) rgba(31, 41, 55, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* 确保滚动容器有背景色 */
.custom-scrollbar {
  background: inherit;
}

/* 文本换行相关样式 */
.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}

/* 添加 Markdown 样式 */
:deep(.prose) {
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: rgb(39, 39, 42);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(.prose p),
:deep(.prose div),
:deep(.prose span),
:deep(.prose code),
:deep(.prose pre) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

:deep(.prose pre) {
  white-space: pre-wrap;
  overflow-x: auto;
}

:deep(.prose code) {
  white-space: pre-wrap;
}

:deep(.prose-invert h1),
:deep(.prose-invert h2),
:deep(.prose-invert h3),
:deep(.prose-invert h4),
:deep(.prose-invert h5),
:deep(.prose-invert h6) {
  color: rgb(244, 244, 245);
}
</style>
