import { computed, ref, reactive } from 'vue'
import { StatsService } from '@/services'
import type {
  DashboardActivitiesParams,
  DashboardActivityOption,
  DashboardActivity,
  DashboardActivityViewItem,
  DashboardData,
  DashboardHealthSummary,
  DashboardInsightSeverity,
  DashboardMaintenanceQueue,
  DashboardMaintenanceQueueItem,
  DashboardMaintenanceQueueSummary,
  DashboardMaintenanceQueueViewItem,
  DashboardOperationalInsight,
  DashboardOperationalInsightViewItem,
  DashboardViewData
} from '@/types'
import { formatFileSize, getErrorMessage } from '@/utils/common'

type UseDashboardStatsOptions = {
  loadFailedMessage?: string
  activityLoadFailedMessage?: string
}

const activityTimelineLimit = 40

function emptyDashboardData(): DashboardViewData {
  return {
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
    recentActivities: [],
    operationalInsights: [],
    maintenanceItems: [],
    maintenanceSummary: emptyMaintenanceSummary(),
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
  }
}

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

const normalizeRecentActivities = (
  activities: DashboardActivity[] = []
): DashboardActivityViewItem[] =>
  activities
    .filter((activity) => activity && activity.id && activity.action)
    .map((activity) => ({
      ...activity,
      count: toNumber(activity.count) || 1,
      targetTypeValue: activity.targetType ?? activity.target_type ?? 'system',
      targetNameValue: activity.targetName ?? activity.target_name ?? '',
      createdAtValue: activity.createdAt ?? activity.created_at ?? null,
      meta: activity.meta && typeof activity.meta === 'object' ? activity.meta : {}
    }))

const normalizeActivityOptions = (
  options: DashboardActivityOption[] = []
): DashboardActivityOption[] =>
  options
    .filter((option) => option && option.value)
    .map((option) => ({
      value: option.value,
      label: option.label || option.value,
      count: toNumber(option.count)
    }))

const insightSeverities: DashboardInsightSeverity[] = ['danger', 'warning', 'success', 'neutral']

const normalizeInsightSeverity = (severity: string | undefined): DashboardInsightSeverity =>
  insightSeverities.includes(severity as DashboardInsightSeverity)
    ? (severity as DashboardInsightSeverity)
    : 'neutral'

const normalizeOperationalInsights = (
  insights: DashboardOperationalInsight[] = []
): DashboardOperationalInsightViewItem[] =>
  insights
    .filter((insight) => insight && insight.key)
    .map((insight) => {
      const action = insight.action && typeof insight.action === 'object' ? insight.action : {}
      const actionTypeValue =
        insight.actionType ??
        insight.action_type ??
        action.actionType ??
        action.action_type ??
        action.type ??
        'file_queue'
      const targetHealthValue =
        insight.targetHealth ??
        insight.target_health ??
        action.targetHealth ??
        action.target_health ??
        action.health ??
        null

      return {
        ...insight,
        count: toNumber(insight.count),
        priority: toNumber(insight.priority),
        severity: normalizeInsightSeverity(insight.severity),
        actionTypeValue,
        targetHealthValue
      }
    })

function emptyMaintenanceSummary(): DashboardMaintenanceQueueSummary {
  return {
    total: 0,
    actionableCount: 0,
    dangerCount: 0,
    warningCount: 0,
    successCount: 0,
    neutralCount: 0,
    fileQueueCount: 0,
    settingsCount: 0,
    strongestSeverity: 'success'
  }
}

const normalizeMaintenanceQueueItems = (
  items: DashboardMaintenanceQueueItem[] = []
): DashboardMaintenanceQueueViewItem[] =>
  items
    .filter((item) => item && item.key)
    .map((item) => {
      const action = item.action && typeof item.action === 'object' ? item.action : {}
      const actionTypeValue =
        item.actionType ??
        item.action_type ??
        action.actionType ??
        action.action_type ??
        action.type ??
        'file_queue'
      const targetHealthValue =
        item.targetHealth ??
        item.target_health ??
        action.targetHealth ??
        action.target_health ??
        action.health ??
        null
      const suggestedActionValue =
        item.suggestedAction ??
        item.suggested_action ??
        action.suggestedAction ??
        action.suggested_action ??
        'monitor'

      return {
        ...item,
        count: toNumber(item.count),
        priority: toNumber(item.priority),
        severity: normalizeInsightSeverity(item.severity),
        actionTypeValue,
        suggestedActionValue,
        targetHealthValue
      }
    })

const normalizeMaintenanceSummary = (
  summary: Partial<DashboardMaintenanceQueueSummary> | undefined,
  items: DashboardMaintenanceQueueViewItem[]
): DashboardMaintenanceQueueSummary => ({
  total: toNumber(summary?.total ?? items.length),
  actionableCount: toNumber(summary?.actionableCount ?? summary?.actionable_count),
  actionable_count: toNumber(summary?.actionableCount ?? summary?.actionable_count),
  dangerCount: toNumber(summary?.dangerCount ?? summary?.danger_count),
  danger_count: toNumber(summary?.dangerCount ?? summary?.danger_count),
  warningCount: toNumber(summary?.warningCount ?? summary?.warning_count),
  warning_count: toNumber(summary?.warningCount ?? summary?.warning_count),
  successCount: toNumber(summary?.successCount ?? summary?.success_count),
  success_count: toNumber(summary?.successCount ?? summary?.success_count),
  neutralCount: toNumber(summary?.neutralCount ?? summary?.neutral_count),
  neutral_count: toNumber(summary?.neutralCount ?? summary?.neutral_count),
  fileQueueCount: toNumber(summary?.fileQueueCount ?? summary?.file_queue_count),
  file_queue_count: toNumber(summary?.fileQueueCount ?? summary?.file_queue_count),
  settingsCount: toNumber(summary?.settingsCount ?? summary?.settings_count),
  settings_count: toNumber(summary?.settingsCount ?? summary?.settings_count),
  strongestSeverity: normalizeInsightSeverity(
    summary?.strongestSeverity ?? summary?.strongest_severity
  ),
  strongest_severity: normalizeInsightSeverity(
    summary?.strongestSeverity ?? summary?.strongest_severity
  )
})

