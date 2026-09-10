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
  open_upload: 0,
  enable_chunk: 0,
  maxSaveSeconds: 0,
  healthAttentionCount: 0,
  healthDangerCount: 0,
  healthWarningCount: 0,
  expiringSoonCount: 0,
  storageIssueCount: 0,
  neverRetrievedCount: 0,
  healthyCount: 0,
  permanentCount: 0,
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
    detail.health_attention_count
  ),
  healthDangerCount: toNumber(detail.health_danger_count),
  healthWarningCount: toNumber(
    detail.health_warning_count
  ),
  expiringSoonCount: toNumber(detail.expiring_soon_count),
  storageIssueCount: toNumber(detail.storage_issue_count),
  neverRetrievedCount: toNumber(
    detail.never_retrieved_count
  ),
  healthyCount: toNumber(detail.healthy_count),
  permanentCount: toNumber(detail.permanent_count)
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
      dashboardData.totalFiles = toNumber(detail.total_files)
      dashboardData.storageUsed = toNumber(detail.storage_used)
      dashboardData.yesterdayCount = toNumber(detail.yesterday_count)
      dashboardData.todayCount = toNumber(detail.today_count)
      dashboardData.yesterdaySize = toNumber(detail.yesterday_size)
      dashboardData.todaySize = toNumber(detail.today_size)
      dashboardData.sysUptime = detail.sys_uptime
      dashboardData.hasExtendedStats = hasOwn(detail, 'active_count')
      dashboardData.activeCount = dashboardData.hasExtendedStats
        ? toNumber(detail.active_count)
        : dashboardData.totalFiles
      dashboardData.expiredCount = toNumber(detail.expired_count)
      dashboardData.textCount = toNumber(detail.text_count)
      dashboardData.fileCount = toNumber(detail.file_count)
      dashboardData.chunkedCount = toNumber(detail.chunked_count)
      dashboardData.usedCount = toNumber(detail.used_count)
      dashboardData.storageBackend = detail.storage_backend || '-'
      dashboardData.uploadSizeLimit = toNumber(detail.upload_size_limit)
      dashboardData.open_upload = toNumber(detail.open_upload)
      dashboardData.enable_chunk = toNumber(detail.enable_chunk)
      dashboardData.maxSaveSeconds = toNumber(detail.max_save_seconds)
      const healthSummary = normalizeHealthSummary(detail)
      healthSummaryKeys.forEach((key) => {
        dashboardData[key] = healthSummary[key]
      })

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
