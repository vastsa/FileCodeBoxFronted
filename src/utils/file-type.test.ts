import { describe, expect, it } from 'vitest'

import { buildAcceptedFileTypes, isFileTypeAllowed, normalizeAllowedFileTypes } from './file-type'

describe('file type helpers', () => {
  it('normalizes configured file type rules', () => {
    expect(normalizeAllowedFileTypes(' rar, .zip; image/* ')).toEqual([
      'rar',
      '.zip',
      'image/*'
    ])
    expect(normalizeAllowedFileTypes([])).toEqual(['*'])
    expect(normalizeAllowedFileTypes(null)).toEqual(['*'])
  })

  it('builds input accept attribute values', () => {
    expect(buildAcceptedFileTypes(['*'])).toBe('*')
    expect(buildAcceptedFileTypes(['rar', '.zip', 'image/*'])).toBe('.rar,.zip,image/*')
  })

  it('allows files by extension, exact mime type, and mime wildcard', () => {
    expect(isFileTypeAllowed({ name: 'backup.RAR' }, ['rar'])).toBe(true)
    expect(isFileTypeAllowed({ name: 'archive.zip' }, ['.zip'])).toBe(true)
    expect(isFileTypeAllowed({ name: 'avatar.bin', type: 'image/png' }, ['image/*'])).toBe(true)
    expect(isFileTypeAllowed({ name: 'readme.md', type: 'text/markdown' }, ['text/markdown'])).toBe(
      true
    )
  })

  it('rejects files that do not match configured rules', () => {
    expect(isFileTypeAllowed({ name: 'payload.exe', type: 'application/octet-stream' }, ['rar'])).toBe(
      false
    )
  })
})
