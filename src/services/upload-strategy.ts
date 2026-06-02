import { FileService } from './file'
import type { ApiResponse, ChunkUploadInitResponse, FileUploadResponse, UploadProgress } from '@/types'
import { calculateFileHash } from '@/utils/file-processing'

const CHUNK_SIZE = 5 * 1024 * 1024

type ChunkedUploadOptions = {
  expireValue: number
  expireStyle: string
  onHashCalculated?: (hash: string) => void
  onProgress?: (progress: UploadProgress) => void
  messages?: {
    initFailed?: string
    chunkFailed?: (index: number) => string
    completeFailed?: string
  }
}

type ChunkedUploadResult = ChunkUploadInitResponse | FileUploadResponse

const calculateCompletedBytes = (uploadedChunks: Set<number>, chunkSize: number, fileSize: number) =>
  Array.from(uploadedChunks).reduce((total, index) => {
    const chunkStart = index * chunkSize
    const chunkEnd = Math.min((index + 1) * chunkSize, fileSize)
    return total + Math.max(0, chunkEnd - chunkStart)
  }, 0)

export const uploadChunkedFile = async (
  file: File,
  options: ChunkedUploadOptions
): Promise<ApiResponse<ChunkedUploadResult>> => {
  const fileHash = await calculateFileHash(file)
  options.onHashCalculated?.(fileHash)

  const chunks = Math.ceil(file.size / CHUNK_SIZE)
  const initResponse = await FileService.initChunkUpload({
    file_name: file.name,
    file_size: file.size,
    chunk_size: CHUNK_SIZE,
    file_hash: fileHash
  })

  if (initResponse.code !== 200) {
    throw new Error(options.messages?.initFailed || 'Init chunk upload failed')
  }

  if (initResponse.detail?.existed) {
    return initResponse
  }

  const initDetail = initResponse.detail
  const uploadId = initDetail?.upload_id
  if (!uploadId) {
    throw new Error(options.messages?.initFailed || 'Init chunk upload failed')
  }

  const uploadedChunks = new Set(initDetail.uploaded_chunks || [])
  for (let index = 0; index < chunks; index++) {
    if (uploadedChunks.has(index)) {
      continue
    }

    const start = index * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    const chunkResponse = await FileService.uploadChunk(
      uploadId,
      index,
      new Blob([chunk], { type: file.type }),
      (progress) => {
        const completedBytes = calculateCompletedBytes(uploadedChunks, CHUNK_SIZE, file.size)
        const percentage = Math.round(((completedBytes + progress.loaded) * 100) / file.size)
        options.onProgress?.({
          loaded: completedBytes + progress.loaded,
          total: file.size,
          percentage: Math.min(percentage, 99)
        })
      }
    )

    if (chunkResponse.code !== 200) {
      throw new Error(options.messages?.chunkFailed?.(index) || `Chunk upload failed: ${index}`)
    }
    uploadedChunks.add(index)
  }

  const completeResponse = await FileService.completeChunkUpload(uploadId, {
    expire_value: options.expireValue,
    expire_style: options.expireStyle
  })

  if (completeResponse.code !== 200) {
    throw new Error(options.messages?.completeFailed || 'Complete chunk upload failed')
  }

  return completeResponse
}
