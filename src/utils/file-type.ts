type FileLike = {
  name: string
  type?: string
}

export const normalizeAllowedFileTypes = (types: unknown): string[] => {
  const rawTypes =
    typeof types === 'string'
      ? types.replace(/;/g, ',').split(',')
      : Array.isArray(types)
        ? types
        : []
  const normalized = rawTypes.map((type) => String(type).trim()).filter(Boolean)
  return normalized.length > 0 ? normalized : ['*']
}

export const buildAcceptedFileTypes = (allowedTypes: string[]) => {
  if (allowedTypes.some((type) => type === '*' || type === '*/*')) return '*'

  return allowedTypes
    .map((type) => {
      const normalizedType = type.toLowerCase()
      if (normalizedType.includes('/')) return normalizedType
      return normalizedType.startsWith('.') ? normalizedType : `.${normalizedType}`
    })
    .join(',')
}

export const isFileTypeAllowed = (file: FileLike, allowedTypes: string[]) => {
  if (allowedTypes.some((type) => type === '*' || type === '*/*')) {
    return true
  }

  const fileName = file.name.toLowerCase()
  const mimeType = String(file.type || '').toLowerCase()
  return allowedTypes.some((type) => {
    const rule = type.toLowerCase()
    if (rule.includes('/')) {
      if (rule.endsWith('/*')) {
        return mimeType.startsWith(rule.slice(0, -1))
      }
      return mimeType === rule
    }

    const extension = rule.startsWith('.') ? rule : `.${rule}`
    return fileName.endsWith(extension)
  })
}
