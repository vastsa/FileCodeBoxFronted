import { computed, ref, type Ref } from 'vue'

type SelectableFile = {
  id: number
}

export function useAdminFileSelection<T extends SelectableFile>(tableData: Ref<T[]>) {
  const selectedFileIds = ref<Set<number>>(new Set())
  const currentPageSelectedCount = computed(
    () => tableData.value.filter((file) => selectedFileIds.value.has(file.id)).length
  )
  const selectedCount = computed(() => selectedFileIds.value.size)
  const hasSelectedFiles = computed(() => selectedCount.value > 0)
  const isAllCurrentPageSelected = computed(
    () => tableData.value.length > 0 && currentPageSelectedCount.value === tableData.value.length
  )
  const isCurrentPagePartiallySelected = computed(
    () => currentPageSelectedCount.value > 0 && !isAllCurrentPageSelected.value
  )

  const syncSelectedFilesWithCurrentPage = () => {
    const visibleIds = new Set(tableData.value.map((file) => file.id))
    selectedFileIds.value = new Set(
      Array.from(selectedFileIds.value).filter((id) => visibleIds.has(id))
    )
  }

  const clearSelection = () => {
    selectedFileIds.value = new Set()
  }

  const toggleFileSelection = (id: number) => {
    const nextSelectedIds = new Set(selectedFileIds.value)
    if (nextSelectedIds.has(id)) {
      nextSelectedIds.delete(id)
    } else {
      nextSelectedIds.add(id)
    }
    selectedFileIds.value = nextSelectedIds
  }

  const toggleCurrentPageSelection = () => {
    if (isAllCurrentPageSelected.value) {
      clearSelection()
      return
    }

    selectedFileIds.value = new Set(tableData.value.map((file) => file.id))
  }

  return {
    selectedFileIds,
    currentPageSelectedCount,
    selectedCount,
    hasSelectedFiles,
    isAllCurrentPageSelected,
    isCurrentPagePartiallySelected,
    syncSelectedFilesWithCurrentPage,
    clearSelection,
    toggleFileSelection,
    toggleCurrentPageSelection
  }
}
