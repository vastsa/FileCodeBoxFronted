import type { ConfigState } from '@/types'

export type FileSizeUnit = 'KB' | 'MB' | 'GB'
export type SaveTimeUnit = '秒' | '分' | '时' | '天'

export type FileSizeForm = {
  value: number
  unit: FileSizeUnit
}

export type SaveTimeForm = {
  value: number
  unit: SaveTimeUnit
}

const FILE_SIZE_UNITS: Record<FileSizeUnit, number> = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
}

const SAVE_TIME_UNITS: Record<SaveTimeUnit, number> = {
  秒: 1,
  分: 60,
  时: 3600,
  天: 86400
}

export function bytesToFileSizeForm(bytes: number): FileSizeForm {
  if (bytes >= FILE_SIZE_UNITS.GB) {
    return {
      value: Math.round(bytes / FILE_SIZE_UNITS.GB),
      unit: 'GB'
    }
  }

  if (bytes >= FILE_SIZE_UNITS.MB) {
    return {
      value: Math.round(bytes / FILE_SIZE_UNITS.MB),
      unit: 'MB'
    }
  }

  return {
    value: Math.round(bytes / FILE_SIZE_UNITS.KB),
    unit: 'KB'
  }
}

export function fileSizeFormToBytes(value: number, unit: FileSizeUnit): number {
  return value * FILE_SIZE_UNITS[unit]
}

export function secondsToSaveTimeForm(seconds: number): SaveTimeForm {
  if (seconds === 0) {
    return {
      value: 7,
      unit: '天'
    }
  }

  if (seconds % SAVE_TIME_UNITS.天 === 0 && seconds >= SAVE_TIME_UNITS.天) {
    return {
      value: seconds / SAVE_TIME_UNITS.天,
      unit: '天'
    }
  }

  if (seconds % SAVE_TIME_UNITS.时 === 0 && seconds >= SAVE_TIME_UNITS.时) {
    return {
      value: seconds / SAVE_TIME_UNITS.时,
      unit: '时'
    }
  }

  if (seconds % SAVE_TIME_UNITS.分 === 0 && seconds >= SAVE_TIME_UNITS.分) {
    return {
      value: seconds / SAVE_TIME_UNITS.分,
      unit: '分'
    }
  }

  return {
    value: seconds,
    unit: '秒'
  }
}

export function saveTimeFormToSeconds(value: number, unit: SaveTimeUnit): number {
  if (value === 0) {
    return 7 * SAVE_TIME_UNITS.天
  }

  return value * SAVE_TIME_UNITS[unit]
}

export function buildConfigSubmitPayload(
  config: ConfigState,
  fileSize: FileSizeForm,
  saveTime: SaveTimeForm
): ConfigState {
  return {
    ...config,
    uploadSize: fileSizeFormToBytes(fileSize.value, fileSize.unit),
    max_save_seconds: saveTimeFormToSeconds(saveTime.value, saveTime.unit)
  }
}
