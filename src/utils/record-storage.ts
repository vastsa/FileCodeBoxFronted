export function readStoredRecords<T>(key: string): T[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function writeStoredRecords<T>(key: string, records: T[]) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(records))
  } catch {
    // 本地存储不可用时保持内存记录，不影响当前会话。
  }
}
