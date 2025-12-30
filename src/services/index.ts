// API 服务层
import api from '@/utils/api'
import axios from 'axios'
import type { ApiResponse, FileInfo, ConfigState, AdminUser, FileUploadResponse, TextSendResponse, DashboardData, FileListResponse, FileEditForm } from '@/types'
import type { UploadProgress, PresignInitRequest, PresignInitResponse, PresignConfirmRequest, PresignUploadResult, PresignStatusResponse } from '@/types'

// 系统配置服务
export class ConfigService {
  static async getConfig(): Promise<ApiResponse<ConfigState>> {
    return api.get('/admin/config/get')
  }
  static async getUserConfig(): Promise<ApiResponse<ConfigState>> {
    return api.post('/')
  }
  static async updateConfig(config: Partial<ConfigState>): Promise<ApiResponse> {
    return api.patch('/admin/config/update', config)
  }
}

// 文件服务
export class FileService {
  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/share/file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
          onProgress(progress)
        }
      }
    })
  }

  static async uploadText(text: string): Promise<ApiResponse<TextSendResponse>> {
    return api.post('/share/text/', { content: text })
  }

  static async getFile(code: string): Promise<ApiResponse<FileInfo>> {
    return api.get(`/file/${code}`)
  }

  static async downloadFile(code: string): Promise<Blob> {
    const response = await api.get(`/download/${code}`, {
      responseType: 'blob'
    })
    return response.data
  }

  static async deleteFile(fileId: string): Promise<ApiResponse> {
    return api.post('/admin/file/delete', { id: fileId })
  }

  static async getFileList(page = 1, limit = 10): Promise<ApiResponse<{
    files: FileInfo[]
    total: number
    page: number
    limit: number
  }>> {
    return api.get('/admin/file/list', {
      params: { page, size: limit }
    })
  }

  // 文件管理相关方法
  static async getAdminFileList(params: { page: number; size: number; keyword?: string }): Promise<ApiResponse<FileListResponse>> {
    return api.get('/admin/file/list', { params })
  }

  static async updateFile(data: FileEditForm): Promise<ApiResponse> {
    return api.patch('/admin/file/update', data)
  }

  static async deleteAdminFile(id: number): Promise<ApiResponse> {
    return api.delete('/admin/file/delete', {
      data: { id }
    })
  }

  static async downloadAdminFile(id: number): Promise<{ data: Blob; headers: Record<string, string> }> {
    return api.get('/admin/file/download', {
      params: { id },
      responseType: 'blob'
    })
  }
}

// 认证服务
export class AuthService {
  static async login(password: string): Promise<ApiResponse<AdminUser>> {
    return api.post('/admin/login', { password })
  }

  static async logout(): Promise<ApiResponse> {
    return api.post('/admin/logout')
  }

  static async verifyToken(): Promise<ApiResponse<AdminUser>> {
    return api.get('/admin/verify')
  }
}

// 统计服务
export class StatsService {
  static async getDashboardStats(): Promise<ApiResponse<{
    totalFiles: number
    totalDownloads: number
    todayUploads: number
    todayDownloads: number
    storageUsed: number
    recentFiles: FileInfo[]
  }>> {
    return api.get('/admin/dashboard')
  }

  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get('/admin/dashboard')
  }
}

// 预签名上传服务
export class PresignUploadService {
  /**
   * 初始化上传会话
   */
  static async initUpload(request: PresignInitRequest): Promise<ApiResponse<PresignInitResponse>> {
    return api.post('/presign/upload/init', request)
  }

  /**
   * 代理模式上传
   */
  static async proxyUpload(
    uploadId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<PresignUploadResult>> {
    const formData = new FormData()
    formData.append('file', file)

    return api.put(`/presign/upload/proxy/${uploadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
          onProgress(progress)
        }
      }
    })
  }

  /**
   * 确认直传上传
   */
  static async confirmUpload(
    uploadId: string,
    request?: PresignConfirmRequest
  ): Promise<ApiResponse<PresignUploadResult>> {
    return api.post(`/presign/upload/confirm/${uploadId}`, request || {})
  }

  /**
   * 查询上传状态
   */
  static async getUploadStatus(uploadId: string): Promise<ApiResponse<PresignStatusResponse>> {
    return api.get(`/presign/upload/status/${uploadId}`)
  }

  /**
   * 取消上传
   */
  static async cancelUpload(uploadId: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete(`/presign/upload/${uploadId}`)
  }

  /**
   * S3 直传（不经过后端）
   */
  static async directUploadToS3(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<boolean> {
    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
            onProgress(progress)
          }
        }
      })
      return true
    } catch {
      return false
    }
  }
}

// 导出所有服务
export const services = {
  config: ConfigService,
  file: FileService,
  auth: AuthService,
  stats: StatsService,
  presignUpload: PresignUploadService
}

export default services