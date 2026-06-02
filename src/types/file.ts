export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  uploadTime: string
  downloadCount: number
  expireTime?: string
}

export interface FileListItem {
  id: number
  code: string
  prefix: string
  suffix: string
  size: number
  text?: string
  description?: string
  expired_at: string | null
  expired_count: number | null
  created_at: string
  name?: string
  type?: 'text' | 'file'
  status?: 'active' | 'expired'
  isText?: boolean
  is_text?: boolean
  isExpired?: boolean
  is_expired?: boolean
  isChunked?: boolean
  is_chunked?: boolean
  remainingDownloads?: number | null
  remaining_downloads?: number | null
  usedCount?: number
  used_count?: number
  fileHash?: string | null
  file_hash?: string | null
}

export interface AdminFileViewItem extends FileListItem {
  displayName: string
  displaySize: string
  displayExpiredAt: string
  displayUsage: string
  isTextFile: boolean
  isExpiredFile: boolean
  isChunkedFile: boolean
  remainingDownloadsValue: number | null
  canPreviewText: boolean
}

export interface AdminFileSummary {
  totalFiles: number
  activeCount: number
  expiredCount: number
  textCount: number
  fileCount: number
  chunkedCount: number
  storageUsed: number
  usedCount: number
}

export type AdminFileStatusFilter = 'all' | 'active' | 'expired'
export type AdminFileTypeFilter = 'all' | 'file' | 'text' | 'chunked'
export type AdminFileSortBy = 'created_at' | 'expired_at' | 'name' | 'size' | 'used_count' | 'code'
export type AdminFileSortOrder = 'asc' | 'desc'

export interface AdminFileListParams {
  page: number
  size: number
  keyword?: string
  status?: AdminFileStatusFilter
  type?: AdminFileTypeFilter
  sortBy?: AdminFileSortBy
  sortOrder?: AdminFileSortOrder
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
  summary?: AdminFileSummary
}

export interface AdminFilePreviewResponse {
  id: number
  code: string
  name: string
  type: 'text'
  content: string
  length: number
  previewLength?: number
  preview_length?: number
  truncated: boolean
  maxChars?: number
  max_chars?: number
  createdAt?: string | null
  created_at?: string | null
  expiredAt?: string | null
  expired_at?: string | null
}

export interface FileUploadResponse {
  code: string
  name: string
}

export interface TextSendResponse {
  code: string
}

export interface ShareSelectResponse {
  code: string
  name: string
  text: string
  size: number
  type?: 'file' | 'text'
  is_text?: boolean
  content?: string | null
  download_url?: string | null
  created_at?: string | null
  expired_at?: string | null
  expires_at?: string | null
  expired_count?: number | null
  used_count?: number
  remaining_downloads?: number | null
}

export interface ShareMetadataResponse {
  code: string
  name: string
  size: number
  type: 'file' | 'text'
  is_text: boolean
  created_at?: string | null
  expired_at?: string | null
  expires_at?: string | null
  expired_count?: number | null
  used_count?: number
  remaining_downloads?: number | null
}

export interface ReceivedFileRecord {
  id: number
  code: string
  filename: string
  size: string
  downloadUrl: string | null
  content: string | null
  date: string
  type?: 'file' | 'text'
  remainingDownloads?: number | null
}

export interface SentFileRecord {
  id: number
  filename: string
  date: string
  size: string
  expiration: string
  retrieveCode: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ChunkUploadInitRequest {
  file_name: string
  file_size: number
  chunk_size: number
  file_hash: string
}

export interface ChunkUploadInitResponse {
  code?: string
  name?: string
  upload_id?: string
  existed?: boolean
  uploaded_chunks?: number[]
}

export interface ChunkUploadCompleteRequest {
  expire_value: number
  expire_style: string
}

export type ChunkUploadResponse = null
