import api from './client'
import type {
  ApiResponse,
  DashboardActivitiesParams,
  DashboardActivitiesResponse,
  DashboardData,
  DashboardMaintenanceQueue
} from '@/types'

export class StatsService {
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get('/admin/dashboard')
  }

  static async getMaintenanceQueue(): Promise<ApiResponse<DashboardMaintenanceQueue>> {
    return api.get('/admin/dashboard/maintenance-queue')
  }

  static async getActivities(
    params: DashboardActivitiesParams
  ): Promise<ApiResponse<DashboardActivitiesResponse>> {
    return api.get('/admin/activities', { params })
  }
}
