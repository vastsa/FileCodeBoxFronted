import { DEFAULT_CONFIG, FILE_SIZE_LIMITS, STORAGE_KEYS } from '@/constants'
import type { ConfigState, SystemConfig } from '@/types'

export type PublicConfig = SystemConfig & {
  upload_size: number
  allowed_file_types?: string[]
  expire_style: string[]
  code_generate_type?: 'number' | 'secret'
  open_upload: number
  max_save_seconds: number
  enable_chunk: number
  notify_title?: string
  notify_content?: string
  page_explain?: string
  show_admin_addr?: number
  themes_select?: string
  background?: string
  opacity?: number
}

type PublicConfigInput = Omit<Partial<ConfigState>, 'show_admin_addr'> & {
  show_admin_addr?: number | string
  show_admin_address?: number | string
}

export const DEFAULT_PUBLIC_CONFIG: PublicConfig = {
  ...DEFAULT_CONFIG,
  upload_size: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
  allowedFileTypes: ['*'],
  allowed_file_types: ['*'],
  expire_style: ['day'],
  code_generate_type: 'secret',
  open_upload: 1,
  max_save_seconds: 0,
  enable_chunk: 0,
  show_admin_addr: 0
}

export const DEFAULT_CONFIG_STATE: ConfigState = {
  name: DEFAULT_PUBLIC_CONFIG.name,
  description: DEFAULT_PUBLIC_CONFIG.description || '',
  file_storage: '',
  themes_choices: [],
  expire_style: DEFAULT_PUBLIC_CONFIG.expire_style,
  code_generate_type: DEFAULT_PUBLIC_CONFIG.code_generate_type || 'secret',
  admin_session_expire: 30 * 24 * 60 * 60,
  admin_token: '',
  robots_text: '',
  keywords: '',
  notify_title: '',
  notify_content: '',
  open_upload: DEFAULT_PUBLIC_CONFIG.open_upload,
  upload_size: DEFAULT_PUBLIC_CONFIG.upload_size,
  allowed_file_types: DEFAULT_PUBLIC_CONFIG.allowedFileTypes,
  allowedFileTypes: DEFAULT_PUBLIC_CONFIG.allowedFileTypes,
  storage_path: '',
  storage_limit: 0,
  upload_minute: 1,
  max_save_seconds: DEFAULT_PUBLIC_CONFIG.max_save_seconds,
  opacity: 0.9,
  enable_chunk: DEFAULT_PUBLIC_CONFIG.enable_chunk,
  s3_access_key_id: '',
  background: '',
  show_admin_addr: 0,
  page_explain: '',
  s3_secret_access_key: '',
  aws_session_token: '',
  s3_signature_version: '',
  s3_addressing_style: 'auto',
  s3_region_name: '',
  s3_bucket_name: '',
  s3_endpoint_url: '',
  s3_hostname: '',
  upload_count: 1,
  error_minute: 1,
  error_count: 1,
  s3_proxy: 0,
  themes_select: '',
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
    upload_size: config.upload_size,
    allowedFileTypes,
    allowed_file_types: allowedFileTypes,
    expire_style: config.expire_style,
    code_generate_type: config.code_generate_type,
    open_upload: config.open_upload,
    max_save_seconds: config.max_save_seconds,
    enable_chunk: config.enable_chunk,
    notify_title: config.notify_title,
    notify_content: config.notify_content,
    page_explain: config.page_explain,
    show_admin_addr: normalizeAdminAddress(config.show_admin_addr ?? config.show_admin_address),
    themes_select: config.themes_select,
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
