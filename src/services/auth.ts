import api from './client'
import type { AdminUser, ApiResponse } from '@/types'

export class AuthService {
  static async login(password: string): Promise<ApiResponse<AdminUser>> {
    return api.post('/admin/login', { password })
  }

  static async logout(): Promise<ApiResponse> {
    return api.post('/admin/logout')
  }

  static async verifyToken(): Promise<ApiResponse<AdminUser>> {
    return api.get('/admin/verify')
  }
}
