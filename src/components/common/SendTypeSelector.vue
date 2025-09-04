<template>
  <div class="flex justify-center space-x-4 mb-6">
    <button
      type="button"
      @click="selectType('file')"
      :class="[
        'px-4 py-2 rounded-lg transition-colors duration-300',
        selectedType === 'file' 
          ? 'bg-indigo-600 text-white' 
          : isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      ]"
    >
      {{ t('nav.sendFile') }}
    </button>
    <button
      type="button"
      @click="selectType('text')"
      :class="[
        'px-4 py-2 rounded-lg transition-colors duration-300',
        selectedType === 'text' 
          ? 'bg-indigo-600 text-white' 
          : isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      ]"
    >
      {{ t('send.sendText') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { SendType } from '@/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  selectedType: SendType
}

interface Emits {
  'update:selectedType': [type: SendType]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const isDarkMode = inject('isDarkMode')

const selectType = (type: SendType) => {
  emit('update:selectedType', type)
}
</script>