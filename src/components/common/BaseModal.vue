<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm transition-opacity"></div>

        <!-- 模态框容器 -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            ref="modalRef"
            class="relative transform overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all"
            :class="[
              sizeClasses,
              isDarkMode
                ? 'border-white/10 bg-zinc-900/95 shadow-[0_24px_80px_-36px_rgba(255,255,255,0.18)]'
                : 'border-white/80 bg-white/90 shadow-[0_24px_80px_-36px_rgba(24,24,27,0.28)]'
            ]"
            @click.stop
          >
            <!-- 头部 -->
            <div
              v-if="$slots.header || title"
              class="flex items-center justify-between px-6 py-4 border-b"
              :class="[isDarkMode ? 'border-white/10' : 'border-zinc-200/70']"
            >
              <slot name="header">
                <h3
                  class="text-lg font-medium"
                  :class="[isDarkMode ? 'text-white' : 'text-zinc-950']"
                >
                  {{ title }}
                </h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('close')"
                class="rounded-md p-2 transition-colors"
                :class="[
                  isDarkMode
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-white/10'
                    : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                ]"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- 内容 -->
            <div class="px-6 py-4">
              <slot></slot>
            </div>

            <!-- 底部 -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end space-x-3 px-6 py-4 border-t"
              :class="[
                isDarkMode ? 'border-white/10 bg-zinc-950/35' : 'border-zinc-200/70 bg-zinc-50/80'
              ]"
            >
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const isDarkMode = inject('isDarkMode')
const modalRef = ref<HTMLElement>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md w-full',
    md: 'max-w-lg w-full',
    lg: 'max-w-2xl w-full',
    xl: 'max-w-4xl w-full'
  }
  return sizes[props.size]
})

const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}
</style>
