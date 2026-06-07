import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadChunkedFile } from './upload-strategy'
import { FileService } from './file'

vi.mock('@/utils/file-processing', () => ({
  calculateFileHash: vi.fn(async () => 'file-hash')
}))

vi.mock('./file', () => ({
  FileService: {
    initChunkUpload: vi.fn(),
    uploadChunk: vi.fn(),
    completeChunkUpload: vi.fn()
  }
}))

const mockedFileService = vi.mocked(FileService)

const createLargeFile = () => {
  const sixMb = 6 * 1024 * 1024
  return new File([new Uint8Array(sixMb)], 'video.mp4', {
    type: 'video/mp4',
    lastModified: 1
  })
}

describe('uploadChunkedFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips uploaded chunks and reports progress from completed bytes', async () => {
    mockedFileService.initChunkUpload.mockResolvedValue({
      code: 200,
      detail: {
        upload_id: 'upload-1',
        uploaded_chunks: [0]
      }
    })
    mockedFileService.uploadChunk.mockImplementation(async (_uploadId, _index, chunk, onProgress) => {
      onProgress?.({
        loaded: chunk.size,
        total: chunk.size,
        percentage: 100
      })
      return {
        code: 200,
        detail: null
      }
    })
    mockedFileService.completeChunkUpload.mockResolvedValue({
      code: 200,
      detail: {
        code: '12345',
        name: 'video.mp4'
      }
    })

    const progress = vi.fn()
    const result = await uploadChunkedFile(createLargeFile(), {
      expireValue: 2,
      expireStyle: 'day',
      onProgress: progress
    })

    expect(mockedFileService.initChunkUpload).toHaveBeenCalledWith({
      file_name: 'video.mp4',
      file_size: 6 * 1024 * 1024,
      chunk_size: 5 * 1024 * 1024,
      file_hash: 'file-hash'
    })
    expect(mockedFileService.uploadChunk).toHaveBeenCalledTimes(1)
    expect(mockedFileService.uploadChunk.mock.calls[0][1]).toBe(1)
    expect(progress).toHaveBeenCalledWith({
      loaded: 6 * 1024 * 1024,
      total: 6 * 1024 * 1024,
      percentage: 99
    })
    expect(mockedFileService.completeChunkUpload).toHaveBeenCalledWith('upload-1', {
      expire_value: 2,
      expire_style: 'day'
    })
    expect(result.detail).toEqual({
      code: '12345',
      name: 'video.mp4'
    })
  })

  it('returns early when the backend reports an existing uploaded file', async () => {
    mockedFileService.initChunkUpload.mockResolvedValue({
      code: 200,
      detail: {
        existed: true,
        code: '54321',
        name: 'video.mp4'
      }
    })

    const result = await uploadChunkedFile(createLargeFile(), {
      expireValue: 1,
      expireStyle: 'day'
    })

    expect(mockedFileService.uploadChunk).not.toHaveBeenCalled()
    expect(mockedFileService.completeChunkUpload).not.toHaveBeenCalled()
    expect(result.detail).toEqual({
      existed: true,
      code: '54321',
      name: 'video.mp4'
    })
  })
})
