<template>
  <div
    class="rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 group cursor-pointer relative"
    :class="[
      isDarkMode
        ? 'bg-gray-800 bg-opacity-50 border-gray-600 hover:border-indigo-500'
        : 'bg-gray-100 border-gray-300 hover:border-indigo-500',
      statusClass
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
      :disabled="isUploading"
    />
    <div class="absolute inset-0 w-full h-full" v-if="progress > 0">
      <BorderProgressBar :progress="progress" />
    </div>

    <!-- 上传状态图标 -->
    <component
      :is="statusIcon"
      :class="['w-16 h-16 transition-colors duration-300', statusIconClass]"
    />

    <!-- 文件名或占位文本 -->
    <p
      :class="[
        'mt-4 text-sm transition-colors duration-300 w-full text-center',
        isDarkMode
          ? 'text-gray-400 group-hover:text-indigo-400'
          : 'text-gray-600 group-hover:text-indigo-600'
      ]"
    >
      <span class="block truncate">
        {{ displayText }}
      </span>
    </p>

    <!-- 状态描述或默认描述 -->
    <p :class="['mt-2 text-xs', statusDescriptionClass]">
      {{ statusDescription }}
    </p>

    <!-- 进度详情（上传中显示） -->
    <div v-if="isUploading && showProgressDetails" class="mt-3 w-full">
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
      {{ retryText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-vue-next'
import BorderProgressBar from './BorderProgressBar.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type UploadStatusType = 'idle' | 'uploading' | 'success' | 'error' | 'initializing' | 'confirming'

interface Props {
  selectedFile?: File | null
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
  fileDrop: [event: DragEvent]
  retry: []
}

const props = withDefaults(defineProps<Props>(), {
  selectedFile: null,
  progress: 0,
  placeholder: '',
  description: '',
  acceptedTypes: '*',
  uploadStatus: 'idle',
  uploadedBytes: 0,
  totalBytes: 0,
  errorMessage: '',
  allowRetry: true,
  retryText: '重试',
  showProgressDetails: true
})

const emit = defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')

// 使用computed属性处理多语言文本
const placeholderText = computed(() => props.placeholder || t('send.uploadArea.placeholder'))
const descriptionText = computed(() => props.description || t('send.uploadArea.description'))
const fileInput = ref<HTMLInputElement | null>(null)

const isUploading = computed(() => {
  return ['uploading', 'initializing', 'confirming'].includes(props.uploadStatus)
})

const hasError = computed(() => props.uploadStatus === 'error')

const isSuccess = computed(() => props.uploadStatus === 'success')

const displayText = computed(() => {
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
    return isDarkMode ? 'text-indigo-400 animate-spin' : 'text-indigo-600 animate-spin'
  }
  if (isSuccess.value) {
    return isDarkMode ? 'text-green-400' : 'text-green-600'
  }
  if (hasError.value) {
    return isDarkMode ? 'text-red-400' : 'text-red-600'
  }
  return isDarkMode
    ? 'text-gray-400 group-hover:text-indigo-400'
    : 'text-gray-600 group-hover:text-indigo-600'
})

const statusClass = computed(() => {
  if (hasError.value) {
    return isDarkMode ? 'border-red-500/50' : 'border-red-300'
  }
  if (isSuccess.value) {
    return isDarkMode ? 'border-green-500/50' : 'border-green-300'
  }
  return ''
})

const statusDescription = computed(() => {
  if (hasError.value && props.errorMessage) {
    return props.errorMessage
  }
  if (props.uploadStatus === 'initializing') {
    return '正在初始化上传...'
  }
  if (props.uploadStatus === 'uploading') {
    return '正在上传文件...'
  }
  if (props.uploadStatus === 'confirming') {
    return '正在确认上传...'
  }
  if (isSuccess.value) {
    return '上传成功！'
  }
  return descriptionText.value
})

const statusDescriptionClass = computed(() => {
  if (hasError.value) {
    return isDarkMode ? 'text-red-400' : 'text-red-500'
  }
  if (isSuccess.value) {
    return isDarkMode ? 'text-green-400' : 'text-green-500'
  }
  return isDarkMode ? 'text-gray-500' : 'text-gray-400'
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

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
  // 重置 input 值，允许选择同名文件
  target.value = ''
}

const handleFileDrop = (event: DragEvent) => {
  // 上传中不允许拖放
  if (isUploading.value) return
  emit('fileDrop', event)
}

const handleRetry = () => {
  emit('retry')
}
</script>
