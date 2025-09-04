import { ref, computed } from 'vue'
import { STORAGE_KEYS, THEME_MODES } from '@/constants'
import type { ThemeMode } from '@/types'

export function useTheme() {
  // 状态管理
  const isDarkMode = ref(false)
  const themeMode = ref<ThemeMode>(THEME_MODES.SYSTEM)
  
  // 检查系统颜色模式
  const checkSystemColorScheme = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // 从本地存储获取用户之前的选择
  const getUserPreference = (): ThemeMode | null => {
    const storedPreference = localStorage.getItem(STORAGE_KEYS.COLOR_MODE)
    if (storedPreference && Object.values(THEME_MODES).includes(storedPreference as ThemeMode)) {
      return storedPreference as ThemeMode
    }
    return null
  }
  
  // 设置颜色模式
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEYS.COLOR_MODE, mode)
    
    // 根据模式设置实际的暗色模式状态
    if (mode === THEME_MODES.SYSTEM) {
      isDarkMode.value = checkSystemColorScheme()
    } else {
      isDarkMode.value = mode === THEME_MODES.DARK
    }
    
    // 更新 HTML 类名
    updateHtmlClass()
  }
  
  // 更新 HTML 元素的类名
  const updateHtmlClass = () => {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  // 切换主题
  const toggleTheme = () => {
    if (themeMode.value === THEME_MODES.LIGHT) {
      setThemeMode(THEME_MODES.DARK)
    } else if (themeMode.value === THEME_MODES.DARK) {
      setThemeMode(THEME_MODES.SYSTEM)
    } else {
      setThemeMode(THEME_MODES.LIGHT)
    }
  }
  
  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (themeMode.value === THEME_MODES.SYSTEM) {
          isDarkMode.value = e.matches
          updateHtmlClass()
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // 返回清理函数
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    return () => {}
  }
  
  // 初始化主题
  const initTheme = () => {
    const userPreference = getUserPreference()
    if (userPreference) {
      setThemeMode(userPreference)
    } else {
      setThemeMode(THEME_MODES.SYSTEM)
    }
    
    // 设置系统主题监听
    return setupSystemThemeListener()
  }
  
  // 计算属性
  const themeIcon = computed(() => {
    switch (themeMode.value) {
      case THEME_MODES.LIGHT:
        return 'sun'
      case THEME_MODES.DARK:
        return 'moon'
      case THEME_MODES.SYSTEM:
        return 'monitor'
      default:
        return 'monitor'
    }
  })
  
  const themeLabel = computed(() => {
    switch (themeMode.value) {
      case THEME_MODES.LIGHT:
        return '浅色模式'
      case THEME_MODES.DARK:
        return '深色模式'
      case THEME_MODES.SYSTEM:
        return '跟随系统'
      default:
        return '跟随系统'
    }
  })
  
  return {
    // 状态
    isDarkMode,
    themeMode,
    
    // 计算属性
    themeIcon,
    themeLabel,
    
    // 方法
    setThemeMode,
    toggleTheme,
    initTheme,
    checkSystemColorScheme
  }
}