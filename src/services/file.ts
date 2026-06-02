import api, { rawApiClient } from './client'
import { multipartUploadConfig } from './shared'
import type {
  AdminFileListParams,
  AdminFilePreviewResponse,
  ApiResponse,
  ChunkUploadCompleteRequest,
  ChunkUploadInitRequest,
  ChunkUploadInitResponse,
  ChunkUploadResponse,
  FileEditForm,
  FileInfo,
  FileListResponse,
  FileUploadResponse,
  ShareMetadataResponse,
  ShareSelectResponse,
  TextSendResponse,
  UploadProgress
} from '@/types'

const urlEncodedConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const toUrlEncodedForm = (data: Record<string, string | number>) => {
  const form = new URLSearchParams()
  Object.entries(data).forEach(([key, value]) => {
    form.append(key, String(value))
  })
  return form
}

export class FileService {
  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/share/file/', formData, multipartUploadConfig(onProgress))
  }

  static async uploadText(
    text: string,
    expireValue = 1,
    expireStyle = 'day'
  ): Promise<ApiResponse<TextSendResponse>> {
    const formData = new FormData()
    formData.append('text', text)
    formData.append('expire_value', String(expireValue))
    formData.append('expire_style', expireStyle)
    return api.post('/share/text/', formData, multipartUploadConfig())
  }

  static async initChunkUpload(
    request: ChunkUploadInitRequest
  ): Promise<ApiResponse<ChunkUploadInitResponse>> {
    return api.post(
      '/chunk/upload/init/',
      toUrlEncodedForm({
        file_name: request.file_name,
        file_size: request.file_size,
        chunk_size: request.chunk_size,
        file_hash: request.file_hash
      }),
      urlEncodedConfig
    )
  }

  static async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<ChunkUploadResponse>> {
    const formData = new FormData()
    formData.append('chunk', chunk)
    return api.post(
      `/chunk/upload/chunk/${uploadId}/${chunkIndex}`,
      formData,
      multipartUploadConfig(onProgress)
    )
  }

  static async completeChunkUpload(
    uploadId: string,
    request: ChunkUploadCompleteRequest
  ): Promise<ApiResponse<FileUploadResponse>> {
    return api.post(
      `/chunk/upload/complete/${uploadId}`,
      toUrlEncodedForm({
        expire_value: request.expire_value,
        expire_style: request.expire_style
      }),
      urlEncodedConfig
    )
  }

  static async selectFile(code: string): Promise<ApiResponse<ShareSelectResponse>> {
    return api.post('/share/select/', { code })
  }

  static async inspectFile(code: string): Promise<ApiResponse<ShareMetadataResponse>> {
    return api.post('/share/metadata/', { code })
  }

  static async getFile(code: string): Promise<ApiResponse<FileInfo>> {
    return api.get(`/file/${code}`)
  }

  static async downloadFile(code: string): Promise<Blob> {
    const response = await rawApiClient.get<Blob>(`/download/${code}`, {
      responseType: 'blob'
    })
    return response.data
  }

  static async getAdminFileList(
    params: AdminFileListParams
  ): Promise<ApiResponse<FileListResponse>> {
    return api.get('/admin/file/list', { params })
  }

  static async updateFile(data: FileEditForm): Promise<ApiResponse> {
    return api.patch('/admin/file/update', data)
  }

  static async deleteAdminFile(id: number): Promise<ApiResponse> {
    return api.delete('/admin/file/delete', {
      data: { id }
    })
  }

  static async downloadAdminFile(
    id: number
  ): Promise<{ data: Blob; headers: Record<string, string> }> {
    const response = await rawApiClient.get<Blob>('/admin/file/download', {
      params: { id },
      responseType: 'blob'
    })
    return {
      data: response.data,
      headers: response.headers as Record<string, string>
    }
  }

  static async previewAdminFile(
    id: number,
    maxChars = 20000
  ): Promise<ApiResponse<AdminFilePreviewResponse>> {
    return api.get('/admin/file/preview', {
      params: {
        id,
        maxChars
      }
    })
  }
}
