import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import { readStoredLocale, writeStoredLocale } from '@/utils/preference-storage'

type SupportedLocale = 'zh-CN' | 'en-US'

const normalizeLocale = (locale: string | null | undefined): SupportedLocale | null => {
  if (!locale) return null

  const normalized = locale.trim().toLowerCase()
  if (normalized === 'zh' || normalized.startsWith('zh-')) return 'zh-CN'
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en-US'

  return null
}

// 获取浏览器语言设置
const getDefaultLocale = (): SupportedLocale => {
  const savedLocale = normalizeLocale(readStoredLocale())
  if (savedLocale) {
    writeStoredLocale(savedLocale)
    return savedLocale
  }

  return normalizeLocale(navigator.language) ?? 'en-US'
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const defaultLocale = getDefaultLocale()

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true, // 全局注入 $t 函数
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV
})

document.documentElement.lang = defaultLocale

export default i18n

// 导出切换语言的函数
export const setLocale = (locale: string) => {
  const nextLocale = normalizeLocale(locale) ?? 'zh-CN'
  i18n.global.locale.value = nextLocale
  writeStoredLocale(nextLocale)
  document.documentElement.lang = nextLocale
}

// 导出获取当前语言的函数
export const getCurrentLocale = () => {
  return i18n.global.locale.value
}

// 导出可用语言列表
export const availableLocales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' }
]
