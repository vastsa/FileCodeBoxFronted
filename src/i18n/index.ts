import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 获取浏览器语言设置
const getDefaultLocale = (): string => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale) {
    return savedLocale
  }
  
  const browserLocale = navigator.language.toLowerCase()
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true // 全局注入 $t 函数
})

export default i18n

// 导出切换语言的函数
export const setLocale = (locale: string) => {
  i18n.global.locale.value = locale as 'zh-CN' | 'en-US'
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
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