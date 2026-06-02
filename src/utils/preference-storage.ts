import { STORAGE_KEYS } from '@/constants'
import type { ThemeMode } from '@/types'

const LOCALE_STORAGE_KEY = 'locale'

export function readStoredThemeMode(): string | null {
  return localStorage.getItem(STORAGE_KEYS.COLOR_MODE)
}

export function writeStoredThemeMode(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEYS.COLOR_MODE, mode)
}

export function readStoredLocale(): string | null {
  return localStorage.getItem(LOCALE_STORAGE_KEY)
}

export function writeStoredLocale(locale: string) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
