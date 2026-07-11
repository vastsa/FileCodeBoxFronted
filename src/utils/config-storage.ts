import { DEFAULT_CONFIG, FILE_SIZE_LIMITS, STORAGE_KEYS } from '@/constants'
import type { ConfigState, SystemConfig } from '@/types'

export type PublicConfig = SystemConfig & {
  uploadSize: number
  allowed_file_types?: string[]
  expireStyle: string[]
  code_generate_type?: 'number' | 'secret'
  openUpload: number
  max_save_seconds: number
  enableChunk: number
  notify_title?: string
  notify_content?: string
  page_explain?: string
  showAdminAddr?: number
  themesSelect?: string
  background?: string
  opacity?: number
}

type PublicConfigInput = Omit<Partial<ConfigState>, 'showAdminAddr'> & {
  showAdminAddr?: number | string
  show_admin_address?: number | string
}

export const DEFAULT_PUBLIC_CONFIG: PublicConfig = {
  ...DEFAULT_CONFIG,
  uploadSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
  allowedFileTypes: ['*'],
  allowed_file_types: ['*'],
  expireStyle: ['day'],
  code_generate_type: 'secret',
  openUpload: 1,
  max_save_seconds: 0,
  enableChunk: 0,
  showAdminAddr: 0
}

export const DEFAULT_CONFIG_STATE: ConfigState = {
  name: DEFAULT_PUBLIC_CONFIG.name,
  description: DEFAULT_PUBLIC_CONFIG.description || '',
  file_storage: '',
  themesChoices: [],
  expireStyle: DEFAULT_PUBLIC_CONFIG.expireStyle,
  code_generate_type: DEFAULT_PUBLIC_CONFIG.code_generate_type || 'secret',
  adminSessionExpire: 30 * 24 * 60 * 60,
  admin_token: '',
  robotsText: '',
  keywords: '',
  notify_title: '',
  notify_content: '',
  openUpload: DEFAULT_PUBLIC_CONFIG.openUpload,
  uploadSize: DEFAULT_PUBLIC_CONFIG.uploadSize,
  allowed_file_types: DEFAULT_PUBLIC_CONFIG.allowedFileTypes,
  allowedFileTypes: DEFAULT_PUBLIC_CONFIG.allowedFileTypes,
  storage_path: '',
  storageLimit: 0,
  uploadMinute: 1,
  max_save_seconds: DEFAULT_PUBLIC_CONFIG.max_save_seconds,
  opacity: 0.9,
  enableChunk: DEFAULT_PUBLIC_CONFIG.enableChunk,
  s3_access_key_id: '',
  background: '',
  showAdminAddr: 0,
  page_explain: '',
  s3_secret_access_key: '',
  aws_session_token: '',
  s3_signature_version: '',
  s3_addressing_style: 'auto',
  s3_region_name: '',
  s3_bucket_name: '',
  s3_endpoint_url: '',
  s3_hostname: '',
  uploadCount: 1,
  errorMinute: 1,
  errorCount: 1,
  s3_proxy: 0,
  themesSelect: '',
  webdav_url: '',
  webdav_username: '',
  webdav_password: ''
}

function normalizeFileTypes(value: unknown): string[] {
  const rawTypes =
    typeof value === 'string'
      ? value.split(',')
      : Array.isArray(value)
        ? value
        : DEFAULT_PUBLIC_CONFIG.allowedFileTypes
  const normalized = rawTypes.map((item) => String(item).trim()).filter(Boolean)
  return normalized.length > 0 ? normalized : ['*']
}

function normalizeAdminAddress(value: number | string | undefined): number | undefined {
  if (value === undefined) return undefined
  return Number(value) === 1 ? 1 : 0
}

export function readStoredConfig<T extends object = Partial<ConfigState>>(): T | null {
  try {
    const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG)
    return rawConfig ? (JSON.parse(rawConfig) as T) : null
  } catch {
    return null
  }
}

export function toPublicConfig(
  config: PublicConfigInput | null | undefined
): Partial<PublicConfig> {
  if (!config) return {}

  const allowedFileTypes = normalizeFileTypes(config.allowedFileTypes ?? config.allowed_file_types)

  return {
    name: config.name,
    description: config.description,
    uploadSize: config.uploadSize,
    allowedFileTypes,
    allowed_file_types: allowedFileTypes,
    expireStyle: config.expireStyle,
    code_generate_type: config.code_generate_type,
    openUpload: config.openUpload,
    max_save_seconds: config.max_save_seconds,
    enableChunk: config.enableChunk,
    notify_title: config.notify_title,
    notify_content: config.notify_content,
    page_explain: config.page_explain,
    showAdminAddr: normalizeAdminAddress(config.showAdminAddr ?? config.show_admin_address),
    themesSelect: config.themesSelect,
    background: config.background,
    opacity: config.opacity
  }
}

export function writeStoredConfig(config: object) {
  localStorage.setItem(
    STORAGE_KEYS.CONFIG,
    JSON.stringify(toPublicConfig(config as PublicConfigInput))
  )
}

export function readNotifyKey(): string | null {
  return localStorage.getItem(STORAGE_KEYS.NOTIFY)
}

export function writeNotifyKey(notifyKey: string) {
  localStorage.setItem(STORAGE_KEYS.NOTIFY, notifyKey)
}
