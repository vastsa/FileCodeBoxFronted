<template>
  <form @submit.prevent="$emit('submit')">
    <div class="mb-6 relative">
      <label
        for="code"
        class="block text-sm font-medium mb-2"
        :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
        >取件码</label
      >
      <div class="relative">
        <input
          id="code"
          v-model="code"
          type="text"
          ref="codeInput"
          class="w-full px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 pr-10"
          :class="[
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100',
            { 'ring-2 ring-red-500': error },
            isDarkMode ? 'text-gray-300' : 'text-gray-800'
          ]"
          placeholder="请输入5位取件码"
          required
          :readonly="inputStatus.readonly"
          maxlength="5"
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
        />
        <div
          v-if="inputStatus.loading"
          class="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <span
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"
          ></span>
        </div>
      </div>
      <div
        class="absolute -bottom-0.5 left-2 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-in-out"
        :class="{ 'w-97-100': isInputFocused, 'w-0': !isInputFocused }"
      ></div>
    </div>
    <button
      type="submit"
      class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group"
      :disabled="inputStatus.loading"
    >
      <span class="flex items-center justify-center relative z-10">
        <span>{{ inputStatus.loading ? '处理中...' : '提取文件' }}</span>
        <ArrowRightIcon
          class="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
        />
      </span>
      <span
        class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { ArrowRightIcon } from 'lucide-vue-next'

interface InputStatus {
  readonly: boolean
  loading: boolean
}

interface Props {
  inputStatus: InputStatus
  error?: boolean
}

interface Emits {
  submit: []
  'update:code': [value: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')
const code = ref('')
const isInputFocused = ref(false)
const codeInput = ref<HTMLInputElement>()

watch(code, (newValue) => {
  emit('update:code', newValue)
})

defineExpose({
  focus: () => codeInput.value?.focus()
})
</script>

<style scoped>
.w-97-100 {
  width: calc(100% - 1rem);
}
</style>