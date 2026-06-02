import axios from 'axios'
import type { UploadProgress } from '@/types'

export async function uploadToExternalUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    timeout: 0,
    onUploadProgress: (progressEvent) => {
      if (!onProgress || !progressEvent.total) {
        return
      }

      onProgress({
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
      })
    }
  })
}
