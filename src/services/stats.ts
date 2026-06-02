import api from './client'
import type {
  ApiResponse,
  DashboardActivitiesParams,
  DashboardActivitiesResponse,
  DashboardData
} from '@/types'

export class StatsService {
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get('/admin/dashboard')
  }

  static async getActivities(
    params: DashboardActivitiesParams
  ): Promise<ApiResponse<DashboardActivitiesResponse>> {
    return api.get('/admin/activities', { params })
  }
}
