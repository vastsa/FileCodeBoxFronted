/**
 * 剪贴板工具函数
 */

import { useAlertStore } from '@/stores/alertStore'
const alertStore = useAlertStore();
interface CopyOptions {
  successMsg?: string
  errorMsg?: string
  showMsg?: boolean
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
  const { successMsg = '复制成功', errorMsg = '复制失败，请手动复制', showMsg = true } = options

  const alertStore = useAlertStore()

  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      if (showMsg) alertStore.showAlert(successMsg, 'success')
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
      if (showMsg) alertStore.showAlert(successMsg, 'success')
      return true
    } else {
      throw new Error('execCommand copy failed')
    }
  } catch (err) {
    console.error('复制失败:', err)
    if (showMsg) alertStore.showAlert(errorMsg, 'error')
    return false
  }
}

/**
 * 生成并复制取件链接
 * @param code 取件码
 * @returns Promise<boolean> 是否复制成功
 */
export const copyRetrieveLink = async (code: string): Promise<boolean> => {
  const link = `${window.location.origin}/#/?code=${code}`
  return copyToClipboard(link, {
    successMsg: '取件链接已复制到剪贴板',
    errorMsg: '复制失败，请手动复制取件链接'
  })
}

/**
 * 复制取件码
 * @param code 取件码
 * @returns Promise<boolean> 是否复制成功
 */
export const copyRetrieveCode = async (code: string): Promise<boolean> => {
  return copyToClipboard(code, {
    successMsg: '取件码已复制到剪贴板',
    errorMsg: '复制失败，请手动复制取件码'
  })
}

const baseUrl = window.location.origin + '/#/';

/*export const copyWgetCommand = (retrieveCode: string, fileName: any) => {
  //wget https://share.lanol.cn/share/select?code=17634
  const command = `wget ${baseUrl}share/select?code=${retrieveCode} -O "${fileName}"`;
  navigator.clipboard.writeText(command).then(() => {
    alertStore.showAlert('wget命令已复制到剪贴板', 'success');
  }).catch(() => {
    alertStore.showAlert('复制wget命令失败', 'error');
  });
};*/

export const copyWgetCommand = (retrieveCode: string, fileName: string) => {
  // const command = `wget ${window.location.origin}/download/${retrieveCode} -O ${filename}`;
  const command = `wget ${baseUrl}share/select?code=${retrieveCode} -O "${fileName}"`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(command)
      .then(() => {
        console.log("命令已复制到剪贴板！");
      })
      .catch((err) => {
        console.error("复制失败，使用回退方法：", err);
        fallbackCopyTextToClipboard(command);
      });
  } else {
    console.warn("Clipboard API 不可用，使用回退方法。");
    fallbackCopyTextToClipboard(command);
  }
};
function fallbackCopyTextToClipboard(text:string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; // 避免滚动
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand("copy");
    console.log("回退复制操作成功：", successful);
  } catch (err) {
    console.error("回退复制操作失败：", err);
  }
  document.body.removeChild(textArea);
}

if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText("要复制的文本");
} else {
  fallbackCopyTextToClipboard("要复制的文本");
}