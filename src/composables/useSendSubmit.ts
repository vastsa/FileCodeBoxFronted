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
  expire_style: string
  enable_chunk: boolean
  validateFileSize: (file: File) => boolean
}

type SubmitTextOptions = {
  text: string
  expireValue: number
  expire_style: string
}

export function useSendSubmit(options: UseSendSubmitOptions) {
  const { uploadFile: presignUploadFile, reset: resetPresignUpload } = usePresignedUpload({
    getMaxFileSize: options.getMaxFileSize,
    notify: options.notify
  })

  const handleChunkUpload = async (
    file: File,
    expireValue: number,
    expire_style: string
  ): Promise<ApiResponse> => {
    return uploadChunkedFile(file, {
      expireValue,
      expire_style,
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
    expire_style: string
  ): Promise<ApiResponse<{ code?: string; name?: string }>> => {
    const code = await presignUploadFile(file, {
      expireValue,
      expire_style: expire_style as ExpireStyle,
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
    expire_style,
    enable_chunk,
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

    return enable_chunk
      ? handleChunkUpload(fileToUpload, expireValue, expire_style)
      : handlePresignedUpload(fileToUpload, expireValue, expire_style)
  }

  const submitText = ({ text, expireValue, expire_style }: SubmitTextOptions) =>
    FileService.uploadText(text, expireValue, expire_style)

  return {
    resetPresignUpload,
    submitFile,
    submitText
  }
}
