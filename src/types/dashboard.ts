import type { AdminFileHealthFilter } from './file'

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

export interface DashboardData {
  totalFiles: number
  storageUsed: number | string
  yesterdayCount: number
  todayCount: number
  yesterdaySize: number | string
  todaySize: number | string
  sysUptime: number | null
  activeCount?: number
  expiredCount?: number
  textCount?: number
  fileCount?: number
  chunkedCount?: number
  usedCount?: number
  storageBackend?: string
  uploadSizeLimit?: number
  openUpload?: number
  enableChunk?: number
  maxSaveSeconds?: number
  healthAttentionCount?: number
  healthDangerCount?: number
  healthWarningCount?: number
  expiringSoonCount?: number
  storageIssueCount?: number
  neverRetrievedCount?: number
  healthyCount?: number
  permanentCount?: number
  healthSummary?: Partial<DashboardHealthSummary>
}

export type DashboardViewData = Omit<
  DashboardData,
  | keyof DashboardHealthSummary
  | 'activeCount'
  | 'expiredCount'
  | 'textCount'
  | 'fileCount'
  | 'chunkedCount'
  | 'usedCount'
  | 'storageBackend'
  | 'uploadSizeLimit'
  | 'openUpload'
  | 'enableChunk'
  | 'maxSaveSeconds'
  | 'storageUsed'
  | 'yesterdaySize'
  | 'todaySize'
> &
  DashboardHealthSummary & {
    hasExtendedStats: boolean
    activeCount: number
    expiredCount: number
    textCount: number
    fileCount: number
    chunkedCount: number
    usedCount: number
    storageBackend: string
    uploadSizeLimit: number
    openUpload: number
    enableChunk: number
    maxSaveSeconds: number
    storageUsed: number
    yesterdaySize: number
    todaySize: number
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
  }

export interface DashboardHealthAction {
  key: string
  label: string
  description: string
  count: number
  health: AdminFileHealthFilter
  tone: 'danger' | 'warning' | 'success' | 'neutral'
}
