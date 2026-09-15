import api, { publicApiClient, rawApiClient } from './client'
import type { ApiResponse } from '@/types'
import type {
  CreateDeliveryCode,
  DeliveryCode,
  DeliveryFile,
  DeliveryList,
  DeliverySession
} from '@/types/delivery'

function detail<T>(response: ApiResponse<T>): T {
  if (response.detail === undefined) throw new Error('Empty delivery response')
  return response.detail
}

/** 管理请求沿用站点登录；访客请求显式使用寄件凭证复用普通上传服务。 */
export const DeliveryService = {
  async verify(code: string) {
    return detail(
      await publicApiClient.post<never, ApiResponse<DeliverySession>>('/api/delivery/verify', {
        code
      })
    )
  },
  async list(page: number) {
    return detail(
      await api.get<never, ApiResponse<DeliveryList<DeliveryCode>>>('/admin/delivery/codes', {
        params: { page, page_size: 20 }
      })
    )
  },
  async create(data: CreateDeliveryCode) {
    return detail(
      await api.post<never, ApiResponse<{ item: DeliveryCode; code: string }>>(
        '/admin/delivery/codes',
        data
      )
    )
  },
  async toggle(id: number, enabled: boolean) {
    await api.patch(`/admin/delivery/codes/${id}`, { enabled })
  },
  async remove(id: number) {
    await api.delete(`/admin/delivery/codes/${id}`)
  },
  async files(id: number, page: number, unsharedOnly = false) {
    return detail(
      await api.get<never, ApiResponse<DeliveryList<DeliveryFile>>>(
        `/admin/delivery/codes/${id}/files`,
        { params: { page, page_size: 20, unshared_only: unsharedOnly } }
      )
    )
  },
  async removeFile(id: number) {
    await api.delete(`/admin/delivery/files/${id}`)
  },
  async download(id: number) {
    return rawApiClient.get<Blob>(`/admin/delivery/files/${id}/download`, {
      responseType: 'blob',
      timeout: 0
    })
  }
}
