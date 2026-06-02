import { saveAs } from 'file-saver'
import type { AdminFileViewItem, ApiResponse, ReceivedFileRecord } from '@/types'
import { buildDownloadUrl } from '@/utils/share-url'

export function downloadReceivedRecord(record: ReceivedFileRecord): void {
  if (record.downloadUrl) {
    window.open(buildDownloadUrl(record.downloadUrl), '_blank')
    return
  }

  if (record.content) {
    const blob = new Blob([record.content], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `${record.filename}.txt`)
  }
}

export const getSafeFilename = (name: string) =>
  name
    .replace(/[\\/:*?"<>|\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || 'download'

const getFilenameFromDisposition = (disposition?: string) => {
  if (!disposition) return ''

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const asciiMatch = disposition.match(/filename="?([^"]+)"?/i)
  return asciiMatch?.[1] || ''
}

const readBlobAsText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })

export function exportAdminTextFile(file: AdminFileViewItem, content: string): void {
  const filename = getSafeFilename(file.displayName || file.code)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${filename}.txt`)
}

export async function downloadAdminManagedFile(
  file: AdminFileViewItem,
  response: { data: Blob; headers: Record<string, string> }
): Promise<void> {
  if (file.isTextFile) {
    const text = await readBlobAsText(response.data)
    let content = text

    try {
      const payload = JSON.parse(text) as ApiResponse<string>
      content = typeof payload.detail === 'string' ? payload.detail : text
    } catch {
      content = text
    }

    exportAdminTextFile(file, content)
    return
  }

  const disposition =
    response.headers['content-disposition'] || response.headers['Content-Disposition']
  const filename = getSafeFilename(
    getFilenameFromDisposition(disposition) || file.displayName || file.code
  )
  saveAs(response.data, filename)
}
