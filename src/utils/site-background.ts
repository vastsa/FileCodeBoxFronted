const UNSAFE_CHARS = /["'()\\;\s<>]/

/** 仅接受 http(s) 完整 URL 或站内绝对路径（兼容旧配置），并拒绝可能逃逸 CSS url() 的字符。 */
export function normalizeBackgroundUrl(value: unknown): string {
  const url = String(value ?? '').trim()
  if (!url || UNSAFE_CHARS.test(url)) return ''
  if (url.startsWith('/') && !url.startsWith('//')) return url
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : ''
  } catch {
    return ''
  }
}
