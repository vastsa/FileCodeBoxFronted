import type { SentFileRecord } from '@/types'
import { copyRetrieveCode, copyRetrieveLink, copyWgetCommand } from '@/utils/clipboard'
import { buildSentRecordQrValue } from '@/utils/share-url'

type CopyNotify = (message: string, type: 'success' | 'error') => void

export function createSentRecordActions(notify: CopyNotify) {
  return {
    copyLink: (record: SentFileRecord) =>
      copyRetrieveLink(record.retrieveCode, { notify }),
    copyCode: (record: SentFileRecord) =>
      copyRetrieveCode(record.retrieveCode, { notify }),
    copyWgetCommand: (record: SentFileRecord) =>
      copyWgetCommand(record.retrieveCode, record.filename, { notify }),
    getQRCodeValue: (record: SentFileRecord) => buildSentRecordQrValue(record)
  }
}
