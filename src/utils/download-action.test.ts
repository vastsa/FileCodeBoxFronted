import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AdminFileViewItem, ReceivedFileRecord } from '@/types'
import { downloadAdminManagedFile, downloadReceivedRecord, getSafeFilename } from './download-action'

const fileSaverMock = vi.hoisted(() => ({
  saveAs: vi.fn()
}))

vi.mock('file-saver', () => ({
  saveAs: fileSaverMock.saveAs
}))

const buildReceivedRecord = (
  overrides: Partial<ReceivedFileRecord> = {}
): ReceivedFileRecord => ({
  id: 1,
  code: '12345',
  filename: 'note',
  size: '1 KB',
  downloadUrl: null,
  content: 'hello',
  date: '2026-06-06',
  type: 'text',
  ...overrides
})

const buildAdminFile = (overrides: Partial<AdminFileViewItem> = {}): AdminFileViewItem => ({
  id: 1,
  code: '12345',
  prefix: 'report',
  suffix: '.txt',
  size: 10,
  expired_at: null,
  expired_count: null,
  created_at: '2026-06-06T00:00:00',
  displayName: 'report.txt',
  displaySize: '10 B',
  displayExpiredAt: '-',
  displayUsage: '0',
  displayHealthState: 'healthy',
  displayHealthAction: '',
  isTextFile: false,
  isExpiredFile: false,
  isChunkedFile: false,
  remainingDownloadsValue: null,
  canPreviewText: false,
  statusInsightSeverity: 'success',
  statusInsightState: 'healthy',
  statusInsightNextAction: '',
  statusInsightReasons: [],
  ...overrides
})

describe('download action helpers', () => {
  beforeEach(() => {
    fileSaverMock.saveAs.mockClear()
    vi.restoreAllMocks()
  })

  it('opens received file records through an absolute download url', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    await downloadReceivedRecord(
      buildReceivedRecord({
        downloadUrl: '/share/download?code=12345',
        content: null,
        type: 'file'
      })
    )

    expect(openSpy).toHaveBeenCalledWith(
      `${window.location.origin}/share/download?code=12345`,
      '_blank'
    )
    expect(fileSaverMock.saveAs).not.toHaveBeenCalled()
  })

  it('saves received text records as plain text', async () => {
    await downloadReceivedRecord(buildReceivedRecord({ filename: 'memo', content: 'hello' }))

    expect(fileSaverMock.saveAs).toHaveBeenCalledTimes(1)
    expect(fileSaverMock.saveAs.mock.calls[0][1]).toBe('memo.txt')
  })

  it('sanitizes unsafe filenames', () => {
    expect(getSafeFilename(' ../a:b*c?.txt\n ')).toBe('.._a_b_c_.txt')
    expect(getSafeFilename('')).toBe('download')
  })

  it('uses content-disposition filenames for managed binary files', async () => {
    const blob = new Blob(['file'])

    await downloadAdminManagedFile(buildAdminFile(), {
      data: blob,
      headers: {
        'content-disposition': "attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf"
      }
    })

    expect(fileSaverMock.saveAs).toHaveBeenCalledWith(blob, '报告.pdf')
  })
})
