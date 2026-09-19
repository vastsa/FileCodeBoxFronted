import api, { publicApiClient } from './client'
import type { ApiResponse } from '@/types'
import type {
  CreateDeliveryCode,
  DeliveryBatchRequest,
  DeliveryCode,
  DeliveryCodeFilters,
  DeliveryList,
  DeliverySession,
  UpdateDeliveryCode
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
  async list(page: number, filters: DeliveryCodeFilters) {
    return detail(
      await api.get<never, ApiResponse<DeliveryList<DeliveryCode>>>('/admin/delivery/codes', {
        params: { page, page_size: 20, ...filters }
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
  /** 查看和复制才读取原文，管理列表不批量携带凭证。 */
  async reveal(id: number) {
    return detail(
      await api.get<never, ApiResponse<{ code: string | null }>>(
        `/admin/delivery/codes/${id}/secret`
      )
    )
  },
  async refresh(token: string) {
    return detail(
      await publicApiClient.post<never, ApiResponse<DeliverySession>>(
        '/api/delivery/refresh',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
    )
  },
  // 未变更口令时省略 code，兼容历史遗留的 32 位以上口令。
  async update(id: number, data: UpdateDeliveryCode) {
    return detail(
      await api.put<never, ApiResponse<DeliveryCode>>(`/admin/delivery/codes/${id}`, data)
    )
  },
  /** 批量接口由后端原子执行，前端只在成功后清空当前页选择。 */
  async batch(data: DeliveryBatchRequest) {
    await api.post('/admin/delivery/codes/batch', data)
  }
}
