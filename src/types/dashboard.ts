export interface DashboardData {
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
  openUpload: number
  enableChunk: number
  maxSaveSeconds: number
  topSuffixes: DashboardSuffixStat[]
  recentFiles: DashboardRecentFile[]
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

export interface DashboardViewData extends DashboardData {
  hasExtendedStats: boolean
  storageUsedText: string
  yesterdaySizeText: string
  todaySizeText: string
  uploadSizeLimitText: string
  sysUptimeText: string
  activeRatio: number
  textRatio: number
  fileRatio: number
  todaySizeRatio: number
}
