// 通用类型定义
export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  detail?: T
}

// 文件相关类型
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  uploadTime: string
  downloadCount: number
  expireTime?: string
}

// 文件管理相关类型
export interface FileListItem {
  id: number
  code: string
  prefix: string
  suffix: string
  size: number
  text?: string
  description?: string
  expired_at: string
  expired_count: number | null
  created_at: string
}

export interface FileEditForm {
  id: number | null
  code: string
  prefix: string
  suffix: string
  expired_at: string
  expired_count: number | null
}

export interface FileListResponse {
  data: FileListItem[]
  total: number
  page: number
  size: number
}

// 文件上传响应类型
export interface FileUploadResponse {
  code: number
  name: string
}

// 文本发送响应类型
export interface TextSendResponse {
  code: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// 系统配置类型
export interface SystemConfig {
  name: string
  description?: string
  maxFileSize: number
  allowedFileTypes: string[]
  expireDays: number
  notify_title?: string
  notify_content?: string
}

// 主题选择项类型
export interface ThemeChoice {
  key: string
  name: string
  author: string
  version: string
}

// 完整的系统配置状态类型
export interface ConfigState {
  name: string
  description: string
  file_storage: string
  themesChoices: ThemeChoice[]
  expireStyle: string[]
  admin_token: string
  robotsText: string
  keywords: string
  notify_title: string
  notify_content: string
  openUpload: number
  uploadSize: number
  storage_path: string
  uploadMinute: number
  max_save_seconds: number
  opacity: number
  enableChunk: number
  s3_access_key_id: string
  background: string
  showAdminAddr: number
  page_explain: string
  s3_secret_access_key: string
  aws_session_token: string
  s3_signature_version: string
  s3_region_name: string
  s3_bucket_name: string
  s3_endpoint_url: string
  s3_hostname: string
  uploadCount: number
  errorMinute: number
  errorCount: number
  s3_proxy: number
  themesSelect: string
  webdav_url: string
  webdav_username: string
  webdav_password: string
}

// 系统配置API响应类型
export interface ConfigResponse {
  code: number
  message?: string
  detail?: ConfigState
}

// 用户相关类型
export interface AdminUser {
  id: string
  username: string
  token: string
}

// Dashboard 数据类型
export interface DashboardData {
  totalFiles: number
  storageUsed: number | string
  yesterdayCount: number
  todayCount: number
  yesterdaySize: number | string
  todaySize: number | string
  sysUptime: number | string
}

// 主题相关类型
export type ThemeMode = 'light' | 'dark' | 'system'

// 发送类型
export type SendType = 'file' | 'text'

// 警告类型
export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: number
  message: string
  type: AlertType
  progress: number
  duration: number
  startTime: number
}

// 文件上传状态
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

// 路由相关类型
export interface RouteConfig {
  path: string
  name: string
  component: () => Promise<{ default: object }>
  meta?: {
    requiresAuth?: boolean
    title?: string
  }
}