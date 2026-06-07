import { describe, expect, it, vi, beforeEach } from 'vitest'

import { PresignUploadService } from '@/services'
import { usePresignedUpload } from './usePresignedUpload'

vi.mock('@/services', () => ({
  PresignUploadService: {
    initUpload: vi.fn(),
    directUploadToS3: vi.fn(),
    confirmUpload: vi.fn(),
    proxyUpload: vi.fn(),
    cancelUpload: vi.fn(),
    getUploadStatus: vi.fn()
  }
}))

const mockedPresignUploadService = vi.mocked(PresignUploadService)

const createFile = () =>
  new File(['hello'], 'hello.txt', {
    type: 'text/plain',
    lastModified: 1
  })

describe('usePresignedUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads through direct mode and confirms the upload', async () => {
    mockedPresignUploadService.initUpload.mockResolvedValue({
      code: 200,
      detail: {
        upload_id: 'direct-1',
        upload_url: 'https://storage.example/upload',
        mode: 'direct',
        expires_in: 900
      }
    })
    mockedPresignUploadService.directUploadToS3.mockImplementation(
      async (_uploadUrl, file, onProgress) => {
        onProgress?.({
          loaded: file.size,
          total: file.size,
          percentage: 100
        })
        return true
      }
    )
    mockedPresignUploadService.confirmUpload.mockResolvedValue({
      code: 200,
      detail: {
        code: '12345',
        name: 'hello.txt'
      }
    })

    const notify = vi.fn()
    const onProgress = vi.fn()
    const upload = usePresignedUpload({
      getMaxFileSize: () => 1024,
      notify
    })

    const code = await upload.uploadFile(createFile(), {
      expireValue: 2,
      expireStyle: 'day',
      onProgress
    })

    expect(code).toBe('12345')
    expect(mockedPresignUploadService.initUpload).toHaveBeenCalledWith({
      file_name: 'hello.txt',
      file_size: 5,
      expire_value: 2,
      expire_style: 'day'
    })
    expect(mockedPresignUploadService.directUploadToS3).toHaveBeenCalledWith(
      'https://storage.example/upload',
      expect.any(File),
      expect.any(Function)
    )
    expect(mockedPresignUploadService.confirmUpload).toHaveBeenCalledWith('direct-1', {
      expire_value: 2,
      expire_style: 'day'
    })
    expect(onProgress).toHaveBeenCalledWith({
      loaded: 5,
      total: 5,
      percentage: 100
    })
    expect(upload.presignStatus.value).toBe('success')
    expect(upload.uploadProgress.value).toEqual({
      loaded: 5,
      total: 5,
      percentage: 100
    })
    expect(notify).toHaveBeenCalledWith('文件上传成功！', 'success')
  })

  it('uploads through proxy mode using the proxy upload url', async () => {
    mockedPresignUploadService.initUpload.mockResolvedValue({
      code: 200,
      detail: {
        upload_id: 'proxy-1',
        upload_url: '/presign/upload/proxy/proxy-1',
        proxy_upload_url: '/presign/upload/proxy/proxy-1',
        legacy_proxy_upload_url: '/api/presign/upload/proxy/proxy-1',
        mode: 'proxy',
        expires_in: 900
      }
    })
    mockedPresignUploadService.proxyUpload.mockImplementation(
      async (_uploadId, file, onProgress) => {
        onProgress?.({
          loaded: file.size,
          total: file.size,
          percentage: 100
        })
        return {
          code: 200,
          detail: {
            code: '54321',
            name: 'hello.txt'
          }
        }
      }
    )

    const upload = usePresignedUpload({
      getMaxFileSize: () => 1024,
      notify: vi.fn()
    })

    const code = await upload.uploadFile(createFile(), {
      expireValue: 1,
      expireStyle: 'hour'
    })

    expect(code).toBe('54321')
    expect(mockedPresignUploadService.proxyUpload).toHaveBeenCalledWith(
      'proxy-1',
      expect.any(File),
      expect.any(Function),
      '/presign/upload/proxy/proxy-1'
    )
    expect(mockedPresignUploadService.confirmUpload).not.toHaveBeenCalled()
    expect(upload.presignStatus.value).toBe('success')
  })
})
