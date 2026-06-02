import api, { rawApiClient } from './client'
import { multipartUploadConfig } from './shared'
import type {
  AdminBatchDeleteFilesResponse,
  AdminBatchPolicyActionRequest,
  AdminBatchPolicyActionResponse,
  AdminBatchUpdateFilesRequest,
  AdminBatchUpdateFilesResponse,
  AdminFilePatchPayload,
  AdminFileDetailResponse,
  AdminFileListParams,
  AdminFileMetadataRequest,
  AdminFilePolicyActionRequest,
  AdminFilePreviewResponse,
  AdminFileViewPreset,
  AdminFileViewPresetRequest,
  AdminFileViewPresetsResponse,
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

const isMethodFallbackError = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status
  return status === 404 || status === 405
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

  static async getAdminFileDetail(id: number): Promise<ApiResponse<AdminFileDetailResponse>> {
    return api.get('/admin/file/detail', {
      params: { id }
    })
  }

  static async updateFile(data: FileEditForm | AdminFilePatchPayload): Promise<ApiResponse> {
    return api.patch('/admin/file/update', data)
  }

  static async applyAdminFilePolicyAction(
    data: AdminFilePolicyActionRequest
  ): Promise<ApiResponse<AdminFileDetailResponse>> {
    try {
      return await api.patch('/admin/file/policy-action', data)
    } catch (error: unknown) {
      if (!isMethodFallbackError(error)) {
        throw error
      }

      return api.post('/admin/file/policy-action', data)
    }
  }

  static async applyAdminFilesPolicyAction(
    data: AdminBatchPolicyActionRequest
  ): Promise<ApiResponse<AdminBatchPolicyActionResponse>> {
    try {
      return await api.patch('/admin/file/batch-policy-action', data)
    } catch (error: unknown) {
      if (!isMethodFallbackError(error)) {
        throw error
      }

      return api.post('/admin/file/batch-policy-action', data)
    }
  }

  static async updateAdminFileMetadata(
    data: AdminFileMetadataRequest
  ): Promise<ApiResponse<AdminFileDetailResponse>> {
    try {
      return await api.patch('/admin/file/metadata', data)
    } catch (error: unknown) {
      if (!isMethodFallbackError(error)) {
        throw error
      }

      return api.post('/admin/file/metadata', data)
    }
  }

  static async getAdminFileViewPresets(): Promise<ApiResponse<AdminFileViewPresetsResponse>> {
    return api.get('/admin/file/view-presets')
  }

  static async saveAdminFileViewPreset(
    data: AdminFileViewPresetRequest
  ): Promise<ApiResponse<AdminFileViewPreset>> {
    try {
      return await api.patch('/admin/file/view-presets', data)
    } catch (error: unknown) {
      if (!isMethodFallbackError(error)) {
        throw error
      }

      return api.post('/admin/file/view-presets', data)
    }
  }

  static async updateAdminFiles(
    data: AdminBatchUpdateFilesRequest
  ): Promise<ApiResponse<AdminBatchUpdateFilesResponse>> {
    return api.patch('/admin/file/batch-update', data)
  }

  static async deleteAdminFile(id: number): Promise<ApiResponse> {
    return api.delete('/admin/file/delete', {
      data: { id }
    })
  }

  static async deleteAdminFiles(
    ids: number[]
  ): Promise<ApiResponse<AdminBatchDeleteFilesResponse>> {
    return api.delete('/admin/file/batch-delete', {
      data: { ids }
    })
  }

  static async deleteAdminFileViewPreset(id: string): Promise<ApiResponse> {
    try {
      return await api.delete('/admin/file/view-presets', {
        data: { id }
      })
    } catch (error: unknown) {
      if (!isMethodFallbackError(error)) {
        throw error
      }

      return api.post('/admin/file/view-presets/delete', { id })
    }
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
