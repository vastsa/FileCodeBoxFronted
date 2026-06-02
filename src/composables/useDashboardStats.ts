import { computed, ref, reactive } from 'vue'
import { StatsService } from '@/services'
import type { DashboardData, DashboardHealthSummary, DashboardViewData } from '@/types'
import { formatFileSize, getErrorMessage } from '@/utils/common'

type UseDashboardStatsOptions = {
  loadFailedMessage?: string
}

const emptyDashboardData = (): DashboardViewData => ({
  hasExtendedStats: false,
  totalFiles: 0,
  storageUsed: 0,
  yesterdayCount: 0,
  todayCount: 0,
  yesterdaySize: 0,
  todaySize: 0,
  sysUptime: null,
  activeCount: 0,
  expiredCount: 0,
  textCount: 0,
  fileCount: 0,
  chunkedCount: 0,
  usedCount: 0,
  storageBackend: '-',
  uploadSizeLimit: 0,
  openUpload: 0,
  enableChunk: 0,
  maxSaveSeconds: 0,
  healthAttentionCount: 0,
  healthDangerCount: 0,
  healthWarningCount: 0,
  expiringSoonCount: 0,
  storageIssueCount: 0,
  neverRetrievedCount: 0,
  healthyCount: 0,
  permanentCount: 0,
  topSuffixes: [],
  recentFiles: [],
  storageUsedText: '0 Bytes',
  yesterdaySizeText: '0 Bytes',
  todaySizeText: '0 Bytes',
  uploadSizeLimitText: '0 Bytes',
  sysUptimeText: '-',
  activeRatio: 0,
  textRatio: 0,
  fileRatio: 0,
  healthyRatio: 0,
  healthAttentionRatio: 0,
  todaySizeRatio: 0
})

const toNumber = (value: number | string | null | undefined) => Number(value || 0)

const clampRatio = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key)

