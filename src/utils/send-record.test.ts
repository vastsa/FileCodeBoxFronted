import { describe, expect, it } from 'vitest'

import { isExpirationWithinLimit } from './send-record'

describe('isExpirationWithinLimit', () => {
  it('allows forever and count based expirations regardless of max seconds', () => {
    expect(isExpirationWithinLimit('forever', '9999', 60)).toBe(true)
    expect(isExpirationWithinLimit('count', '9999', 60)).toBe(true)
  })

  it('allows any time based expiration when max seconds is disabled', () => {
    expect(isExpirationWithinLimit('day', '365', 0)).toBe(true)
  })

  it('checks minute, hour, and day values against max seconds', () => {
    expect(isExpirationWithinLimit('minute', '30', 3600)).toBe(true)
    expect(isExpirationWithinLimit('hour', '2', 3600)).toBe(false)
    expect(isExpirationWithinLimit('day', '2', 86400)).toBe(false)
  })

  it('rejects unsupported expiration methods', () => {
    expect(isExpirationWithinLimit('week', '1', 604800)).toBe(false)
  })
})
