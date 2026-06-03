<template>
  <div
    class="rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 group cursor-pointer relative min-h-72 overflow-hidden"
    :class="[
      isDarkMode
        ? 'bg-gray-800/60 border-gray-600 hover:border-indigo-400'
        : 'bg-white/80 border-gray-300 hover:border-indigo-500',
      isDragActive
        ? isDarkMode
          ? 'border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-900/30'
          : 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
        : '',
      statusClass
    ]"
    role="button"
    tabindex="0"
    :aria-busy="isUploading"
    @click="triggerFileUpload"
    @keydown.enter.prevent="triggerFileUpload"
    @keydown.space.prevent="triggerFileUpload"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleFileDrop"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileUpload"
      :accept="acceptedTypes"
      :disabled="isUploading"
      multiple
    />
    <div
      class="absolute inset-0 opacity-0 transition-opacity duration-300"
      :class="[isDragActive ? 'opacity-100' : '']"
    >
      <div
        class="absolute inset-3 rounded-2xl border"
        :class="[
          isDarkMode ? 'border-indigo-300/30 bg-indigo-400/5' : 'border-indigo-300 bg-indigo-50/80'
        ]"
      ></div>
    </div>

    <div class="absolute inset-0 w-full h-full" v-if="progress > 0">
      <BorderProgressBar :progress="progress" />
    </div>

    <!-- 上传状态图标 -->
    <component
      :is="statusIcon"
      :class="['relative z-10 w-16 h-16 transition-colors duration-300', statusIconClass]"
    />

    <!-- 文件名或占位文本 -->
    <p
      :class="[
        'relative z-10 mt-4 text-sm transition-colors duration-300 w-full text-center',
        isDarkMode
          ? 'text-gray-400 group-hover:text-indigo-400'
          : 'text-gray-600 group-hover:text-indigo-600'
      ]"
    >
      <span v-if="selectedFiles && selectedFiles.length > 1" class="block">
        <span v-for="(f, i) in selectedFiles" :key="i" class="block truncate">{{ f.name }}</span>
      </span>
      <span v-else class="block truncate">
        {{ displayText }}
      </span>
    </p>

    <!-- 状态描述或默认描述 -->
    <p :class="['relative z-10 mt-2 text-xs text-center leading-5', statusDescriptionClass]">
      {{ statusDescription }}
    </p>

    <div
      v-if="selectedFiles.length > 1"
      class="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-2"
    >
      <span
        v-for="file in selectedFiles.slice(0, 3)"
        :key="`${file.name}-${file.size}`"
        class="max-w-40 truncate rounded-full px-3 py-1 text-xs"
        :class="[isDarkMode ? 'bg-gray-700/80 text-gray-200' : 'bg-gray-100 text-gray-700']"
      >
        {{ file.name }}
      </span>
      <span
        v-if="selectedFiles.length > 3"
        class="rounded-full px-3 py-1 text-xs"
        :class="[isDarkMode ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700']"
      >
        +{{ selectedFiles.length - 3 }}
      </span>
    </div>

    <!-- 进度详情（上传中显示） -->
    <div v-if="isUploading && showProgressDetails" class="relative z-10 mt-3 w-full">
      <div
        class="flex justify-between text-xs mb-1"
        :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
      >
        <span>{{ formatBytes(uploadedBytes) }} / {{ formatBytes(totalBytes) }}</span>
        <span>{{ progress }}%</span>
      </div>
    </div>

    <!-- 错误重试按钮 -->
    <button
      v-if="hasError && allowRetry"
      @click.stop="handleRetry"
      class="mt-3 px-4 py-2 text-sm rounded-lg transition-colors duration-200"
      :class="[
        isDarkMode
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      ]"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-vue-next'
import BorderProgressBar from './BorderProgressBar.vue'
import { useI18n } from 'vue-i18n'
import { useInjectedDarkMode } from '@/composables'

const { t } = useI18n()

type UploadStatusType = 'idle' | 'uploading' | 'success' | 'error' | 'initializing' | 'confirming'

interface Props {
  selectedFile?: File | null
  selectedFiles?: File[]
  progress?: number
  placeholder?: string
  description?: string
  acceptedTypes?: string
  /** 上传状态 */
  uploadStatus?: UploadStatusType
  /** 已上传字节数 */
  uploadedBytes?: number
  /** 总字节数 */
  totalBytes?: number
  /** 错误消息 */
  errorMessage?: string
  /** 是否允许重试 */
  allowRetry?: boolean
  /** 重试按钮文本 */
  retryText?: string
  /** 是否显示进度详情 */
  showProgressDetails?: boolean
}

