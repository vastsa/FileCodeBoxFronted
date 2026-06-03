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

export type ConfigDiagnosticSeverity = 'danger' | 'warning' | 'success' | 'neutral'

export interface ConfigDiagnosticAction {
  type?: string
  field?: keyof ConfigState | string | null
  fields?: string[]
  category?: string
}

export interface ConfigDiagnosticItem {
  key: string
  severity: ConfigDiagnosticSeverity | string
  category: string
  priority?: number
  count?: number
  field?: keyof ConfigState | string | null
  fields?: string[]
  action?: ConfigDiagnosticAction
  actionType?: string
  action_type?: string
  targetField?: keyof ConfigState | string | null
  target_field?: keyof ConfigState | string | null
}

export interface ConfigDiagnosticSummary {
  total: number
  dangerCount: number
  danger_count?: number
  warningCount: number
  warning_count?: number
  successCount: number
  success_count?: number
  neutralCount: number
  neutral_count?: number
  strongestSeverity: ConfigDiagnosticSeverity
  strongest_severity?: ConfigDiagnosticSeverity
}

export interface ConfigDiagnosticsResponse {
  items?: ConfigDiagnosticItem[]
  diagnosticItems?: ConfigDiagnosticItem[]
  diagnostic_items?: ConfigDiagnosticItem[]
  summary?: Partial<ConfigDiagnosticSummary>
  diagnosticSummary?: Partial<ConfigDiagnosticSummary>
  diagnostic_summary?: Partial<ConfigDiagnosticSummary>
}

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
  diagnostics?: ConfigDiagnosticsResponse
  diagnosticItems?: ConfigDiagnosticItem[]
  diagnostic_items?: ConfigDiagnosticItem[]
  diagnosticSummary?: Partial<ConfigDiagnosticSummary>
  diagnostic_summary?: Partial<ConfigDiagnosticSummary>
}
