import { ref, computed, readonly } from 'vue'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { UploadProgress, UploadStatus } from '@/types'
import { UPLOAD_STATUS, FILE_SIZE_LIMITS } from '@/constants'

export function useFileUpload() {
  const alertStore = useAlertStore()
  
  // 状态管理
  const uploadStatus = ref<UploadStatus>(UPLOAD_STATUS.IDLE)
  const uploadProgress = ref<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  })
  const uploadedCode = ref<string>('')
  const currentFile = ref<File | null>(null)
  
  // 计算属性
  const isUploading = computed(() => uploadStatus.value === UPLOAD_STATUS.UPLOADING)
  const isSuccess = computed(() => uploadStatus.value === UPLOAD_STATUS.SUCCESS)
  const isError = computed(() => uploadStatus.value === UPLOAD_STATUS.ERROR)
  const isIdle = computed(() => uploadStatus.value === UPLOAD_STATUS.IDLE)
  
  // 文件验证
  const validateFile = (file: File): boolean => {
    if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
      alertStore.showAlert(
        `文件大小不能超过 ${Math.round(FILE_SIZE_LIMITS.MAX_FILE_SIZE / 1024 / 1024)}MB`,
        'error'
      )
      return false
    }
    return true
  }
  
  // 上传文件
  const uploadFile = async (file: File): Promise<string | null> => {
    if (!validateFile(file)) {
      return null
    }
    
    try {
      uploadStatus.value = UPLOAD_STATUS.UPLOADING
      currentFile.value = file
      uploadedCode.value = ''
      
      const response = await FileService.uploadFile(file, (progress) => {
        uploadProgress.value = progress
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
    
    // 计算属性
    isUploading,
    isSuccess,
    isError,
    isIdle,
    
    // 方法
    uploadFile,
    uploadText,
    resetUpload,
    validateFile,
    formatFileSize
  }
}