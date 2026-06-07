import type { AdminFileSummary, AdminFileViewItem, FileListItem } from '@/types'

export const normalizeCount = (value: number | string | null | undefined) => Number(value || 0)

export const isExpiredByDate = (value: string | null | undefined) => {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) && timestamp < Date.now()
}

export const inferIsText = (file: FileListItem) => {
  if (typeof file.isText === 'boolean') return file.isText
  if (typeof file.is_text === 'boolean') return file.is_text
  if (file.type) return file.type === 'text'
  return Boolean(file.text)
}

export const inferIsExpired = (file: FileListItem) => {
  if (typeof file.isExpired === 'boolean') return file.isExpired
  if (typeof file.is_expired === 'boolean') return file.is_expired
  if (
    file.expired_count !== null &&
    file.expired_count !== undefined &&
    file.expired_count === 0
  ) {
    return true
  }
  return isExpiredByDate(file.expired_at)
}

export const inferIsChunked = (file: FileListItem) => Boolean(file.isChunked ?? file.is_chunked)

export const getRemainingDownloads = (file: FileListItem) => {
  if (file.remainingDownloads !== undefined) return file.remainingDownloads
  if (file.remaining_downloads !== undefined) return file.remaining_downloads
  if (
    file.expired_count !== null &&
    file.expired_count !== undefined &&
    file.expired_count >= 0
  ) {
    return Math.max(file.expired_count, 0)
  }
  return null
}

export const buildFallbackSummary = (
  files: AdminFileViewItem[],
  total: number
): AdminFileSummary => ({
  totalFiles: total,
  activeCount: files.filter((file) => !file.isExpiredFile).length,
  expiredCount: files.filter((file) => file.isExpiredFile).length,
  textCount: files.filter((file) => file.isTextFile).length,
  fileCount: files.filter((file) => !file.isTextFile).length,
  chunkedCount: files.filter((file) => file.isChunkedFile).length,
  healthAttentionCount: files.filter((file) =>
    ['danger', 'warning'].includes(file.statusInsightSeverity)
  ).length,
  healthDangerCount: files.filter((file) => file.statusInsightSeverity === 'danger').length,
  healthWarningCount: files.filter((file) => file.statusInsightSeverity === 'warning').length,
  expiringSoonCount: files.filter((file) => file.statusInsightReasons.includes('expires_soon'))
    .length,
  storageIssueCount: files.filter((file) =>
    file.statusInsightReasons.includes('storage_metadata_incomplete')
  ).length,
  neverRetrievedCount: files.filter((file) =>
    file.statusInsightReasons.includes('never_retrieved')
  ).length,
  healthyCount: files.filter((file) => file.statusInsightSeverity === 'success').length,
  permanentCount: files.filter((file) => file.statusInsightState === 'permanent').length,
  storageUsed: files.reduce((totalSize, file) => totalSize + normalizeCount(file.size), 0),
  usedCount: files.reduce(
    (totalUsed, file) => totalUsed + normalizeCount(file.usedCount ?? file.used_count),
    0
  )
})

export const normalizeSummary = (
  rawSummary: Partial<AdminFileSummary> | undefined,
  files: AdminFileViewItem[],
  total: number
): AdminFileSummary => {
  const fallback = buildFallbackSummary(files, total)
  if (!rawSummary) return fallback

  return {
    totalFiles: normalizeCount(rawSummary.totalFiles ?? fallback.totalFiles),
    activeCount: normalizeCount(rawSummary.activeCount ?? fallback.activeCount),
    expiredCount: normalizeCount(rawSummary.expiredCount ?? fallback.expiredCount),
    textCount: normalizeCount(rawSummary.textCount ?? fallback.textCount),
    fileCount: normalizeCount(rawSummary.fileCount ?? fallback.fileCount),
    chunkedCount: normalizeCount(rawSummary.chunkedCount ?? fallback.chunkedCount),
    healthAttentionCount: normalizeCount(
      rawSummary.healthAttentionCount ?? fallback.healthAttentionCount
    ),
    healthDangerCount: normalizeCount(rawSummary.healthDangerCount ?? fallback.healthDangerCount),
    healthWarningCount: normalizeCount(
      rawSummary.healthWarningCount ?? fallback.healthWarningCount
    ),
    expiringSoonCount: normalizeCount(rawSummary.expiringSoonCount ?? fallback.expiringSoonCount),
    storageIssueCount: normalizeCount(rawSummary.storageIssueCount ?? fallback.storageIssueCount),
    neverRetrievedCount: normalizeCount(
      rawSummary.neverRetrievedCount ?? fallback.neverRetrievedCount
    ),
    healthyCount: normalizeCount(rawSummary.healthyCount ?? fallback.healthyCount),
    permanentCount: normalizeCount(rawSummary.permanentCount ?? fallback.permanentCount),
    storageUsed: normalizeCount(rawSummary.storageUsed ?? fallback.storageUsed),
    usedCount: normalizeCount(rawSummary.usedCount ?? fallback.usedCount)
  }
}
