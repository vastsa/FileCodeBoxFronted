import JSZip from 'jszip'

const SMALL_FILE_HASH_LIMIT = 10 * 1024 * 1024
const LARGE_FILE_HASH_CHUNK_SIZE = 5 * 1024 * 1024

const generateFallbackHash = (file: File): string => {
  const fileInfo = `${file.name}-${file.size}-${file.lastModified}`
  let hash = 0
  for (let i = 0; i < fileInfo.length; i++) {
    const char = fileInfo.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

const createSha256Hash = async (data: BufferSource): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const calculateFileHash = async (file: File): Promise<string> => {
  try {
    if (file.size <= SMALL_FILE_HASH_LIMIT) {
      const buffer = await file.arrayBuffer()
      return window.isSecureContext ? createSha256Hash(buffer) : generateFallbackHash(file)
    }

    const firstChunk = file.slice(0, LARGE_FILE_HASH_CHUNK_SIZE)
    const lastChunk = file.slice(-LARGE_FILE_HASH_CHUNK_SIZE)
    const [firstBuffer, lastBuffer] = await Promise.all([
      firstChunk.arrayBuffer(),
      lastChunk.arrayBuffer()
    ])
    const combined = new Uint8Array(firstBuffer.byteLength + lastBuffer.byteLength + 16)
    combined.set(new Uint8Array(firstBuffer), 0)
    combined.set(new Uint8Array(lastBuffer), firstBuffer.byteLength)
    const sizeBytes = new TextEncoder().encode(file.size.toString())
    combined.set(sizeBytes, firstBuffer.byteLength + lastBuffer.byteLength)

    return window.isSecureContext ? createSha256Hash(combined) : generateFallbackHash(file)
  } catch (error) {
    console.error('File hash calculation failed:', error)
    return generateFallbackHash(file)
  }
}

export const packFilesAsZip = async (files: File[]): Promise<File> => {
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.name, file)
  }
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })
  return new File([blob], `files_${Date.now()}.zip`, { type: 'application/zip' })
}
