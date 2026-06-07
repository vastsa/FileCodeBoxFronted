import { describe, expect, it } from 'vitest'

import type { AdminFileViewItem, FileListItem } from '@/types'
import {
  buildFallbackSummary,
  getRemainingDownloads,
  inferIsChunked,
  inferIsExpired,
  inferIsText,
  normalizeCount,
  normalizeSummary
} from './admin-file-summary'

const buildFile = (overrides: Partial<FileListItem> = {}): FileListItem => ({
  id: 1,
  code: '12345',
  prefix: 'report',
  suffix: '.txt',
  size: 100,
  expired_at: null,
  expired_count: -1,
  created_at: '2026-06-06T00:00:00',
  ...overrides
})

const buildViewItem = (overrides: Partial<AdminFileViewItem> = {}): AdminFileViewItem => ({
  ...buildFile(overrides),
  displayName: 'report.txt',
  displaySize: '100 B',
  displayExpiredAt: '-',
  displayUsage: '0',
  displayHealthState: 'healthy',
  displayHealthAction: 'monitor',
  isTextFile: false,
  isExpiredFile: false,
  isChunkedFile: false,
  remainingDownloadsValue: null,
  canPreviewText: false,
  statusInsightSeverity: 'success',
  statusInsightState: 'available',
  statusInsightNextAction: 'monitor',
  statusInsightReasons: [],
  ...overrides
})

describe('admin file summary helpers', () => {
  it('normalizes numeric values from mixed input', () => {
    expect(normalizeCount('12')).toBe(12)
    expect(normalizeCount(null)).toBe(0)
    expect(normalizeCount(undefined)).toBe(0)
  })

  it('infers file flags from legacy and current fields', () => {
    expect(inferIsText(buildFile({ isText: true }))).toBe(true)
    expect(inferIsText(buildFile({ is_text: true }))).toBe(true)
    expect(inferIsText(buildFile({ type: 'text' }))).toBe(true)
    expect(inferIsText(buildFile({ text: 'hello' }))).toBe(true)

    expect(inferIsExpired(buildFile({ isExpired: true }))).toBe(true)
    expect(inferIsExpired(buildFile({ is_expired: true }))).toBe(true)
    expect(inferIsExpired(buildFile({ expired_count: 0 }))).toBe(true)
    expect(inferIsExpired(buildFile({ expired_at: '2000-01-01T00:00:00Z' }))).toBe(true)
    expect(inferIsExpired(buildFile({ expired_at: '2999-01-01T00:00:00Z' }))).toBe(false)

    expect(inferIsChunked(buildFile({ isChunked: true }))).toBe(true)
    expect(inferIsChunked(buildFile({ is_chunked: true }))).toBe(true)
  })

  it('normalizes remaining download counts', () => {
    expect(getRemainingDownloads(buildFile({ remainingDownloads: 3 }))).toBe(3)
    expect(getRemainingDownloads(buildFile({ remaining_downloads: 2 }))).toBe(2)
    expect(getRemainingDownloads(buildFile({ expired_count: 4 }))).toBe(4)
    expect(getRemainingDownloads(buildFile({ expired_count: -1 }))).toBeNull()
  })

  it('builds fallback summary from current page data', () => {
    const files = [
      buildViewItem({
        id: 1,
        size: 100,
        usedCount: 2,
        statusInsightSeverity: 'success',
        statusInsightState: 'available'
      }),
      buildViewItem({
        id: 2,
        isExpiredFile: true,
        isTextFile: true,
        isChunkedFile: true,
        size: 200,
        used_count: 3,
        statusInsightSeverity: 'warning',
        statusInsightState: 'permanent',
        statusInsightReasons: [
          'expires_soon',
          'storage_metadata_incomplete',
          'never_retrieved'
        ]
      })
    ]

    expect(buildFallbackSummary(files, 10)).toMatchObject({
      totalFiles: 10,
      activeCount: 1,
      expiredCount: 1,
      textCount: 1,
      fileCount: 1,
      chunkedCount: 1,
      healthAttentionCount: 1,
      healthWarningCount: 1,
      expiringSoonCount: 1,
      storageIssueCount: 1,
      neverRetrievedCount: 1,
      healthyCount: 1,
      permanentCount: 1,
      storageUsed: 300,
      usedCount: 5
    })
  })

  it('uses backend summary fields while falling back for missing values', () => {
    const files = [buildViewItem({ size: 100, usedCount: 2 })]

    expect(
      normalizeSummary(
        {
          totalFiles: '8' as unknown as number,
          activeCount: 7
        },
        files,
        1
      )
    ).toMatchObject({
      totalFiles: 8,
      activeCount: 7,
      storageUsed: 100,
      usedCount: 2
    })
  })
})
