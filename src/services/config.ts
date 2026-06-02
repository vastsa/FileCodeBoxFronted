import api from './client'
import type { ApiResponse, ConfigState } from '@/types'

export class ConfigService {
  static async getConfig(): Promise<ApiResponse<ConfigState>> {
    return api.get('/admin/config/get')
  }

  static async getUserConfig(): Promise<ApiResponse<ConfigState>> {
    return api.post('/')
  }

  static async updateConfig(config: Partial<ConfigState>): Promise<ApiResponse> {
    return api.patch('/admin/config/update', config)
  }
}
