import type { AdminFileHealthFilter } from './file'

/** 视图模型：dashboard 页面内部展示状态（camel 为前端自有命名）。 */
export interface DashboardHealthSummary {
  healthAttentionCount: number
  healthDangerCount: number
  healthWarningCount: number
  expiringSoonCount: number
  storageIssueCount: number
  neverRetrievedCount: number
  healthyCount: number
  permanentCount: number
}

/** API 形状：/admin/dashboard 响应（snake_case，与后端 D7 对齐）。 */
export interface DashboardData {
  total_files: number
  storage_used: number | string
  yesterday_count: number
  today_count: number
  yesterday_size: number | string
  today_size: number | string
  sys_uptime: number | null
  active_count?: number
  expired_count?: number
  text_count?: number
  file_count?: number
  chunked_count?: number
  used_count?: number
  storage_backend?: string
  upload_size_limit?: number
  open_upload?: number
  enable_chunk?: number
  max_save_seconds?: number
  health_attention_count?: number
  health_danger_count?: number
  health_warning_count?: number
  expiring_soon_count?: number
  storage_issue_count?: number
  never_retrieved_count?: number
  healthy_count?: number
  permanent_count?: number
}

export type DashboardViewData = {
  hasExtendedStats: boolean
  totalFiles: number
  storageUsed: number
  yesterdayCount: number
  todayCount: number
  yesterdaySize: number
  todaySize: number
  sysUptime: number | null
  activeCount: number
  expiredCount: number
  textCount: number
  fileCount: number
  chunkedCount: number
  usedCount: number
  storageBackend: string
  uploadSizeLimit: number
  open_upload: number
  enable_chunk: number
  maxSaveSeconds: number
  storageUsedText: string
  yesterdaySizeText: string
  todaySizeText: string
  uploadSizeLimitText: string
  sysUptimeText: string
  activeRatio: number
  textRatio: number
  fileRatio: number
  healthyRatio: number
  healthAttentionRatio: number
  todaySizeRatio: number
} & DashboardHealthSummary

export interface DashboardHealthAction {
  key: string
  label: string
  description: string
  count: number
  health: AdminFileHealthFilter
  tone: 'danger' | 'warning' | 'success' | 'neutral'
}
