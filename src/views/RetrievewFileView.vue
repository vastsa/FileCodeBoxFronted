<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300"
  >
    <div class="w-full max-w-md relative z-10">
      <div
        class="rounded-3xl shadow-2xl overflow-hidden border transform transition-all duration-300"
        :class="[
          isDarkMode
            ? 'bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl border-gray-700'
            : 'bg-white border-gray-200'
        ]"
      >
        <div class="p-8">
          <PageHeader :title="config.name" @title-click="toSend" />
          <RetrieveForm
            v-model="code"
            :input-status="inputStatus"
            :error="!!error"
            @submit="handleSubmit"
            ref="retrieveFormRef"
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
    />
    
    <ContentPreviewModal
      :visible="showPreview"
      :rendered-content="renderedContent"
      @close="closeContentPreview"
      @copy-content="copyContent"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import RetrieveForm from '@/components/common/RetrieveForm.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import FileDetailModal from '@/components/common/FileDetailModal.vue'
import FileRecordList from '@/components/common/FileRecordList.vue'
import ContentPreviewModal from '@/components/common/ContentPreviewModal.vue'
import { useRetrieveFlow } from '@/composables'
import { useConfigStore } from '@/stores/configStore'

const isDarkMode = inject('isDarkMode')
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const { config } = storeToRefs(configStore)
const {
  code,
  inputStatus,
  error,
  records,
  selectedRecord,
  showDrawer,
  showPreview,
  renderedContent,
  closeContentPreview,
  closeDetails,
  copyContent,
  deleteRecord,
  downloadRecord,
  handleSubmit,
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