interface Emits {
  fileSelected: [file: File]
  filesSelected: [files: File[]]
  fileDrop: [event: DragEvent]
  retry: []
}

const props = withDefaults(defineProps<Props>(), {
  selectedFile: null,
  selectedFiles: () => [],
  progress: 0,
  placeholder: '',
  description: '',
  acceptedTypes: '*',
  uploadStatus: 'idle',
  uploadedBytes: 0,
  totalBytes: 0,
  errorMessage: '',
  allowRetry: true,
  retryText: '',
  showProgressDetails: true
})

const emit = defineEmits<Emits>()

const isDarkMode = useInjectedDarkMode()

// 使用computed属性处理多语言文本
const placeholderText = computed(() => props.placeholder || t('send.uploadArea.placeholder'))
const descriptionText = computed(() => props.description || t('send.uploadArea.description'))
const retryLabel = computed(() => props.retryText || t('send.uploadArea.retry'))
const fileInput = ref<HTMLInputElement | null>(null)
const isDragActive = ref(false)

const isUploading = computed(() => {
  return ['uploading', 'initializing', 'confirming'].includes(props.uploadStatus)
})

const hasError = computed(() => props.uploadStatus === 'error')

const isSuccess = computed(() => props.uploadStatus === 'success')

const displayText = computed(() => {
  if (props.selectedFiles && props.selectedFiles.length === 1) {
    return props.selectedFiles[0].name
  }
  if (props.selectedFiles && props.selectedFiles.length > 1) {
    return t('send.uploadArea.selectedFiles', { count: props.selectedFiles.length })
  }
  if (props.selectedFile) {
    return props.selectedFile.name
  }
  return placeholderText.value
})

const statusIcon = computed(() => {
  if (isUploading.value) return LoaderIcon
  if (isSuccess.value) return CheckCircleIcon
  if (hasError.value) return XCircleIcon
  return UploadCloudIcon
})

const statusIconClass = computed(() => {
  if (isUploading.value) {
    return isDarkMode.value ? 'text-indigo-400 animate-spin' : 'text-indigo-600 animate-spin'
  }
  if (isSuccess.value) {
    return isDarkMode.value ? 'text-green-400' : 'text-green-600'
  }
  if (hasError.value) {
    return isDarkMode.value ? 'text-red-400' : 'text-red-600'
  }
  return isDarkMode.value
    ? 'text-gray-400 group-hover:text-indigo-400'
    : 'text-gray-600 group-hover:text-indigo-600'
})

const statusClass = computed(() => {
  if (hasError.value) {
    return isDarkMode.value ? 'border-red-500/50' : 'border-red-300'
  }
  if (isSuccess.value) {
    return isDarkMode.value ? 'border-green-500/50' : 'border-green-300'
  }
  return ''
})

const statusDescription = computed(() => {
  if (hasError.value && props.errorMessage) {
    return props.errorMessage
  }
  if (props.uploadStatus === 'initializing') {
    return t('send.uploadArea.status.initializing')
  }
  if (props.uploadStatus === 'uploading') {
    return t('send.uploadArea.status.uploading')
  }
  if (props.uploadStatus === 'confirming') {
    return t('send.uploadArea.status.confirming')
  }
  if (isSuccess.value) {
    return t('send.uploadArea.status.success')
  }
  return descriptionText.value
})

const statusDescriptionClass = computed(() => {
  if (hasError.value) {
    return isDarkMode.value ? 'text-red-400' : 'text-red-500'
  }
  if (isSuccess.value) {
    return isDarkMode.value ? 'text-green-400' : 'text-green-500'
  }
  return isDarkMode.value ? 'text-gray-500' : 'text-gray-400'
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const triggerFileUpload = () => {
  // 上传中或成功状态下不允许重新选择文件
  if (isUploading.value) return
  fileInput.value?.click()
}

const handleDragEnter = () => {
  if (isUploading.value) return
  isDragActive.value = true
}

const handleDragOver = () => {
  if (isUploading.value) return
  isDragActive.value = true
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as Node | null
  if (!relatedTarget || !target.contains(relatedTarget)) {
    isDragActive.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    if (files.length === 1) {
      emit('fileSelected', files[0])
    } else {
      emit('filesSelected', Array.from(files))
    }
  }
  // 重置 input 值，允许选择同名文件
  target.value = ''
}

const handleFileDrop = (event: DragEvent) => {
  // 上传中不允许拖放
  isDragActive.value = false
  if (isUploading.value) return
  emit('fileDrop', event)
}

const handleRetry = () => {
  emit('retry')
}
</script>
