<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 font-sans transition-colors duration-700 sm:p-8"
    :class="isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f5f5f7] text-zinc-900'"
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

        <div class="px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-12">
          <PageHeader
            :title="t('retrieve.title')"
            :subtitle="t('retrieve.codeInput.placeholder')"
            mode="retrieve"
            @title-click="toSend"
          />
          <RetrieveForm
            v-model="code"
            :input-status="inputStatus"
            :error="!!error"
            @submit="handleSubmit"
          />
        </div>
        <PageFooter
          :link-text="$t('retrieve.needSendFile')"
          link-to="/send"
          :drawer-text="$t('retrieve.recordsDrawer')"
          @toggle-drawer="toggleDrawer"
        />
      </div>
    </div>

    <SideDrawer :visible="showDrawer" :title="$t('retrieve.recordsDrawer')" @close="toggleDrawer">
      <FileRecordList
        :records="records"
        @view-details="viewDetails"
        @download-record="downloadRecord"
        @delete-record="deleteRecord"
      />
    </SideDrawer>

    <FileDetailModal
      :visible="!!selectedRecord"
      :record="selectedRecord"
      @close="closeDetails"
      @preview-content="showContentPreview"
      @preview-file="showFilePreview"
    />

    <ContentPreviewModal
      :visible="showPreview"
      :rendered-content="renderedContent"
      @close="closeContentPreview"
      @copy-content="copyContent"
    />

    <MediaPreviewModal
      :visible="showMediaPreview"
      :record="previewMediaRecord"
      @close="closeFilePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import RetrieveForm from '@/components/common/RetrieveForm.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import FileDetailModal from '@/components/common/FileDetailModal.vue'
import FileRecordList from '@/components/common/FileRecordList.vue'
import ContentPreviewModal from '@/components/common/ContentPreviewModal.vue'
import MediaPreviewModal from '@/components/common/MediaPreviewModal.vue'
import { useRetrieveFlow } from '@/composables'
import { useInjectedDarkMode } from '@/composables'

const isDarkMode = useInjectedDarkMode()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const {
  code,
  inputStatus,
  error,
  records,
  selectedRecord,
  previewMediaRecord,
  showDrawer,
  showPreview,
  showMediaPreview,
  renderedContent,
  closeFilePreview,
  closeContentPreview,
  closeDetails,
  copyContent,
  deleteRecord,
  downloadRecord,
  handleSubmit,
  showFilePreview,
  showContentPreview,
  toggleDrawer,
  viewDetails
} = useRetrieveFlow()

const toSend = () => {
  router.push('/send')
}

onMounted(() => {
  const queryCode = route.query.code
  if (queryCode && typeof queryCode === 'string') {
    code.value = queryCode
  }
})

watch(code, (newCode) => {
  if (newCode.length === 5) {
    void handleSubmit()
  }
})
</script>
