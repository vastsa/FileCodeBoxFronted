<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 font-sans transition-colors duration-700 sm:p-8"
    :class="isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f5f5f7] text-zinc-900'"
    @paste.prevent="handlePaste"
  >
    <div class="relative z-10 w-full max-w-md">
      <div
        class="relative overflow-hidden rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 sm:rounded-[2.5rem]"
        :class="
          isDarkMode
            ? 'border-white/10 bg-zinc-900/75 shadow-[0_24px_80px_-32px_rgba(255,255,255,0.18)]'
            : 'border-white/70 bg-white/80 shadow-[0_24px_70px_-28px_rgba(24,24,27,0.18)]'
        "
      >
        <div
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        ></div>

        <div class="px-5 pb-7 pt-8 sm:px-8 sm:pb-10 sm:pt-12">
          <PageHeader
            :title="t(deliverySession ? 'delivery.title' : 'send.title')"
            :subtitle="
              sendType === 'file'
                ? t('send.uploadArea.placeholder')
                : t('send.uploadArea.textInput')
            "
            mode="send"
            @title-click="toRetrieve"
          />
          <!-- 验证后的寄件授权信息与普通发送表单共存，所有上传交互仍由同一组件处理。 -->
          <div
            v-if="deliverySession"
            class="theme-text-muted mb-5 flex items-center justify-between text-xs"
          >
            <span
              >{{ deliverySession.name }} ·
              {{ t('delivery.remaining', { count: deliverySession.remaining }) }}</span
            >
            <button
              type="button"
              :disabled="isSubmitting"
              class="underline disabled:opacity-50"
              @click="emit('changeDelivery')"
            >
              {{ t('delivery.change') }}
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="space-y-6 sm:space-y-8">
            <SendTypeSelector :selected-type="sendType" @update:selected-type="sendType = $event" />

            <transition name="fade" mode="out-in">
              <div v-if="sendType === 'file'" key="file" class="grid grid-cols-1 gap-8">
                <FileUploadArea
                  class="payload-panel"
                  :selected-file="selectedFile"
                  :selected-files="selectedFiles"
                  :progress="uploadProgress"
                  :uploaded-bytes="uploadedBytes"
                  :total-bytes="totalBytes"
                  :upload-speed="uploadSpeed"
                  :upload-status="isSubmitting ? 'uploading' : 'idle'"
                  :description="uploadDescription"
                  :accepted-types="acceptedTypes"
                  @file-selected="handleFileSelected"
                  @files-selected="handleFilesSelected"
                  @file-drop="handleFileDrop"
                />
              </div>
              <div v-else key="text" class="grid grid-cols-1 gap-8">
                <TextInputArea
                  v-model="textContent"
                  class="payload-panel"
                  :placeholder="t('send.uploadArea.textInput')"
                />
              </div>
            </transition>
            <ExpirationSelector
              v-model:expiration-method="expirationMethod"
              v-model:expiration-value="expirationValue"
              :options="expirationOptions"
            />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold tracking-wide transition-all duration-300 sm:rounded-2xl sm:py-4 sm:text-base"
              :class="
                isSubmitting
                  ? isDarkMode
                    ? 'cursor-not-allowed border border-zinc-700/30 bg-zinc-800/50 text-zinc-500'
                    : 'cursor-not-allowed border border-slate-200/50 bg-slate-100 text-slate-400'
                  : isDarkMode
                    ? 'bg-zinc-200 text-zinc-950 shadow-[0_10px_28px_-12px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_34px_-14px_rgba(255,255,255,0.5)]'
                    : 'bg-zinc-800 text-white shadow-[0_10px_28px_-12px_rgba(24,24,27,0.35)] hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-[0_16px_34px_-14px_rgba(24,24,27,0.42)]'
              "
            >
              <LoaderCircleIcon v-if="isSubmitting" class="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              <SendIcon v-else class="h-4 w-4 sm:h-5 sm:w-5" />
              {{ isSubmitting ? t('send.submitting') : t('send.submit') }}
            </button>
          </form>
        </div>

        <!-- 与取件首页复用同一底栏，入口位置与主题样式同步维护。 -->
        <PageFooter
          :link-text="t('send.needRetrieveFile')"
          link-to="/"
          link-mode="retrieve"
          :show-delivery="!deliverySession"
          :drawer-text="t('send.sendRecords')"
          @toggle-drawer="toggleDrawer"
        />
      </div>
    </div>

    <SideDrawer :visible="showDrawer" :title="t('send.sendRecords')" @close="toggleDrawer">
      <SentRecordList
        :records="sendRecords"
        @copy-link="copySentRecordLink"
        @view-details="viewDetails"
        @delete-record="deleteRecord"
      />
    </SideDrawer>

    <SentRecordDetailModal
      :record="selectedRecord"
      :get-q-r-code-value="getQRCodeValue"
      @close="closeDetails"
      @copy-code="copySentRecordCode"
      @copy-link="copySentRecordLink"
      @copy-wget="copySentRecordWgetCommand"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DeliverySession } from '@/types/delivery'
import { useRouter } from 'vue-router'
import { LoaderCircleIcon, SendIcon } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import SendTypeSelector from '@/components/common/SendTypeSelector.vue'
import FileUploadArea from '@/components/common/FileUploadArea.vue'
import ExpirationSelector from '@/components/common/ExpirationSelector.vue'
import TextInputArea from '@/components/common/TextInputArea.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import SentRecordList from '@/components/common/SentRecordList.vue'
import SentRecordDetailModal from '@/components/common/SentRecordDetailModal.vue'
import { useInjectedDarkMode, useSendFlow } from '@/composables'

const props = defineProps<{ deliverySession?: DeliverySession }>()
const emit = defineEmits<{ changeDelivery: []; deliverySuccess: [] }>()
const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const router = useRouter()
const {
  sendType,
  selectedFile,
  selectedFiles,
  textContent,
  expirationMethod,
  expirationValue,
  uploadProgress,
  uploadedBytes,
  totalBytes,
  uploadSpeed,
  acceptedTypes,
  showDrawer,
  selectedRecord,
  isSubmitting,
  sendRecords,
  uploadDescription,
  expirationOptions,
  closeDetails,
  copySentRecordCode,
  copySentRecordLink,
  copySentRecordWgetCommand,
  deleteRecord,
  getQRCodeValue,
  handleFileDrop,
  handleFileSelected,
  handleFilesSelected,
  handlePaste,
  handleSubmit,
  toggleDrawer,
  viewDetails
} = useSendFlow(
  props.deliverySession
    ? {
        getDeliverySession: () => props.deliverySession || null,
        onDeliverySuccess: () => emit('deliverySuccess')
      }
    : {}
)

const toRetrieve = () => {
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

:deep(.payload-panel) {
  height: 10rem;
  min-height: 10rem;
}

:deep(.payload-panel textarea) {
  height: 100%;
}

@media (min-width: 640px) {
  :deep(.payload-panel) {
    height: 12rem;
    min-height: 12rem;
  }
}

select option {
  padding: 8px;
  margin: 4px;
  border-radius: 6px;
}

select option:checked {
  background: rgb(99 102 241 / 0.12) !important;
  color: rgb(79 70 229) !important;
}

.dark select option:checked {
  background: rgb(8 145 178 / 0.25) !important;
  color: rgb(103 232 249) !important;
}

select option:hover {
  background-color: rgb(99 102 241 / 0.1);
}

.dark select option:hover {
  background-color: rgb(8 145 178 / 0.16);
}
</style>
