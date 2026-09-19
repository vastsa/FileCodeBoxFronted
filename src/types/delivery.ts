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
  /** 管理侧备注与标签仅用于检索和识别，不影响寄件授权。 */
  note?: string
  tags?: string[]
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
  note?: string
  tags?: string[]
}

/** 寄件管理列表的后端筛选参数，全部使用明确的 all 表示未筛选。 */
export interface DeliveryCodeFilters {
  keyword: string
  status: 'all' | 'active' | 'disabled' | 'expired' | 'exhausted'
  storage_type: 'all' | 'system' | 'local' | 's3' | 'webdav'
  tag: string
  sort_by: 'created_at' | 'expires_at' | 'name' | 'code' | 'used_count' | 'max_uploads'
  sort_order: 'asc' | 'desc'
}

/** 单条更新允许省略未改的口令，保证历史超长口令仍可保留。 */
export interface UpdateDeliveryCode extends Partial<Omit<CreateDeliveryCode, 'code'>> {
  code?: string
}

export interface DeliveryBatchRequest {
  ids: number[]
  action: 'enable' | 'disable' | 'delete' | 'update'
  expires_at?: string
  max_uploads?: number
}
export interface DeliveryList<T> {
  items: T[]
  total: number
}
