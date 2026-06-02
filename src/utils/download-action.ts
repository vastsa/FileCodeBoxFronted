import { saveAs } from 'file-saver'
import type { ReceivedFileRecord } from '@/types'
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
