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
  expired_at: string
  expired_count: number | null
  created_at: string
}

export interface AdminFileViewItem extends FileListItem {
  displaySize: string
  displayExpiredAt: string
  canPreviewText: boolean
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
