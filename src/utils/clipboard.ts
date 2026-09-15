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

  // HTTPS 优先调用现代接口；权限拒绝后仍继续兼容路径，不能直接结束复制流程。
  if (window.isSecureContext && document.hasFocus() && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      showCopyMessage(successMsg, 'success')
      return true
    } catch { /* HTTP 或浏览器策略限制时交由下方降级处理。 */ }
  }
  const textarea = document.createElement('textarea')
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  try {
    // 在用户点击链内执行兼容复制；始终清理节点，不记录任何口令内容。
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    if (success) {
      showCopyMessage(successMsg, 'success')
      return true
    } else {
      throw new Error('execCommand copy failed')
    }
  } catch {
    showCopyMessage(errorMsg, 'error')
    return false
  } finally {
    textarea.remove()
    focused?.focus({ preventScroll: true })
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
