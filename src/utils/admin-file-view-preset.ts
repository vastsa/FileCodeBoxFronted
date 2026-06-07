import type {
  AdminFileHealthFilter,
  AdminFileSortBy,
  AdminFileSortOrder,
  AdminFileStatusFilter,
  AdminFileTypeFilter,
  AdminFileViewPresetParams
} from '@/types'

export const adminFileStatusFilters: AdminFileStatusFilter[] = ['all', 'active', 'expired']
export const adminFileTypeFilters: AdminFileTypeFilter[] = ['all', 'file', 'text', 'chunked']
export const adminFileHealthFilters: AdminFileHealthFilter[] = [
  'all',
  'attention',
  'danger',
  'warning',
  'healthy',
  'expired',
  'expiring_soon',
  'storage_issue',
  'never_retrieved',
  'permanent'
]
export const adminFileSortFields: AdminFileSortBy[] = [
  'created_at',
  'expired_at',
  'name',
  'size',
  'used_count',
  'code'
]
export const adminFileSortOrders: AdminFileSortOrder[] = ['asc', 'desc']

type RawViewPresetParams = Partial<
  Record<keyof AdminFileViewPresetParams | 'sort_by' | 'sort_order', unknown>
>

const normalizePresetChoice = <T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fallback: T
): T => {
  const normalizedValue = String(value ?? fallback)
    .replace('-', '_')
    .trim()
    .toLowerCase()
  return allowedValues.includes(normalizedValue as T) ? (normalizedValue as T) : fallback
}

const normalizePresetSize = (value: unknown) => {
  const normalizedSize = Number(value)
  if (!Number.isFinite(normalizedSize)) return 10
  return Math.min(Math.max(Math.trunc(normalizedSize), 1), 100)
}

export const buildDefaultViewPresetParams = (): AdminFileViewPresetParams => ({
  keyword: '',
  status: 'all',
  type: 'all',
  health: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
  size: 10
})

export const normalizeViewPresetParams = (params: unknown): AdminFileViewPresetParams => {
  const defaults = buildDefaultViewPresetParams()
  const rawParams =
    params && typeof params === 'object'
      ? (params as RawViewPresetParams)
      : ({} as RawViewPresetParams)

  return {
    keyword: String(rawParams.keyword ?? defaults.keyword).trim(),
    status: normalizePresetChoice(rawParams.status, adminFileStatusFilters, defaults.status),
    type: normalizePresetChoice(rawParams.type, adminFileTypeFilters, defaults.type),
    health: normalizePresetChoice(rawParams.health, adminFileHealthFilters, defaults.health),
    sortBy: normalizePresetChoice(
      rawParams.sortBy ?? rawParams.sort_by,
      adminFileSortFields,
      defaults.sortBy
    ),
    sortOrder: normalizePresetChoice(
      rawParams.sortOrder ?? rawParams.sort_order,
      adminFileSortOrders,
      defaults.sortOrder
    ),
    size: normalizePresetSize(rawParams.size ?? defaults.size)
  }
}
