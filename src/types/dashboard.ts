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
  topSuffixes?: DashboardSuffixStat[]
  recentFiles?: DashboardRecentFile[]
  recentActivities?: DashboardActivity[]
  recent_activities?: DashboardActivity[]
  operationalInsights?: DashboardOperationalInsight[]
  operational_insights?: DashboardOperationalInsight[]
  insights?: DashboardOperationalInsight[]
  maintenanceQueue?: DashboardMaintenanceQueue
  maintenance_queue?: DashboardMaintenanceQueue
  maintenanceItems?: DashboardMaintenanceQueueItem[]
  maintenance_items?: DashboardMaintenanceQueueItem[]
  maintenanceSummary?: Partial<DashboardMaintenanceQueueSummary>
  maintenance_summary?: Partial<DashboardMaintenanceQueueSummary>
}

export interface DashboardSuffixStat {
  suffix: string
  count: number
}

export interface DashboardRecentFile {
  id: number
  code: string
  name: string
  suffix: string
  size: number
  text: boolean
  expiredAt: string | null
  expiredCount: number
  usedCount: number
  createdAt: string | null
  isExpired: boolean
}

export interface DashboardActivity {
  id: string
  action: string
  targetType?: string
  target_type?: string
  targetId?: string | number | null
  target_id?: string | number | null
  targetName?: string
  target_name?: string
  count: number
  meta?: Record<string, unknown>
  createdAt?: string | null
  created_at?: string | null
}

export interface DashboardActivityViewItem extends DashboardActivity {
  targetTypeValue: string
  targetNameValue: string
  createdAtValue: string | null
}

export interface DashboardActivityOption {
  value: string
  label?: string
  count: number
}

export interface DashboardActivityFilters {
  action?: string
  targetType?: string
  target_type?: string
  keyword?: string
}

export interface DashboardActivitiesParams {
  limit?: number
  action?: string
  targetType?: string
  target_type?: string
  keyword?: string
}

export interface DashboardActivitiesResponse {
  activities?: DashboardActivity[]
  items?: DashboardActivity[]
  total?: number
  storedTotal?: number
  stored_total?: number
  limit?: number
  filters?: DashboardActivityFilters
  actionOptions?: DashboardActivityOption[]
  action_options?: DashboardActivityOption[]
  targetTypeOptions?: DashboardActivityOption[]
  target_type_options?: DashboardActivityOption[]
}

export type DashboardInsightSeverity = 'danger' | 'warning' | 'success' | 'neutral'

export interface DashboardMaintenanceQueueAction {
  type?: string
  actionType?: string
  action_type?: string
  health?: AdminFileHealthFilter | string | null
  targetHealth?: AdminFileHealthFilter | string | null
  target_health?: AdminFileHealthFilter | string | null
  suggestedAction?: string
  suggested_action?: string
}

export interface DashboardMaintenanceQueueItem {
  key: string
  severity: DashboardInsightSeverity | string
  category?: string
  priority?: number
  count: number
  action?: DashboardMaintenanceQueueAction
  actionType?: string
  action_type?: string
  suggestedAction?: string
  suggested_action?: string
  targetHealth?: AdminFileHealthFilter | string | null
  target_health?: AdminFileHealthFilter | string | null
}

export interface DashboardMaintenanceQueueSummary {
  total: number
  actionableCount: number
  actionable_count?: number
  dangerCount: number
  danger_count?: number
  warningCount: number
  warning_count?: number
  successCount: number
  success_count?: number
  neutralCount: number
  neutral_count?: number
  fileQueueCount: number
  file_queue_count?: number
  settingsCount: number
  settings_count?: number
  strongestSeverity: DashboardInsightSeverity
  strongest_severity?: DashboardInsightSeverity
}

export interface DashboardMaintenanceQueue {
  items?: DashboardMaintenanceQueueItem[]
  maintenanceItems?: DashboardMaintenanceQueueItem[]
  maintenance_items?: DashboardMaintenanceQueueItem[]
  summary?: Partial<DashboardMaintenanceQueueSummary>
  maintenanceSummary?: Partial<DashboardMaintenanceQueueSummary>
  maintenance_summary?: Partial<DashboardMaintenanceQueueSummary>
}

export interface DashboardMaintenanceQueueViewItem extends DashboardMaintenanceQueueItem {
  severity: DashboardInsightSeverity
  priority: number
  actionTypeValue: string
  suggestedActionValue: string
  targetHealthValue: AdminFileHealthFilter | string | null
}

export interface DashboardOperationalInsightAction {
  type?: string
  actionType?: string
  action_type?: string
  health?: AdminFileHealthFilter | string | null
  targetHealth?: AdminFileHealthFilter | string | null
  target_health?: AdminFileHealthFilter | string | null
}

export interface DashboardOperationalInsight {
  key: string
  severity: DashboardInsightSeverity | string
  priority?: number
  count: number
  action?: DashboardOperationalInsightAction
  actionType?: string
  action_type?: string
  targetHealth?: AdminFileHealthFilter | string | null
  target_health?: AdminFileHealthFilter | string | null
}

export interface DashboardOperationalInsightViewItem extends DashboardOperationalInsight {
  severity: DashboardInsightSeverity
  priority: number
  actionTypeValue: string
  targetHealthValue: AdminFileHealthFilter | string | null
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
  | 'topSuffixes'
  | 'recentFiles'
  | 'recentActivities'
  | 'recent_activities'
  | 'operationalInsights'
  | 'operational_insights'
  | 'insights'
  | 'maintenanceQueue'
  | 'maintenance_queue'
  | 'maintenanceItems'
  | 'maintenance_items'
  | 'maintenanceSummary'
  | 'maintenance_summary'
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
    topSuffixes: DashboardSuffixStat[]
    recentFiles: DashboardRecentFile[]
    recentActivities: DashboardActivityViewItem[]
    operationalInsights: DashboardOperationalInsightViewItem[]
    maintenanceItems: DashboardMaintenanceQueueViewItem[]
    maintenanceSummary: DashboardMaintenanceQueueSummary
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
