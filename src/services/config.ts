import api from './client'
import type { ApiResponse, ConfigState } from '@/types'

type PublicConfigEnvelope = {
  config?: Partial<ConfigState>
  meta?: unknown
}

const isPublicConfigEnvelope = (
  detail: ConfigState | PublicConfigEnvelope | null | undefined
): detail is PublicConfigEnvelope => {
  return !!detail && typeof detail === 'object' && 'config' in detail
}

export class ConfigService {
  static async getConfig(): Promise<ApiResponse<ConfigState>> {
    return api.get('/admin/config/get')
  }

  static async getUserConfig(): Promise<ApiResponse<ConfigState>> {
    try {
      const response = (await api.get('/api/v1/config')) as ApiResponse<
        ConfigState | PublicConfigEnvelope
      >

      if (isPublicConfigEnvelope(response.detail) && response.detail.config) {
        return {
          ...response,
          detail: response.detail.config as ConfigState
        }
      }

      return response as ApiResponse<ConfigState>
    } catch {
      return api.post('/')
    }
  }

  static async updateConfig(config: Partial<ConfigState>): Promise<ApiResponse> {
    return api.patch('/admin/config/update', config)
  }
}
