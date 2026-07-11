export interface SystemConfig {
  name: string
  description?: string
  maxFileSize: number
  allowedFileTypes: string[]
  expireDays: number
  notify_title?: string
  notify_content?: string
}

export interface ThemeChoice {
  key: string
  name: string
  author: string
  version: string
}

export interface PublicConfigMeta {
  version?: string
  api?: Record<string, string>
  features?: Record<string, unknown>
  limits?: Record<string, unknown>
}

export interface PublicConfigPayload {
  config: Partial<ConfigState>
  meta?: PublicConfigMeta
}

export interface ConfigState {
  name: string
  description: string
  file_storage: string
  themesChoices: ThemeChoice[]
  expireStyle: string[]
  code_generate_type: 'number' | 'secret'
  adminSessionExpire: number
  admin_token: string
  robotsText: string
  keywords: string
  notify_title: string
  notify_content: string
  openUpload: number
  uploadSize: number
  allowed_file_types: string[]
  allowedFileTypes?: string[]
  storage_path: string
  storageLimit: number
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
  s3_addressing_style: string
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
