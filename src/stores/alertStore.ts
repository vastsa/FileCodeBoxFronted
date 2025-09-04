import { defineStore } from 'pinia'
import type { Alert, AlertType } from '@/types'
import { TIME_CONSTANTS } from '@/constants'

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alerts: [] as Alert[]
  }),
  actions: {
    showAlert(
      message: string,
      type: AlertType = 'info',
      duration = TIME_CONSTANTS.ALERT_DURATION
    ) {
      const id = Date.now()
      const startTime = Date.now()
      this.alerts.push({ id, message, type, progress: 100, duration, startTime })
      setTimeout(() => this.removeAlert(id), duration)
    },
    removeAlert(id: number) {
      const index = this.alerts.findIndex((alert) => alert.id === id)
      if (index > -1) {
        this.alerts.splice(index, 1)
      }
    },
    updateAlertProgress(id: number) {
      const alert = this.alerts.find((a) => a.id === id)
      if (alert) {
        const elapsedTime = Date.now() - alert.startTime
        const progress = 100 - (elapsedTime / alert.duration) * 100
        alert.progress = Math.max(0, progress)
        if (alert.progress <= 0) {
          this.removeAlert(id)
        }
      }
    }
  }
})
