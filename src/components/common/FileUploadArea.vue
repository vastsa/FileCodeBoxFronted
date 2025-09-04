<template>
  <div
    class="rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 group cursor-pointer relative"
    :class="[
      isDarkMode
        ? 'bg-gray-800 bg-opacity-50 border-gray-600 hover:border-indigo-500'
        : 'bg-gray-100 border-gray-300 hover:border-indigo-500'
    ]"
    @click="triggerFileUpload"
    @dragover.prevent
    @drop.prevent="handleFileDrop"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileUpload"
      :accept="acceptedTypes"
    />
    <div class="absolute inset-0 w-full h-full" v-if="progress > 0">
      <BorderProgressBar :progress="progress" />
    </div>
    <UploadCloudIcon
      :class="[
        'w-16 h-16 transition-colors duration-300',
        isDarkMode
          ? 'text-gray-400 group-hover:text-indigo-400'
          : 'text-gray-600 group-hover:text-indigo-600'
      ]"
    />
    <p
      :class="[
        'mt-4 text-sm transition-colors duration-300 w-full text-center',
        isDarkMode
          ? 'text-gray-400 group-hover:text-indigo-400'
          : 'text-gray-600 group-hover:text-indigo-600'
      ]"
    >
      <span class="block truncate">
        {{ selectedFile ? selectedFile.name : placeholderText }}
      </span>
    </p>
    <p :class="['mt-2 text-xs', isDarkMode ? 'text-gray-500' : 'text-gray-400']">
      {{ descriptionText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { UploadCloudIcon } from 'lucide-vue-next'
import BorderProgressBar from './BorderProgressBar.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Props {
  selectedFile?: File | null
  progress?: number
  placeholder?: string
  description?: string
  acceptedTypes?: string
}

interface Emits {
  fileSelected: [file: File]
  fileDrop: [event: DragEvent]
}

const props = withDefaults(defineProps<Props>(), {
  selectedFile: null,
  progress: 0,
  placeholder: '',
  description: '',
  acceptedTypes: '*'
})

const emit = defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')

// 使用computed属性处理多语言文本
const placeholderText = computed(() => props.placeholder || t('send.uploadArea.placeholder'))
const descriptionText = computed(() => props.description || t('send.uploadArea.description'))
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  emit('fileDrop', event)
}
</script>