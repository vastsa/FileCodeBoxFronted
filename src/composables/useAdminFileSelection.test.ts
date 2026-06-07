import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useAdminFileSelection } from './useAdminFileSelection'

describe('useAdminFileSelection', () => {
  it('tracks selected files and current page selection state', () => {
    const files = ref([{ id: 1 }, { id: 2 }, { id: 3 }])
    const selection = useAdminFileSelection(files)

    expect(selection.hasSelectedFiles.value).toBe(false)
    expect(selection.isAllCurrentPageSelected.value).toBe(false)

    selection.toggleFileSelection(1)

    expect(selection.selectedFileIds.value).toEqual(new Set([1]))
    expect(selection.selectedCount.value).toBe(1)
    expect(selection.hasSelectedFiles.value).toBe(true)
    expect(selection.isCurrentPagePartiallySelected.value).toBe(true)

    selection.toggleCurrentPageSelection()

    expect(selection.selectedFileIds.value).toEqual(new Set([1, 2, 3]))
    expect(selection.isAllCurrentPageSelected.value).toBe(true)
    expect(selection.isCurrentPagePartiallySelected.value).toBe(false)

    selection.toggleCurrentPageSelection()

    expect(selection.selectedFileIds.value.size).toBe(0)
  })

  it('removes selected ids that are no longer visible on the current page', () => {
    const files = ref([{ id: 1 }, { id: 2 }, { id: 3 }])
    const selection = useAdminFileSelection(files)

    selection.toggleCurrentPageSelection()
    files.value = [{ id: 2 }, { id: 4 }]
    selection.syncSelectedFilesWithCurrentPage()

    expect(selection.selectedFileIds.value).toEqual(new Set([2]))
  })
})