const formatDuration = (startTimestamp: number | null) => {
  if (!startTimestamp) return '-'
  const uptime = Date.now() - startTimestamp
  const days = Math.floor(uptime / (24 * 60 * 60 * 1000))
  const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${days}天${hours}小时`
}

const normalizeRecentFiles = (recentFiles: DashboardViewData['recentFiles']) =>
  recentFiles.map((file) => ({
    ...file,
    size: toNumber(file.size),
    expiredCount: toNumber(file.expiredCount),
    usedCount: toNumber(file.usedCount)
  }))

const healthSummaryKeys: (keyof DashboardHealthSummary)[] = [
  'healthAttentionCount',
  'healthDangerCount',
  'healthWarningCount',
  'expiringSoonCount',
  'storageIssueCount',
  'neverRetrievedCount',
  'healthyCount',
  'permanentCount'
]

const normalizeHealthSummary = (detail: DashboardData): DashboardHealthSummary => ({
  healthAttentionCount: toNumber(
    detail.healthSummary?.healthAttentionCount ?? detail.healthAttentionCount
  ),
  healthDangerCount: toNumber(detail.healthSummary?.healthDangerCount ?? detail.healthDangerCount),
  healthWarningCount: toNumber(
    detail.healthSummary?.healthWarningCount ?? detail.healthWarningCount
  ),
  expiringSoonCount: toNumber(detail.healthSummary?.expiringSoonCount ?? detail.expiringSoonCount),
  storageIssueCount: toNumber(detail.healthSummary?.storageIssueCount ?? detail.storageIssueCount),
  neverRetrievedCount: toNumber(
    detail.healthSummary?.neverRetrievedCount ?? detail.neverRetrievedCount
  ),
  healthyCount: toNumber(detail.healthSummary?.healthyCount ?? detail.healthyCount),
  permanentCount: toNumber(detail.healthSummary?.permanentCount ?? detail.permanentCount)
})

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const dashboardData = reactive<DashboardViewData>(emptyDashboardData())
  const isLoading = ref(false)
  const errorMessage = ref('')
  const lastUpdatedAt = ref<Date | null>(null)
  const lastUpdatedText = computed(() =>
    lastUpdatedAt.value ? lastUpdatedAt.value.toLocaleString() : '-'
  )

  const fetchDashboardData = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await StatsService.getDashboard()
      if (!response.detail) {
        throw new Error('No dashboard data')
      }

      const detail = response.detail
      dashboardData.totalFiles = toNumber(detail.totalFiles)
      dashboardData.storageUsed = toNumber(detail.storageUsed)
      dashboardData.yesterdayCount = toNumber(detail.yesterdayCount)
      dashboardData.todayCount = toNumber(detail.todayCount)
      dashboardData.yesterdaySize = toNumber(detail.yesterdaySize)
      dashboardData.todaySize = toNumber(detail.todaySize)
      dashboardData.sysUptime = detail.sysUptime
      dashboardData.hasExtendedStats = hasOwn(detail, 'activeCount')
      dashboardData.activeCount = dashboardData.hasExtendedStats
        ? toNumber(detail.activeCount)
        : dashboardData.totalFiles
      dashboardData.expiredCount = toNumber(detail.expiredCount)
      dashboardData.textCount = toNumber(detail.textCount)
      dashboardData.fileCount = toNumber(detail.fileCount)
      dashboardData.chunkedCount = toNumber(detail.chunkedCount)
      dashboardData.usedCount = toNumber(detail.usedCount)
      dashboardData.storageBackend = detail.storageBackend || '-'
      dashboardData.uploadSizeLimit = toNumber(detail.uploadSizeLimit)
      dashboardData.openUpload = toNumber(detail.openUpload)
      dashboardData.enableChunk = toNumber(detail.enableChunk)
      dashboardData.maxSaveSeconds = toNumber(detail.maxSaveSeconds)
      const healthSummary = normalizeHealthSummary(detail)
      healthSummaryKeys.forEach((key) => {
        dashboardData[key] = healthSummary[key]
      })
      dashboardData.topSuffixes = detail.topSuffixes || []
      dashboardData.recentFiles = normalizeRecentFiles(detail.recentFiles || [])

      dashboardData.storageUsedText = formatFileSize(dashboardData.storageUsed)
      dashboardData.yesterdaySizeText = formatFileSize(dashboardData.yesterdaySize)
      dashboardData.todaySizeText = formatFileSize(dashboardData.todaySize)
      dashboardData.uploadSizeLimitText = formatFileSize(dashboardData.uploadSizeLimit)
      dashboardData.sysUptimeText = formatDuration(dashboardData.sysUptime)
      dashboardData.activeRatio = dashboardData.totalFiles
        ? clampRatio((dashboardData.activeCount / dashboardData.totalFiles) * 100)
        : 0
      dashboardData.textRatio = dashboardData.totalFiles
        ? clampRatio((dashboardData.textCount / dashboardData.totalFiles) * 100)
        : 0
      dashboardData.fileRatio = dashboardData.totalFiles
        ? clampRatio((dashboardData.fileCount / dashboardData.totalFiles) * 100)
        : 0
      dashboardData.healthyRatio = dashboardData.totalFiles
        ? clampRatio((dashboardData.healthyCount / dashboardData.totalFiles) * 100)
        : 0
      dashboardData.healthAttentionRatio = dashboardData.totalFiles
        ? clampRatio((dashboardData.healthAttentionCount / dashboardData.totalFiles) * 100)
        : 0
      dashboardData.todaySizeRatio = dashboardData.uploadSizeLimit
        ? clampRatio((dashboardData.todaySize / dashboardData.uploadSizeLimit) * 100)
        : 0
      lastUpdatedAt.value = new Date()
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        options.loadFailedMessage || 'Failed to load dashboard data'
      )
    } finally {
      isLoading.value = false
    }
  }

  return {
    dashboardData,
    errorMessage,
    fetchDashboardData,
    isLoading,
    lastUpdatedText
  }
}
