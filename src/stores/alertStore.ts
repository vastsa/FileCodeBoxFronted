import { defineStore } from 'pinia'
import type { Alert, AlertType } from '@/types'
import { TIME_CONSTANTS } from '@/constants'

let progressTimer: ReturnType<typeof setInterval> | null = null
let alertIdSeed = 0
const alertRemoveTimers = new Map<number, ReturnType<typeof setTimeout>>()

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
      const id = Date.now() + alertIdSeed
      alertIdSeed = (alertIdSeed + 1) % 1000
      const startTime = Date.now()
      this.alerts.push({ id, message, type, progress: 100, duration, startTime })
      alertRemoveTimers.set(id, setTimeout(() => this.removeAlert(id), duration))
      this.startProgressTimer()
    },
    removeAlert(id: number) {
      const removeTimer = alertRemoveTimers.get(id)
      if (removeTimer) {
        clearTimeout(removeTimer)
        alertRemoveTimers.delete(id)
      }

      const index = this.alerts.findIndex((alert) => alert.id === id)
      if (index > -1) {
        this.alerts.splice(index, 1)
      }

      if (this.alerts.length === 0) {
        this.stopProgressTimer()
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
    },
    startProgressTimer() {
      if (progressTimer || this.alerts.length === 0) {
        return
      }

      progressTimer = setInterval(() => {
        this.alerts.forEach((alert) => {
          this.updateAlertProgress(alert.id)
        })
      }, TIME_CONSTANTS.PROGRESS_UPDATE_INTERVAL)
    },
    stopProgressTimer() {
      if (!progressTimer) {
        return
      }

      clearInterval(progressTimer)
      progressTimer = null
    }
  }
})
