<template>
  <div class="flex flex-col">
    <textarea
      id="text-content"
      :value="modelValue"
      @input="updateValue"
      :rows="rows"
      :placeholder="placeholderText"
      :class="[
        'flex-grow resize-none rounded-2xl border px-4 py-3 placeholder-slate-400 outline-none transition duration-300 custom-scrollbar focus:ring-2',
        isDarkMode
          ? 'border-zinc-800 bg-zinc-950/50 text-zinc-100 focus:border-zinc-500 focus:ring-white/10'
          : 'border-slate-200 bg-white text-slate-900 focus:border-zinc-400 focus:ring-zinc-950/10'
      ]"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  modelValue: string
  rows?: number
  placeholder?: string
}

interface Emits {
  'update:modelValue': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  rows: 7,
  placeholder: '在此输入要发送的文本...'
})

const emit = defineEmits<Emits>()
const isDarkMode = inject('isDarkMode')

// 使用computed属性处理多语言文本
const placeholderText = computed(() => props.placeholder || t('send.uploadArea.textInput'))

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
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
</style>
