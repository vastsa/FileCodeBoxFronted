<template>
  <div
    class="group relative flex min-h-[10rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all duration-300 sm:min-h-[12rem] sm:p-8"
    :class="[
      isDarkMode
        ? 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-600'
        : 'bg-white border-slate-200 hover:border-zinc-400',
      isDragActive
        ? isDarkMode
          ? 'border-zinc-500 bg-white/5 shadow-lg shadow-white/5'
          : 'border-zinc-400 bg-zinc-100/80 shadow-lg shadow-zinc-200'
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
        :class="[isDarkMode ? 'border-white/15 bg-white/5' : 'border-zinc-300 bg-zinc-100/80']"
      ></div>
    </div>

    <div class="absolute inset-0 w-full h-full" v-if="progress > 0">
      <BorderProgressBar :progress="progress" />
    </div>

    <!-- 上传状态图标 -->
    <component
      :is="statusIcon"
      :class="[
        'relative z-10 h-14 w-14 transition-colors duration-300 sm:h-16 sm:w-16',
        statusIconClass
      ]"
    />

    <!-- 文件名或占位文本 -->
    <p
      :class="[
        'relative z-10 mt-3 w-full text-center text-sm transition-colors duration-300 sm:mt-4',
        isDarkMode
          ? 'text-zinc-400 group-hover:text-zinc-100'
          : 'text-slate-600 group-hover:text-zinc-950'
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
        :class="[isDarkMode ? 'bg-zinc-800/80 text-zinc-200' : 'bg-slate-100 text-slate-700']"
      >
        {{ file.name }}
      </span>
      <span
        v-if="selectedFiles.length > 3"
        class="rounded-full px-3 py-1 text-xs"
        :class="[isDarkMode ? 'bg-white/10 text-zinc-100' : 'bg-zinc-100 text-zinc-700']"
      >
        +{{ selectedFiles.length - 3 }}
      </span>
    </div>

    <!-- 进度详情（上传中显示） -->
    <div
      v-if="isUploading && showProgressDetails && totalBytes > 0"
      class="relative z-10 mt-3 w-full"
    >
      <div
        class="flex justify-between text-xs mb-1"
        :class="[isDarkMode ? 'text-zinc-400' : 'text-slate-500']"
      >
        <span>{{ formatBytes(uploadedBytes) }} / {{ formatBytes(totalBytes) }}</span>
        <span v-if="uploadSpeed > 0">{{ formatBytes(uploadSpeed) }}/s</span>
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
          ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
          : 'bg-zinc-800 text-white hover:bg-zinc-900'
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
  /** 上传速度，单位 bytes/s */
  uploadSpeed?: number
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
  uploadSpeed: 0,
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
    return isDarkMode.value ? 'text-zinc-100 animate-spin' : 'text-zinc-900 animate-spin'
  }
  if (isSuccess.value) {
    return isDarkMode.value ? 'text-zinc-100' : 'text-zinc-900'
  }
  if (hasError.value) {
    return isDarkMode.value ? 'text-red-400' : 'text-red-600'
  }
  return isDarkMode.value
    ? 'text-zinc-400 group-hover:text-zinc-100'
    : 'text-slate-600 group-hover:text-zinc-950'
})

const statusClass = computed(() => {
  if (hasError.value) {
    return isDarkMode.value ? 'border-red-500/50' : 'border-red-300'
  }
  if (isSuccess.value) {
    return isDarkMode.value ? 'border-zinc-500/70' : 'border-zinc-300'
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
    return isDarkMode.value ? 'text-zinc-200' : 'text-zinc-700'
  }
  return isDarkMode.value ? 'text-zinc-500' : 'text-slate-400'
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
