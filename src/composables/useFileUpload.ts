import { ref, computed, readonly } from 'vue'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { usePresignedUpload } from '@/composables/usePresignedUpload'
import type { UploadProgress, UploadStatus, PresignUploadOptions, ExpireStyle, ConfigState } from '@/types'
import { UPLOAD_STATUS, FILE_SIZE_LIMITS, STORAGE_KEYS } from '@/constants'

/**
 * 获取最大文件大小限制（字节）
 * 优先从后端配置获取，否则使用默认值
 */
function getMaxFileSize(): number {
  try {
    const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (configStr) {
      const config = JSON.parse(configStr) as Partial<ConfigState>
      if (config.uploadSize && config.uploadSize > 0) {
        // uploadSize 单位是字节
        return config.uploadSize
      }
    }
  } catch {
    // 解析失败时使用默认值
  }
  return FILE_SIZE_LIMITS.MAX_FILE_SIZE
}

export interface FileUploadOptions {
  /** 是否使用预签名上传，默认 false 保持向后兼容 */
  usePresigned?: boolean
  /** 过期时间值 */
  expireValue?: number
  /** 过期时间类型 */
  expireStyle?: ExpireStyle
  /** 进度回调 */
  onProgress?: (progress: UploadProgress) => void
}

export function useFileUpload(options?: { defaultUsePresigned?: boolean }) {
  const alertStore = useAlertStore()
  
  // 预签名上传 composable
  const presignedUpload = usePresignedUpload()
  
  // 是否默认使用预签名上传
  const defaultUsePresigned = options?.defaultUsePresigned ?? false
  
  // 状态管理
  const uploadStatus = ref<UploadStatus>(UPLOAD_STATUS.IDLE)
  const uploadProgress = ref<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  })
  const uploadedCode = ref<string>('')
  const currentFile = ref<File | null>(null)
  
  // 当前是否使用预签名上传
  const isUsingPresigned = ref<boolean>(false)
  
  // 计算属性
  const isUploading = computed(() => {
    if (isUsingPresigned.value) {
      return presignedUpload.isUploading.value || presignedUpload.isInitializing.value || presignedUpload.isConfirming.value
    }
    return uploadStatus.value === UPLOAD_STATUS.UPLOADING
  })
  const isSuccess = computed(() => {
    if (isUsingPresigned.value) {
      return presignedUpload.isSuccess.value
    }
    return uploadStatus.value === UPLOAD_STATUS.SUCCESS
  })
  const isError = computed(() => {
    if (isUsingPresigned.value) {
      return presignedUpload.isError.value
    }
    return uploadStatus.value === UPLOAD_STATUS.ERROR
  })
  const isIdle = computed(() => {
    if (isUsingPresigned.value) {
      return presignedUpload.presignStatus.value === 'idle'
    }
    return uploadStatus.value === UPLOAD_STATUS.IDLE
  })
  
  // 文件验证
  const validateFile = (file: File): boolean => {
    const maxFileSize = getMaxFileSize()
    if (file.size > maxFileSize) {
      alertStore.showAlert(
        `文件大小不能超过 ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        'error'
      )
      return false
    }
    return true
  }
  
  /**
   * 上传文件（支持预签名上传和传统上传）
   */
  const uploadFile = async (file: File, uploadOptions?: FileUploadOptions): Promise<string | null> => {
    const shouldUsePresigned = uploadOptions?.usePresigned ?? defaultUsePresigned
    
    if (!validateFile(file)) {
      return null
    }
    
    // 记录当前使用的上传方式
    isUsingPresigned.value = shouldUsePresigned
    currentFile.value = file
    
    if (shouldUsePresigned) {
      // 使用预签名上传
      return await uploadFileWithPresigned(file, uploadOptions)
    } else {
      // 使用传统上传方式
      return await uploadFileTraditional(file, uploadOptions?.onProgress)
    }
  }
  
  /**
   * 传统上传方式
   */
  const uploadFileTraditional = async (
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string | null> => {
    try {
      uploadStatus.value = UPLOAD_STATUS.UPLOADING
      uploadedCode.value = ''
      
      const response = await FileService.uploadFile(file, (progress) => {
        uploadProgress.value = progress
        onProgress?.(progress)
      })
      
      if (response.code === 200 && response.detail?.code) {
        uploadStatus.value = UPLOAD_STATUS.SUCCESS
        uploadedCode.value = String(response.detail.code)
        alertStore.showAlert('文件上传成功！', 'success')
        return String(response.detail.code)
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      uploadStatus.value = UPLOAD_STATUS.ERROR
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      alertStore.showAlert(errorMessage, 'error')
      return null
    }
  }
  
  /**
   * 预签名上传方式
   */
  const uploadFileWithPresigned = async (
    file: File,
    uploadOptions?: FileUploadOptions
  ): Promise<string | null> => {
    // 构建预签名上传选项
    const presignOptions: PresignUploadOptions = {
      expireValue: uploadOptions?.expireValue,
      expireStyle: uploadOptions?.expireStyle,
      onProgress: (progress) => {
        // 同步进度到本 composable 的状态
        uploadProgress.value = progress
        uploadOptions?.onProgress?.(progress)
      }
    }
    
    const result = await presignedUpload.uploadFile(file, presignOptions)
    
    if (result) {
      // 同步预签名上传的结果到本 composable 的状态
      uploadedCode.value = result
      uploadStatus.value = UPLOAD_STATUS.SUCCESS
    } else {
      uploadStatus.value = UPLOAD_STATUS.ERROR
    }
    
    return result
  }
  
  // 上传文本
  const uploadText = async (text: string): Promise<string | null> => {
    if (!text.trim()) {
      alertStore.showAlert('请输入要发送的文本内容', 'warning')
      return null
    }
    
    try {
      uploadStatus.value = UPLOAD_STATUS.UPLOADING
      uploadedCode.value = ''
      
      const response = await FileService.uploadText(text)
      
      if (response.code === 200 && response.detail?.code) {
        uploadStatus.value = UPLOAD_STATUS.SUCCESS
        uploadedCode.value = String(response.detail.code)
        alertStore.showAlert('文本发送成功！', 'success')
        return String(response.detail.code)
      } else {
        throw new Error(response.message || '发送失败')
      }
    } catch (error) {
      uploadStatus.value = UPLOAD_STATUS.ERROR
      const errorMessage = error instanceof Error ? error.message : '发送失败'
      alertStore.showAlert(errorMessage, 'error')
      return null
    }
  }
  
  // 重置状态
  const resetUpload = () => {
    uploadStatus.value = UPLOAD_STATUS.IDLE
    uploadProgress.value = {
      loaded: 0,
      total: 0,
      percentage: 0
    }
    uploadedCode.value = ''
    currentFile.value = null
    
    // 如果使用预签名上传，也重置预签名状态
    if (isUsingPresigned.value) {
      presignedUpload.reset()
    }
    isUsingPresigned.value = false
  }
  
  /**
   * 取消上传
   */
  const cancelUpload = async (): Promise<void> => {
    if (isUsingPresigned.value) {
      await presignedUpload.cancelUpload()
    }
    resetUpload()
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  return {
    // 状态
    uploadStatus: readonly(uploadStatus),
    uploadProgress: readonly(uploadProgress),
    uploadedCode: readonly(uploadedCode),
    currentFile: readonly(currentFile),
    isUsingPresigned: readonly(isUsingPresigned),
    
    // 预签名上传相关状态（透传）
    presignStatus: presignedUpload.presignStatus,
    uploadSession: presignedUpload.uploadSession,
    currentMode: presignedUpload.currentMode,
    presignErrorMessage: presignedUpload.errorMessage,
    
    // 计算属性
    isUploading,
    isSuccess,
    isError,
    isIdle,
    
    // 预签名上传计算属性（透传）
    isInitializing: presignedUpload.isInitializing,
    isConfirming: presignedUpload.isConfirming,
    
    // 方法
    uploadFile,
    uploadText,
    resetUpload,
    cancelUpload,
    validateFile,
    formatFileSize,
    
    // 预签名上传方法（透传）
    getPresignStatus: presignedUpload.getStatus
  }
}