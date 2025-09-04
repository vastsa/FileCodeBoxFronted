<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- 模态框容器 -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            ref="modalRef"
            class="relative transform overflow-hidden rounded-lg shadow-xl transition-all"
            :class="[
              sizeClasses,
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            ]"
            @click.stop
          >
            <!-- 头部 -->
            <div
              v-if="$slots.header || title"
              class="flex items-center justify-between px-6 py-4 border-b"
              :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']"
            >
              <slot name="header">
                <h3 class="text-lg font-medium" :class="[isDarkMode ? 'text-white' : 'text-gray-900']">
                  {{ title }}
                </h3>
              </slot>
              <button
                v-if="closable"
                @click="$emit('close')"
                class="rounded-md p-2 transition-colors"
                :class="[
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
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
              :class="[isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50']"
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