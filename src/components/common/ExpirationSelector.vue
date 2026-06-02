<template>
  <div class="flex flex-col space-y-3">
    <label :class="['text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700']">
      {{ t('send.expiration.label') }}
    </label>
    <div class="relative flex-grow group">
      <div
        :class="[
          'relative h-12 rounded-2xl border transition-all duration-300 shadow-sm',
          isDarkMode
            ? 'bg-gray-800/60 border-gray-700/60 group-hover:border-gray-600/80 group-hover:shadow-lg group-hover:shadow-gray-900/20'
            : 'bg-white border-gray-200 group-hover:border-gray-300 group-hover:shadow-md group-hover:shadow-gray-200/50'
        ]"
      >
        <template v-if="expirationMethod !== 'forever'">
          <input
            :value="expirationValue"
            @input="updateValue"
            type="number"
            :placeholder="getPlaceholder()"
            min="1"
            :class="[
              'w-full h-full px-5 pr-32 rounded-2xl placeholder-gray-400 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              'bg-transparent',
              isDarkMode
                ? 'text-gray-100 focus:ring-indigo-500/80 placeholder-gray-500'
                : 'text-gray-900 focus:ring-indigo-500/60 placeholder-gray-400'
            ]"
          />
          <div
            class="absolute right-28 top-0 h-full flex flex-col border-l"
            :class="[isDarkMode ? 'border-gray-700/60' : 'border-gray-200']"
          >
            <button
              type="button"
              @click="incrementValue(1)"
              class="flex-1 px-2 flex items-center justify-center transition-all duration-200"
              :class="[
                isDarkMode
                  ? 'hover:bg-gray-700/60 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-50 text-gray-500 hover:text-gray-700'
              ]"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              type="button"
              @click="incrementValue(-1)"
              class="flex-1 px-2 flex items-center justify-center transition-all duration-200"
              :class="[
                isDarkMode
                  ? 'hover:bg-gray-700/60 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-50 text-gray-500 hover:text-gray-700'
              ]"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </template>
        <select
          :value="expirationMethod"
          @change="updateMethod"
          :class="[
            'absolute right-0 top-0 h-full appearance-none cursor-pointer transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            expirationMethod === 'forever'
              ? 'w-full px-5 rounded-2xl'
              : 'w-28 pl-4 pr-9 border-l rounded-r-2xl',
            isDarkMode
              ? 'text-gray-100 border-gray-700/60 focus:ring-indigo-500/80 bg-gray-800/60'
              : 'text-gray-900 border-gray-200 focus:ring-indigo-500/60 bg-white'
          ]"
          :style="{
            color: isDarkMode ? '#f3f4f6' : '#111827',
            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#ffffff'
          }"
        >
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :class="[isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900']"
            :style="{
              color: isDarkMode ? '#f3f4f6' : '#111827',
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
            }"
          >
            {{ option.label }}
          </option>
        </select>
        <div
          class="absolute pointer-events-none"
          :class="[
            expirationMethod === 'forever' ? 'right-3' : 'right-2',
            'top-1/2 -translate-y-1/2',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  expirationMethod: string
  expirationValue: string
  options: Array<{
    label: string
    value: string
  }>
}

interface Emits {
  'update:expirationMethod': [value: string]
  'update:expirationValue': [value: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const isDarkMode = inject('isDarkMode')

const updateMethod = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:expirationMethod', target.value)
}

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:expirationValue', target.value)
}

const incrementValue = (delta: number) => {
  const currentValue = parseInt(props.expirationValue) || 0
  const newValue = Math.max(1, currentValue + delta)
  emit('update:expirationValue', newValue.toString())
}

const getPlaceholder = () => {
  switch (props.expirationMethod) {
    case 'count':
      return t('send.expiration.placeholders.count')
    case 'minute':
      return t('send.expiration.placeholders.minutes')
    case 'hour':
      return t('send.expiration.placeholders.hours')
    case 'day':
      return t('send.expiration.placeholders.days')
    default:
      return t('send.expiration.placeholders.default')
  }
}
</script>
