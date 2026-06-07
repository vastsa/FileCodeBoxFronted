import { describe, expect, it } from 'vitest'

import {
  buildDefaultViewPresetParams,
  normalizeViewPresetParams
} from './admin-file-view-preset'

describe('admin file view preset helpers', () => {
  it('builds default params for the all-files view', () => {
    expect(buildDefaultViewPresetParams()).toEqual({
      keyword: '',
      status: 'all',
      type: 'all',
      health: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      size: 10
    })
  })

  it('normalizes legacy and unsafe preset values', () => {
    expect(
      normalizeViewPresetParams({
        keyword: '  report  ',
        status: 'ACTIVE',
        type: 'chunked',
        health: 'storage-issue',
        sort_by: 'used_count',
        sort_order: 'ASC',
        size: 250
      })
    ).toEqual({
      keyword: 'report',
      status: 'active',
      type: 'chunked',
      health: 'storage_issue',
      sortBy: 'used_count',
      sortOrder: 'asc',
      size: 100
    })
  })

  it('falls back when preset params are invalid', () => {
    expect(
      normalizeViewPresetParams({
        status: 'deleted',
        type: 'folder',
        health: 'unknown',
        sortBy: 'createdAt',
        sortOrder: 'latest',
        size: 'bad'
      })
    ).toEqual(buildDefaultViewPresetParams())
  })
})
