/**
 * 剪贴板工具函数
 */

import { buildRetrieveUrl, buildWgetCommand } from '@/utils/share-url'

type CopyNotifyType = 'success' | 'error'

interface CopyOptions {
  successMsg?: string
  errorMsg?: string
  showMsg?: boolean
  notify?: (message: string, type: CopyNotifyType) => void
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param options 配置选项
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (
  text: string,
  options: CopyOptions = {}
): Promise<boolean> => {
  const {
    successMsg = '复制成功',
    errorMsg = '复制失败，请手动复制',
    showMsg = true,
    notify
  } = options

  const showCopyMessage = (message: string, type: CopyNotifyType) => {
    if (showMsg) {
      notify?.(message, type)
    }
  }

  try {
    // 优先使用 Clipboard API
    if (document.hasFocus() && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      showCopyMessage(successMsg, 'success')
      return true
    }
    // 后备方案：使用传统的复制方法
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (success) {
      showCopyMessage(successMsg, 'success')
      return true
    } else {
      throw new Error('execCommand copy failed')
    }
  } catch (err) {
    console.error('复制失败:', err)
    showCopyMessage(errorMsg, 'error')
    return false
  }
}

/**
 * 生成并复制取件链接
 * @param code 取件码
 * @returns Promise<boolean> 是否复制成功
 */
export const copyRetrieveLink = async (
  code: string,
  options: Pick<CopyOptions, 'notify' | 'showMsg'> = {}
): Promise<boolean> => {
  const link = buildRetrieveUrl(code)
  return copyToClipboard(link, {
    successMsg: '取件链接已复制到剪贴板',
    errorMsg: '复制失败，请手动复制取件链接',
    ...options
  })
}

/**
 * 复制取件码
 * @param code 取件码
 * @returns Promise<boolean> 是否复制成功
 */
export const copyRetrieveCode = async (
  code: string,
  options: Pick<CopyOptions, 'notify' | 'showMsg'> = {}
): Promise<boolean> => {
  return copyToClipboard(code, {
    successMsg: '取件码已复制到剪贴板',
    errorMsg: '复制失败，请手动复制取件码',
    ...options
  })
}

export const copyWgetCommand = (
  retrieveCode: string,
  fileName: string,
  options: Pick<CopyOptions, 'notify' | 'showMsg'> = {}
) => {
  const command = buildWgetCommand(retrieveCode, fileName)
  void copyToClipboard(command, {
    successMsg: '命令已复制到剪贴板',
    errorMsg: '复制失败，请手动复制命令',
    ...options
  })
}
