<template>
  <form class="space-y-6 sm:space-y-8" @submit.prevent="$emit('submit')">
    <div class="flex justify-between gap-2 px-1 sm:gap-4 sm:px-2">
      <input
        v-for="(_, index) in codeSlots"
        :key="index"
        :ref="(el) => setInputRef(el, index)"
        :value="codeSlots[index]"
        type="text"
        inputmode="text"
        maxlength="1"
        autocomplete="one-time-code"
        :readonly="inputStatus.readonly"
        :aria-label="`${t('retrieve.codeInput.label')} ${index + 1}`"
        class="h-14 w-12 rounded-xl border text-center text-2xl font-semibold outline-none transition-all duration-300 sm:h-20 sm:w-16 sm:rounded-2xl sm:text-3xl"
        :class="inputClass"
        @input="handleInput($event, index)"
        @keydown="handleKeyDown($event, index)"
        @paste="handlePaste($event, index)"
      />
    </div>

    <button
      type="submit"
      :disabled="isSubmitDisabled"
      class="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 sm:rounded-2xl sm:py-4 sm:text-base"
      :class="submitClass"
    >
      <LoaderCircleIcon
        v-if="inputStatus.loading"
        class="h-4 w-4 animate-spin sm:h-5 sm:w-5"
        :stroke-width="2"
      />
      <CloudDownloadIcon v-else class="h-4 w-4 sm:h-5 sm:w-5" :stroke-width="2" />
      {{ inputStatus.loading ? t('common.loading') : t('retrieve.submit') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { CloudDownloadIcon, LoaderCircleIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useInjectedDarkMode } from '@/composables'

const { t } = useI18n()

interface InputStatus {
  readonly: boolean
  loading: boolean
}

interface Props {
  inputStatus: InputStatus
  error?: boolean
  modelValue: string
}

interface Emits {
  submit: []
  'update:modelValue': [value: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDarkMode = useInjectedDarkMode()
const codeSlots = ref<string[]>(Array(5).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

const joinedCode = computed(() => codeSlots.value.join(''))
const isComplete = computed(() => codeSlots.value.every(Boolean))
const inputStatusLocked = computed(() => props.inputStatus.loading || props.inputStatus.readonly)
const isSubmitDisabled = computed(() => inputStatusLocked.value || !isComplete.value)

const inputClass = computed(() => {
  if (isDarkMode.value) {
    return [
      props.error
        ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/10'
        : 'border-zinc-800 focus:border-zinc-500 focus:ring-white/10',
      'bg-zinc-950/50 text-white focus:bg-zinc-900 focus:ring-2 sm:focus:ring-4 focus:shadow-[0_0_18px_rgba(255,255,255,0.1)]'
    ]
  }

  return [
    props.error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
      : 'border-slate-200 focus:border-zinc-400 focus:ring-zinc-950/10',
    'bg-white text-slate-900 shadow-[inset_0_2px_4px_rgba(15,23,42,0.02)] focus:bg-white focus:ring-2 sm:focus:ring-4 focus:shadow-[0_10px_22px_-12px_rgba(24,24,27,0.2)]'
  ]
})

const submitClass = computed(() => {
  if (isComplete.value && !inputStatusLocked.value) {
    return isDarkMode.value
      ? 'bg-zinc-200 text-zinc-950 shadow-[0_10px_28px_-12px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_34px_-14px_rgba(255,255,255,0.5)]'
      : 'bg-zinc-800 text-white shadow-[0_10px_28px_-12px_rgba(24,24,27,0.35)] hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-[0_16px_34px_-14px_rgba(24,24,27,0.42)]'
  }

  return isDarkMode.value
    ? 'cursor-not-allowed border border-zinc-700/30 bg-zinc-800/50 text-zinc-500'
    : 'cursor-not-allowed border border-slate-200/50 bg-slate-100 text-slate-400'
})

const syncFromModel = (value: string) => {
  const chars = value.slice(0, 5).split('')
  codeSlots.value = Array.from({ length: 5 }, (_, index) => chars[index] ?? '')
}

const emitCode = () => {
  emit('update:modelValue', joinedCode.value)
}

const focusInput = async (index: number) => {
  await nextTick()
  inputRefs.value[Math.max(0, Math.min(index, 4))]?.focus()
}

const setInputRef = (el: unknown, index: number) => {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[index] = el
  }
}

const fillFrom = (value: string, startIndex: number) => {
  const chars = value
    .replace(/\s/g, '')
    .slice(0, 5 - startIndex)
    .split('')
  if (chars.length === 0) return

  chars.forEach((char, offset) => {
    codeSlots.value[startIndex + offset] = char
  })
  emitCode()
  void focusInput(Math.min(startIndex + chars.length, 4))
}

const handleInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value.length > 1) {
    fillFrom(value, index)
    return
  }

  codeSlots.value[index] = value.slice(-1)
  emitCode()

  if (value && index < 4) {
    void focusInput(index + 1)
  }
}

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !codeSlots.value[index] && index > 0) {
    event.preventDefault()
    void focusInput(index - 1)
  }
}

const handlePaste = (event: ClipboardEvent, index: number) => {
  event.preventDefault()
  fillFrom(event.clipboardData?.getData('text') ?? '', index)
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== joinedCode.value) {
      syncFromModel(value)
    }
  },
  { immediate: true }
)

defineExpose({
  focus: () => inputRefs.value[0]?.focus()
})
</script>
