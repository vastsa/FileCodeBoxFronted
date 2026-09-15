/** 寄件接口独立于公开取件接口，避免误用下载权限或管理员凭证。 */
export interface DeliveryCode {
  // 旧版记录没有原文，允许为空并明确提示，不能伪造恢复值。
  code?: string | null
  id: number
  name: string
  storage_type: string
  target_path: string
  expires_at: string
  max_uploads: number
  used_count: number
  reserved_count: number
  remaining: number
  enabled: boolean
  deleted: boolean
  status: string
  created_at: string
}
export interface DeliveryFile {
  retrieval_code?: string | null
  expired_at?: string | null
  expired_count?: number | null
  id: number
  filename: string
  size: number
  status: string
  storage_type: string
  created_at: string
}
export interface DeliverySession {
  enable_chunk: number
  expire_style: string[]
  max_save_seconds: number
  token: string
  name: string
  remaining: number
  expires_at: string
  upload_size: number
  allowed_file_types: string[]
  expires_in: number
}
export interface CreateDeliveryCode {
  name: string
  code: string
  storage_type: string
  target_path: string
  expires_at: string
  max_uploads: number
}
export interface DeliveryList<T> {
  items: T[]
  total: number
}
