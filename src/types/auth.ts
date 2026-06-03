export interface AdminUser {
  id: string
  username: string
  token: string
  token_type?: string
  expires_at?: number
}
