import { FileService, uploadChunkedFile } from '@/services'
import type { AlertType, ApiResponse, ExpireStyle, UploadProgress } from '@/types'
import { calculateFileHash, packFilesAsZip } from '@/utils/file-processing'
import { usePresignedUpload } from './usePresignedUpload'

type Translate = (
  key: string,
  params?: Record<string, string | number | undefined>
) => string

type UseSendSubmitOptions = {
  getMaxFileSize: () => number
  notify: (message: string, type: AlertType) => void
  translate: Translate
  onProgress: (progress: UploadProgress) => void
  onHashCalculated: (hash: string) => void
}

type SubmitFileOptions = {
  selectedFile: File | null
  selectedFiles: File[]
  expireValue: number
  expireStyle: string
  enableChunk: boolean
  validateFileSize: (file: File) => boolean
}

type SubmitTextOptions = {
  text: string
  expireValue: number
  expireStyle: string
}

export function useSendSubmit(options: UseSendSubmitOptions) {
  const { uploadFile: presignUploadFile, reset: resetPresignUpload } = usePresignedUpload({
    getMaxFileSize: options.getMaxFileSize,
    notify: options.notify
  })

  const handleChunkUpload = async (
    file: File,
    expireValue: number,
    expireStyle: string
  ): Promise<ApiResponse> => {
    return uploadChunkedFile(file, {
      expireValue,
      expireStyle,
      onHashCalculated: options.onHashCalculated,
      onProgress: (progress: UploadProgress) => {
        options.onProgress(progress)
      },
      messages: {
        initFailed: options.translate('send.messages.initChunkUploadFailed'),
        chunkFailed: (index) => options.translate('send.messages.chunkUploadFailed', { index }),
        completeFailed: options.translate('send.messages.completeUploadFailed')
      }
    })
  }

  const handlePresignedUpload = async (
    file: File,
    expireValue: number,
    expireStyle: string
  ): Promise<ApiResponse<{ code?: string; name?: string }>> => {
    const code = await presignUploadFile(file, {
      expireValue,
      expireStyle: expireStyle as ExpireStyle,
      onProgress: (progress) => {
        options.onProgress(progress)
      }
    })

    if (!code) {
      throw new Error(options.translate('send.messages.uploadFailed'))
    }

    return {
      code: 200,
      detail: {
        code,
        name: file.name
      }
    }
  }

  const submitFile = async ({
    selectedFile,
    selectedFiles,
    expireValue,
    expireStyle,
    enableChunk,
    validateFileSize
  }: SubmitFileOptions): Promise<ApiResponse | null> => {
    let fileToUpload = selectedFile

    if (selectedFiles.length > 0) {
      options.notify('正在打包文件...', 'success')
      fileToUpload = await packFilesAsZip(selectedFiles)
      if (!validateFileSize(fileToUpload)) {
        return null
      }
      options.onHashCalculated(await calculateFileHash(fileToUpload))
    }

    if (!fileToUpload) {
      throw new Error(options.translate('send.messages.selectFile'))
    }

    return enableChunk
      ? handleChunkUpload(fileToUpload, expireValue, expireStyle)
      : handlePresignedUpload(fileToUpload, expireValue, expireStyle)
  }

  const submitText = ({ text, expireValue, expireStyle }: SubmitTextOptions) =>
    FileService.uploadText(text, expireValue, expireStyle)

  return {
    resetPresignUpload,
    submitFile,
    submitText
  }
}
