import type { UploadProgress } from './file'

export type PresignUploadMode = 'direct' | 'proxy'

export type PresignUploadStatus =
  | 'idle'
  | 'initializing'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error'

export type ExpireStyle = 'day' | 'hour' | 'minute' | 'forever' | 'count'

export interface PresignInitRequest {
  file_name: string
  file_size: number
  expire_value?: number
  expire_style?: ExpireStyle
}

export interface PresignInitResponse {
  upload_id: string
  upload_url: string
  mode: PresignUploadMode
  expires_in: number
}

export interface PresignConfirmRequest {
  expire_value?: number
  expire_style?: ExpireStyle
}

export interface PresignUploadResult {
  code: string
  name: string
}

export interface PresignStatusResponse {
  upload_id: string
  file_name: string
  file_size: number
  mode: PresignUploadMode
  created_at: string
  expires_at: string
  is_expired: boolean
}

export interface PresignUploadOptions {
  expireValue?: number
  expireStyle?: ExpireStyle
  onProgress?: (progress: UploadProgress) => void
}
