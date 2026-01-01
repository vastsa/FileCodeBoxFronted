import { ref, computed, readonly } from 'vue'
import { PresignUploadService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import { FILE_SIZE_LIMITS, STORAGE_KEYS } from '@/constants'
import type {
  PresignUploadStatus,
  PresignUploadMode,
  PresignInitResponse,
  PresignUploadOptions,
  PresignStatusResponse,
  UploadProgress,
  ExpireStyle,
  ConfigState
} from '@/types'
import axios from 'axios'

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

// 预签名上传状态常量
export const PRESIGN_UPLOAD_STATUS = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  UPLOADING: 'uploading',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// 默认过期配置
const DEFAULT_EXPIRE_VALUE = 1
const DEFAULT_EXPIRE_STYLE: ExpireStyle = 'day'

/**
 * 预签名上传 Composable
 * 支持 S3 直传模式和服务器代理模式
 */
export function usePresignedUpload() {
  const alertStore = useAlertStore()

  // 状态管理
  const presignStatus = ref<PresignUploadStatus>(PRESIGN_UPLOAD_STATUS.IDLE)
  const uploadSession = ref<PresignInitResponse | null>(null)
  const uploadProgress = ref<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  })
  const uploadedCode = ref<string>('')
  const errorMessage = ref<string>('')

  // 计算属性
  const isInitializing = computed(() => presignStatus.value === PRESIGN_UPLOAD_STATUS.INITIALIZING)
  const isUploading = computed(() => presignStatus.value === PRESIGN_UPLOAD_STATUS.UPLOADING)
  const isConfirming = computed(() => presignStatus.value === PRESIGN_UPLOAD_STATUS.CONFIRMING)
  const isSuccess = computed(() => presignStatus.value === PRESIGN_UPLOAD_STATUS.SUCCESS)
  const isError = computed(() => presignStatus.value === PRESIGN_UPLOAD_STATUS.ERROR)
  const currentMode = computed<PresignUploadMode | null>(() => uploadSession.value?.mode ?? null)


  /**
   * 文件大小验证
   */
  const validateFileSize = (file: File): boolean => {
    const maxFileSize = getMaxFileSize()
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / 1024 / 1024)
      errorMessage.value = `文件大小不能超过 ${maxSizeMB}MB`
      alertStore.showAlert(errorMessage.value, 'error')
      return false
    }
    return true
  }

  /**
   * 进度追踪回调
   */
  const createProgressHandler = (
    externalHandler?: (progress: UploadProgress) => void
  ): ((progress: UploadProgress) => void) => {
    return (progress: UploadProgress) => {
      // 确保进度值在有效范围内
      uploadProgress.value = {
        loaded: Math.max(0, progress.loaded),
        total: Math.max(0, progress.total),
        percentage: Math.min(100, Math.max(0, progress.percentage))
      }
      // 调用外部进度回调
      if (externalHandler) {
        externalHandler(uploadProgress.value)
      }
    }
  }

  /**
   * 错误处理
   */
  const handleUploadError = (error: unknown): void => {
    presignStatus.value = PRESIGN_UPLOAD_STATUS.ERROR

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const detail = error.response?.data?.detail

      switch (status) {
        case 400:
          errorMessage.value = detail || '请求参数错误'
          break
        case 403:
          errorMessage.value = detail || '操作被禁止'
          break
        case 404:
          errorMessage.value = '上传会话不存在或已过期'
          break
        case 500:
          errorMessage.value = '服务器错误，请稍后重试'
          break
        default:
          errorMessage.value = detail || '上传失败，请重试'
      }
    } else if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '未知错误'
    }

    alertStore.showAlert(errorMessage.value, 'error')
  }


  /**
   * 初始化上传会话
   */
  const initUploadSession = async (
    file: File,
    options?: PresignUploadOptions
  ): Promise<PresignInitResponse | null> => {
    try {
      presignStatus.value = PRESIGN_UPLOAD_STATUS.INITIALIZING

      const response = await PresignUploadService.initUpload({
        file_name: file.name,
        file_size: file.size,
        expire_value: options?.expireValue ?? DEFAULT_EXPIRE_VALUE,
        expire_style: options?.expireStyle ?? DEFAULT_EXPIRE_STYLE
      })

      if (response.code === 200 && response.detail) {
        uploadSession.value = response.detail
        return response.detail
      } else {
        throw new Error(response.message || '初始化上传失败')
      }
    } catch (error) {
      handleUploadError(error)
      return null
    }
  }

  /**
   * 直传模式上传到 S3
   */
  const uploadDirect = async (
    file: File,
    session: PresignInitResponse,
    options?: PresignUploadOptions
  ): Promise<string | null> => {
    try {
      presignStatus.value = PRESIGN_UPLOAD_STATUS.UPLOADING

      // 上传到 S3
      const progressHandler = createProgressHandler(options?.onProgress)
      const uploadSuccess = await PresignUploadService.directUploadToS3(
        session.upload_url,
        file,
        progressHandler
      )

      if (!uploadSuccess) {
        throw new Error('S3 上传失败')
      }

      // 确认上传
      presignStatus.value = PRESIGN_UPLOAD_STATUS.CONFIRMING
      const confirmResponse = await PresignUploadService.confirmUpload(session.upload_id, {
        expire_value: options?.expireValue ?? DEFAULT_EXPIRE_VALUE,
        expire_style: options?.expireStyle ?? DEFAULT_EXPIRE_STYLE
      })

      if (confirmResponse.code === 200 && confirmResponse.detail?.code) {
        presignStatus.value = PRESIGN_UPLOAD_STATUS.SUCCESS
        uploadedCode.value = String(confirmResponse.detail.code)
        // 确保进度为 100%
        uploadProgress.value = {
          loaded: file.size,
          total: file.size,
          percentage: 100
        }
        alertStore.showAlert('文件上传成功！', 'success')
        return uploadedCode.value
      } else {
        throw new Error(confirmResponse.message || '确认上传失败')
      }
    } catch (error) {
      handleUploadError(error)
      return null
    }
  }


  /**
   * 代理模式上传
   */
  const uploadProxy = async (
    file: File,
    session: PresignInitResponse,
    options?: PresignUploadOptions
  ): Promise<string | null> => {
    try {
      presignStatus.value = PRESIGN_UPLOAD_STATUS.UPLOADING

      const progressHandler = createProgressHandler(options?.onProgress)
      const response = await PresignUploadService.proxyUpload(
        session.upload_id,
        file,
        progressHandler
      )

      if (response.code === 200 && response.detail?.code) {
        presignStatus.value = PRESIGN_UPLOAD_STATUS.SUCCESS
        uploadedCode.value = String(response.detail.code)
        // 确保进度为 100%
        uploadProgress.value = {
          loaded: file.size,
          total: file.size,
          percentage: 100
        }
        alertStore.showAlert('文件上传成功！', 'success')
        return uploadedCode.value
      } else {
        throw new Error(response.message || '代理上传失败')
      }
    } catch (error) {
      handleUploadError(error)
      return null
    }
  }

  /**
   * 上传文件（主入口方法）
   * 根据 mode 自动选择直传或代理上传
   */
  const uploadFile = async (
    file: File,
    options?: PresignUploadOptions
  ): Promise<string | null> => {
    // 重置状态
    reset()

    // 验证文件大小
    if (!validateFileSize(file)) {
      presignStatus.value = PRESIGN_UPLOAD_STATUS.ERROR
      return null
    }

    // 初始化上传会话
    const session = await initUploadSession(file, options)
    if (!session) {
      return null
    }

    // 根据模式选择上传方式
    if (session.mode === 'direct') {
      return await uploadDirect(file, session, options)
    } else {
      return await uploadProxy(file, session, options)
    }
  }


  /**
   * 取消上传
   */
  const cancelUpload = async (): Promise<void> => {
    if (!uploadSession.value?.upload_id) {
      return
    }

    try {
      await PresignUploadService.cancelUpload(uploadSession.value.upload_id)
      alertStore.showAlert('上传已取消', 'info')
    } catch (error) {
      // 取消失败时静默处理，因为会话可能已过期
      console.warn('取消上传失败:', error)
    } finally {
      reset()
    }
  }

  /**
   * 获取上传状态
   */
  const getStatus = async (): Promise<PresignStatusResponse | null> => {
    if (!uploadSession.value?.upload_id) {
      return null
    }

    try {
      const response = await PresignUploadService.getUploadStatus(uploadSession.value.upload_id)
      if (response.code === 200 && response.detail) {
        // 检查会话是否过期
        if (response.detail.is_expired) {
          errorMessage.value = '上传会话已过期'
          alertStore.showAlert(errorMessage.value, 'warning')
        }
        return response.detail
      }
      return null
    } catch (error) {
      handleUploadError(error)
      return null
    }
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    presignStatus.value = PRESIGN_UPLOAD_STATUS.IDLE
    uploadSession.value = null
    uploadProgress.value = {
      loaded: 0,
      total: 0,
      percentage: 0
    }
    uploadedCode.value = ''
    errorMessage.value = ''
  }

  return {
    // 状态 (只读)
    presignStatus: readonly(presignStatus),
    uploadSession: readonly(uploadSession),
    uploadProgress: readonly(uploadProgress),
    uploadedCode: readonly(uploadedCode),
    errorMessage: readonly(errorMessage),

    // 计算属性
    isInitializing,
    isUploading,
    isConfirming,
    isSuccess,
    isError,
    currentMode,

    // 方法
    uploadFile,
    cancelUpload,
    getStatus,
    reset
  }
}
