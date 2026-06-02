import type { ApiResponse, SendType, SentFileRecord } from '@/types'

type Translate = (key: string, params?: Record<string, string | number>) => string

type BuildSentRecordInput = {
  response: ApiResponse
  sendType: SendType
  textContent: string
  selectedFile: File | null
  selectedFiles: File[]
  expirationMethod: string
  expirationValue: string
  translate: Translate
  getUnit: (method: string) => string
}

const expirationSecondsByMethod: Record<string, number> = {
  minute: 60,
  hour: 3600,
  day: 86400
}

export function isExpirationWithinLimit(
  method: string,
  value: string,
  maxSaveSeconds: number
): boolean {
  if (method === 'forever' || method === 'count') return true
  if (maxSaveSeconds === 0) return true

  const multiplier = expirationSecondsByMethod[method]
  if (!multiplier) return false

  return parseInt(value) * multiplier <= maxSaveSeconds
}

export function formatExpirationTime(
  method: string,
  value: string,
  translate: Translate,
  getUnit: (method: string) => string
): string {
  if (method === 'forever') return translate('send.expiration.units.forever')
  if (method === 'count') return translate('send.messages.expiresAfterCount', { count: value })

  const now = new Date()
  const expireValue = parseInt(value)

  switch (method) {
    case 'minute':
      now.setMinutes(now.getMinutes() + expireValue)
      break
    case 'hour':
      now.setHours(now.getHours() + expireValue)
      break
    case 'day':
      now.setDate(now.getDate() + expireValue)
      break
    default:
      return translate('send.messages.expiresAfter', { value, unit: getUnit(method) })
  }

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return translate('send.messages.expiresAt', { date: `${year}-${month}-${day} ${hours}:${minutes}` })
}

export function buildSentRecord(input: BuildSentRecordInput): SentFileRecord {
  const retrieveCode = (input.response.detail as { code?: string } | undefined)?.code || ''
  const fileName = (input.response.detail as { name?: string } | undefined)?.name || ''

  const totalSelectedSize = input.selectedFiles.reduce((total, file) => total + file.size, 0)
  const displaySize =
    input.sendType === 'text'
      ? `${(input.textContent.length / 1024).toFixed(2)} KB`
      : input.selectedFiles.length > 0
        ? `${(totalSelectedSize / (1024 * 1024)).toFixed(1)} MB`
        : `${((input.selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB`

  return {
    id: Date.now(),
    filename: fileName,
    date: new Date().toISOString().split('T')[0],
    size: displaySize,
    expiration:
      input.expirationMethod === 'forever'
        ? input.translate('send.expiration.forever')
        : formatExpirationTime(
            input.expirationMethod,
            input.expirationValue,
            input.translate,
            input.getUnit
          ),
    retrieveCode
  }
}
