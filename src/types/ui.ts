export type ThemeMode = 'light' | 'dark' | 'system'

export type SendType = 'file' | 'text'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: number
  message: string
  type: AlertType
  progress: number
  duration: number
  startTime: number
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface RouteConfig {
  path: string
  name: string
  component: () => Promise<{ default: object }>
  meta?: {
    requiresAuth?: boolean
    title?: string
  }
}
