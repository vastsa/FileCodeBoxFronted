<template>
  <div class="mt-4 flex items-center justify-between px-6 py-4 border-t"
    :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']">
    <div class="flex items-center text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
      显示第 {{ (currentPage - 1) * pageSize + 1 }} 到
      {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
    </div>

    <div class="flex items-center space-x-2">
      <button @click="$emit('page-change', currentPage - 1)" :disabled="currentPage === 1"
        class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200" :class="[
          isDarkMode
            ? currentPage === 1
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]">
        <ChevronLeftIcon class="w-4 h-4" />
        上一页
      </button>

      <div class="flex items-center space-x-1">
        <template v-for="pageNum in displayedPages" :key="pageNum">
          <button v-if="pageNum !== '...'" @click="$emit('page-change', pageNum as number)"
            class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200" :class="[
              currentPage === pageNum
                ? 'bg-indigo-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
            {{ pageNum }}
          </button>
          <span v-else class="px-2" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
            ...
          </span>
        </template>
      </div>

      <button @click="$emit('page-change', currentPage + 1)" :disabled="currentPage >= totalPages"
        class="inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200" :class="[
          isDarkMode
            ? currentPage >= totalPages
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : currentPage >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]">
        下一页
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

interface Props {
  currentPage: number
  pageSize: number
  total: number
}

const props = defineProps<Props>()

defineEmits<{
  'page-change': [page: number]
}>()

const isDarkMode = inject('isDarkMode')

// 计算总页数
const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

// 计算要显示的页码
const displayedPages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const delta = 2 // 当前页码前后显示的页码数

  const pages: (number | string)[] = []

  // 始终显示第一页
  pages.push(1)

  // 计算显示范围
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)

  // 添加省略号和页码
  if (left > 2) {
    pages.push('...')
  }

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (right < total - 1) {
    pages.push('...')
  }

  // 始终显示最后一页
  if (total > 1) {
    pages.push(total)
  }

  return pages
})
</script>