const normalizeMaintenanceQueue = (
  detail: DashboardData | DashboardMaintenanceQueue
): Pick<DashboardViewData, 'maintenanceItems' | 'maintenanceSummary'> => {
  const source = detail as DashboardData & DashboardMaintenanceQueue
  const queue = source.maintenanceQueue ?? source.maintenance_queue ?? source
  const items = normalizeMaintenanceQueueItems(
    queue?.items ??
      queue?.maintenanceItems ??
      queue?.maintenance_items ??
      source.maintenanceItems ??
      source.maintenance_items ??
      []
  )
  const rawSummary =
    queue?.summary ??
    queue?.maintenanceSummary ??
    queue?.maintenance_summary ??
    source.maintenanceSummary ??
    source.maintenance_summary
  return {
    maintenanceItems: items,
    maintenanceSummary: normalizeMaintenanceSummary(rawSummary, items)
  }
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
  const isActivityTimelineOpen = ref(false)
  const isActivityTimelineLoading = ref(false)
  const activityTimelineError = ref('')
  const activityTimeline = ref<DashboardActivityViewItem[]>([])
  const activityTimelineTotal = ref(0)
  const activityTimelineStoredTotal = ref(0)
  const activityActionOptions = ref<DashboardActivityOption[]>([])
  const activityTargetTypeOptions = ref<DashboardActivityOption[]>([])
  const activityFilters = reactive({
    action: '',
    targetType: '',
    keyword: ''
  })
  const lastUpdatedText = computed(() =>
    lastUpdatedAt.value ? lastUpdatedAt.value.toLocaleString() : '-'
  )
  const hasActivityFilters = computed(() =>
    Boolean(activityFilters.action || activityFilters.targetType || activityFilters.keyword)
  )

  const buildActivityRequestParams = (): DashboardActivitiesParams => ({
    limit: activityTimelineLimit,
    action: activityFilters.action || undefined,
    targetType: activityFilters.targetType || undefined,
    keyword: activityFilters.keyword.trim() || undefined
  })

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
      dashboardData.recentActivities = normalizeRecentActivities(
        detail.recentActivities ?? detail.recent_activities ?? []
      )
      dashboardData.operationalInsights = normalizeOperationalInsights(
        detail.operationalInsights ?? detail.operational_insights ?? detail.insights ?? []
      )
      const maintenanceQueue = normalizeMaintenanceQueue(detail)
      dashboardData.maintenanceItems = maintenanceQueue.maintenanceItems
      dashboardData.maintenanceSummary = maintenanceQueue.maintenanceSummary

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

  const fetchActivityTimeline = async () => {
    isActivityTimelineLoading.value = true
    activityTimelineError.value = ''

    try {
      const response = await StatsService.getActivities(buildActivityRequestParams())
      if (!response.detail) {
        throw new Error('No activity data')
      }

      const detail = response.detail
      activityTimeline.value = normalizeRecentActivities(detail.activities ?? detail.items ?? [])
      activityTimelineTotal.value = toNumber(detail.total)
      activityTimelineStoredTotal.value = toNumber(detail.storedTotal ?? detail.stored_total)
      activityActionOptions.value = normalizeActivityOptions(
        detail.actionOptions ?? detail.action_options ?? []
      )
      activityTargetTypeOptions.value = normalizeActivityOptions(
        detail.targetTypeOptions ?? detail.target_type_options ?? []
      )
    } catch (error) {
      activityTimelineError.value = getErrorMessage(
        error,
        options.activityLoadFailedMessage || 'Failed to load activity timeline'
      )
    } finally {
      isActivityTimelineLoading.value = false
    }
  }

  const openActivityTimeline = async () => {
    isActivityTimelineOpen.value = true
    await fetchActivityTimeline()
  }

  const closeActivityTimeline = () => {
    isActivityTimelineOpen.value = false
  }

  const setActivityActionFilter = async (action: string) => {
    activityFilters.action = action
    await fetchActivityTimeline()
  }

  const setActivityTargetTypeFilter = async (targetType: string) => {
    activityFilters.targetType = targetType
    await fetchActivityTimeline()
  }

  const setActivityKeywordFilter = (keyword: string) => {
    activityFilters.keyword = keyword
  }

  const applyActivityFilters = async () => {
    await fetchActivityTimeline()
  }

  const resetActivityFilters = async () => {
    activityFilters.action = ''
    activityFilters.targetType = ''
    activityFilters.keyword = ''
    await fetchActivityTimeline()
  }

  return {
    activityActionOptions,
    activityFilters,
    activityTargetTypeOptions,
    activityTimeline,
    activityTimelineError,
    activityTimelineStoredTotal,
    activityTimelineTotal,
    applyActivityFilters,
    closeActivityTimeline,
    dashboardData,
    errorMessage,
    fetchDashboardData,
    fetchActivityTimeline,
    hasActivityFilters,
    isActivityTimelineLoading,
    isActivityTimelineOpen,
    isLoading,
    lastUpdatedText,
    openActivityTimeline,
    resetActivityFilters,
    setActivityActionFilter,
    setActivityKeywordFilter,
    setActivityTargetTypeFilter
  }
}
