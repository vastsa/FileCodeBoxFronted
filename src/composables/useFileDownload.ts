import { ref, computed } from 'vue'
import { FileService } from '@/services'
import { useAlertStore } from '@/stores/alertStore'
import type { FileInfo } from '@/types'
import { saveAs } from 'file-saver'

export function useFileDownload() {
  const alertStore = useAlertStore()
  
  // 状态管理
  const isLoading = ref(false)
  const fileInfo = ref<FileInfo | null>(null)
  const downloadCode = ref('')
  
  // 计算属性
  const hasFileInfo = computed(() => fileInfo.value !== null)
  const canDownload = computed(() => hasFileInfo.value && !isLoading.value)
  
  // 获取文件信息
  const getFileInfo = async (code: string): Promise<FileInfo | null> => {
    if (!code.trim()) {
      alertStore.showAlert('请输入取件码', 'warning')
      return null
    }
    
    try {
      isLoading.value = true
      downloadCode.value = code
      
      const response = await FileService.getFile(code)
      
      if (response.code === 200 && response.detail) {
        fileInfo.value = response.detail
        return response.detail
      } else {
        throw new Error(response.message || '文件不存在或已过期')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取文件信息失败'
      alertStore.showAlert(errorMessage, 'error')
      fileInfo.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // 下载文件
  const downloadFile = async (code?: string): Promise<boolean> => {
    const targetCode = code || downloadCode.value
    
    if (!targetCode.trim()) {
      alertStore.showAlert('请输入取件码', 'warning')
      return false
    }
    
    try {
      isLoading.value = true
      
      // 如果没有文件信息，先获取
      if (!fileInfo.value || downloadCode.value !== targetCode) {
        const info = await getFileInfo(targetCode)
        if (!info) {
          return false
        }
      }
      
      const blob = await FileService.downloadFile(targetCode)
      
      // 使用 file-saver 保存文件
      if (fileInfo.value?.name) {
        saveAs(blob, fileInfo.value.name)
        alertStore.showAlert('文件下载成功！', 'success')
        return true
      } else {
        throw new Error('文件名获取失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '下载失败'
      alertStore.showAlert(errorMessage, 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 重置状态
  const resetDownload = () => {
    isLoading.value = false
    fileInfo.value = null
    downloadCode.value = ''
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 格式化时间
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timeString
    }
  }
  
  // 检查文件是否过期
  const isFileExpired = computed(() => {
    if (!fileInfo.value?.expireTime) return false
    return new Date(fileInfo.value.expireTime) < new Date()
  })
  
  return {
    // 状态
    isLoading,
    fileInfo,
    downloadCode,
    
    // 计算属性
    hasFileInfo,
    canDownload,
    isFileExpired,
    
    // 方法
    getFileInfo,
    downloadFile,
    resetDownload,
    formatFileSize,
    formatTime
  }
}