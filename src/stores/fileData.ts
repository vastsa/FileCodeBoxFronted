import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileInfo, UploadProgress, UploadStatus } from '@/types'
import { UPLOAD_STATUS } from '@/constants'

export const useFileDataStore = defineStore('fileData', () => {
  // 上传相关状态
  const uploadStatus = ref<UploadStatus>(UPLOAD_STATUS.IDLE)
  const uploadProgress = ref<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  })
  const uploadedCode = ref('')
  const currentFile = ref<File | null>(null)
  
  // 下载相关状态
  const downloadCode = ref('')
  const fileInfo = ref<FileInfo | null>(null)
  const isDownloading = ref(false)
  
  // 文件列表状态（管理页面使用）
  const fileList = ref<FileInfo[]>([])
  const totalFiles = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const isLoadingList = ref(false)
  
  // 接收数据状态（取件记录）
  const receiveData = ref<Array<{
    id: number
    code: string
    filename: string
    size: string
    downloadUrl: string | null
    content: string | null
    date: string
  }>>([])
  
  // 分享数据状态（发送记录）
  const shareData = ref<Array<{
    id: number
    filename: string
    date: string
    size: string
    expiration: string
    retrieveCode: string
  }>>([])
  
  // 计算属性
  const isUploading = computed(() => uploadStatus.value === UPLOAD_STATUS.UPLOADING)
  const isUploadSuccess = computed(() => uploadStatus.value === UPLOAD_STATUS.SUCCESS)
  const isUploadError = computed(() => uploadStatus.value === UPLOAD_STATUS.ERROR)
  const hasFileInfo = computed(() => fileInfo.value !== null)
  const canDownload = computed(() => hasFileInfo.value && !isDownloading.value)
  
  const totalPages = computed(() => {
    return Math.ceil(totalFiles.value / pageSize.value)
  })
  
  // 上传相关方法
  const setUploadStatus = (status: UploadStatus) => {
    uploadStatus.value = status
  }
  
  const setUploadProgress = (progress: UploadProgress) => {
    uploadProgress.value = progress
  }
  
  const setUploadedCode = (code: string) => {
    uploadedCode.value = code
  }
  
  const setCurrentFile = (file: File | null) => {
    currentFile.value = file
  }
  
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
  
  // 下载相关方法
  const setDownloadCode = (code: string) => {
    downloadCode.value = code
  }
  
  const setFileInfo = (info: FileInfo | null) => {
    fileInfo.value = info
  }
  
  const setDownloading = (loading: boolean) => {
    isDownloading.value = loading
  }
  
  const resetDownload = () => {
    downloadCode.value = ''
    fileInfo.value = null
    isDownloading.value = false
  }
  
  // 文件列表相关方法
  const setFileList = (files: FileInfo[]) => {
    fileList.value = files
  }
  
  const addFile = (file: FileInfo) => {
    fileList.value.unshift(file)
    totalFiles.value += 1
  }
  
  const removeFile = (fileId: string) => {
    const index = fileList.value.findIndex(file => file.id === fileId)
    if (index > -1) {
      fileList.value.splice(index, 1)
      totalFiles.value -= 1
    }
  }
  
  const updateFile = (fileId: string, updates: Partial<FileInfo>) => {
    const index = fileList.value.findIndex(file => file.id === fileId)
    if (index > -1) {
      fileList.value[index] = { ...fileList.value[index], ...updates }
    }
  }
  
  const setTotalFiles = (total: number) => {
    totalFiles.value = total
  }
  
  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }
  
  const setPageSize = (size: number) => {
    pageSize.value = size
  }
  
  const setLoadingList = (loading: boolean) => {
    isLoadingList.value = loading
  }
  
  const resetFileList = () => {
    fileList.value = []
    totalFiles.value = 0
    currentPage.value = 1
    isLoadingList.value = false
  }

  // 添加分享数据方法
  const addShareData = (data: { code: string; name?: string }) => {
    setUploadedCode(data.code)
    if (data.name) {
      // 如果有文件名，可以创建一个临时的 FileInfo 对象
      const fileInfo: FileInfo = {
        id: data.code,
        name: data.name,
        size: 0,
        type: '',
        uploadTime: new Date().toISOString(),
        downloadCount: 0
      }
      addFile(fileInfo)
    }
   }

  // 接收数据相关方法
  const addReceiveData = (data: {
    id: number
    code: string
    filename: string
    size: string
    downloadUrl: string | null
    content: string | null
    date: string
  }) => {
    receiveData.value.push(data)
  }

  const removeReceiveData = (id: number) => {
    const index = receiveData.value.findIndex(item => item.id === id)
    if (index > -1) {
      receiveData.value.splice(index, 1)
    }
  }
  
  const deleteReceiveData = (index: number) => {
    if (index > -1 && index < receiveData.value.length) {
      receiveData.value.splice(index, 1)
    }
  }

  const clearReceiveData = () => {
    receiveData.value = []
  }
  
  // 分享数据相关方法
  const addShareDataRecord = (data: {
    id: number
    filename: string
    date: string
    size: string
    expiration: string
    retrieveCode: string
  }) => {
    shareData.value.push(data)
  }
  
  const deleteShareData = (index: number) => {
    if (index > -1 && index < shareData.value.length) {
      shareData.value.splice(index, 1)
    }
  }
  
  const clearShareData = () => {
    shareData.value = []
  }

  return {
    // 上传状态
    uploadStatus,
    uploadProgress,
    uploadedCode,
    currentFile,
    
    // 下载状态
    downloadCode,
    fileInfo,
    isDownloading,
    
    // 文件列表状态
    fileList,
    totalFiles,
    currentPage,
    pageSize,
    isLoadingList,
    
    // 计算属性
    isUploading,
    isUploadSuccess,
    isUploadError,
    hasFileInfo,
    canDownload,
    totalPages,
    
    // 上传方法
    setUploadStatus,
    setUploadProgress,
    setUploadedCode,
    setCurrentFile,
    resetUpload,
    
    // 下载方法
    setDownloadCode,
    setFileInfo,
    setDownloading,
    resetDownload,
    
    // 文件列表方法
    setFileList,
    addFile,
    removeFile,
    updateFile,
    setTotalFiles,
    setCurrentPage,
    setPageSize,
    setLoadingList,
    resetFileList,
    addShareData,
    
    // 接收数据状态和方法
    receiveData,
    addReceiveData,
    removeReceiveData,
    deleteReceiveData,
    clearReceiveData,
    
    // 分享数据状态和方法
    shareData,
    addShareDataRecord,
    deleteShareData,
    clearShareData
  }
})
