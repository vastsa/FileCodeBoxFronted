export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  detail?: T
}

export interface ApiErrorPayload {
  detail?: string
  message?: string
}
