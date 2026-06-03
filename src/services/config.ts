import api from './client'
import type { ApiResponse, ConfigState, PublicConfigPayload } from '@/types'

const isPublicConfigEnvelope = (
  detail: ConfigState | PublicConfigPayload | null | undefined
): detail is PublicConfigPayload => {
  return !!detail && typeof detail === 'object' && 'config' in detail
}

const normalizeUserConfigResponse = (
  response: ApiResponse<ConfigState | PublicConfigPayload>
): ApiResponse<PublicConfigPayload> => {
  if (isPublicConfigEnvelope(response.detail)) {
    return {
      ...response,
      detail: {
        config: response.detail.config,
        meta: response.detail.meta
      }
    }
  }

  return {
    ...response,
    detail: {
      config: response.detail ?? {}
    }
  }
}

export class ConfigService {
  static async getConfig(): Promise<ApiResponse<ConfigState>> {
    return api.get('/admin/config/get')
  }

  static async getUserConfig(): Promise<ApiResponse<PublicConfigPayload>> {
    try {
      const response = (await api.get('/api/v1/config')) as ApiResponse<
        ConfigState | PublicConfigPayload
      >

      return normalizeUserConfigResponse(response)
    } catch {
      const response = (await api.post('/')) as ApiResponse<ConfigState>
      return normalizeUserConfigResponse(response)
    }
  }

  static async updateConfig(config: Partial<ConfigState>): Promise<ApiResponse> {
    return api.patch('/admin/config/update', config)
  }
}
