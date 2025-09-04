<template>
  <div class="flex-grow overflow-y-auto p-6">
    <transition-group name="list" tag="div" class="space-y-4">
      <div
        v-for="record in records"
        :key="record.id"
        class="bg-opacity-50 rounded-lg p-4 flex items-center shadow-md hover:shadow-lg transition duration-300 transform hover:scale-102"
        :class="[isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-white']"
      >
        <div class="flex-shrink-0 mr-4">
          <FileIcon
            class="w-10 h-10"
            :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
          />
        </div>
        <div class="flex-grow min-w-0 mr-4">
          <p
            class="font-medium text-lg truncate"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ record.filename }}
          </p>
          <p
            class="text-sm truncate"
            :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']"
          >
            {{ record.date }} · {{ record.size }}
          </p>
        </div>
        <div class="flex-shrink-0 flex space-x-2">
          <button
            @click="$emit('view-details', record)"
            class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
            :class="[
              isDarkMode
                ? 'hover:bg-indigo-400 text-indigo-400'
                : 'hover:bg-indigo-100 text-indigo-600'
            ]"
          >
            <EyeIcon class="w-5 h-5" />
          </button>
          <button
            @click="$emit('download-record', record)"
            class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
            :class="[
              isDarkMode
                ? 'hover:bg-green-400 text-green-400'
                : 'hover:bg-green-100 text-green-600'
            ]"
          >
            <DownloadIcon class="w-5 h-5" />
          </button>
          <button
            @click="$emit('delete-record', record.id)"
            class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
            :class="[
              isDarkMode ? 'hover:bg-red-400 text-red-400' : 'hover:bg-red-100 text-red-600'
            ]"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { FileIcon, EyeIcon, DownloadIcon, TrashIcon } from 'lucide-vue-next'

interface FileRecord {
  id: number
  code: string
  filename: string
  size: string
  downloadUrl: string | null
  content: string | null
  date: string
}

interface Props {
  records: FileRecord[]
}

interface Emits {
  'view-details': [record: FileRecord]
  'download-record': [record: FileRecord]
  'delete-record': [id: number]
}

defineProps<Props>()
defineEmits<Emits>()
const isDarkMode = inject('isDarkMode')
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>