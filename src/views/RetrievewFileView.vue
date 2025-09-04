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
            :input-status="inputStatus"
            :error="!!error"
            @submit="handleSubmit"
            @update:code="code = $event"
            ref="retrieveFormRef"
          />
        </div>
        <PageFooter
          link-text="需要发送文件？点击这里"
          link-to="/send"
          drawer-text="取件记录"
          @toggle-drawer="toggleDrawer"
        />
      </div>
    </div>

    <SideDrawer :visible="showDrawer" title="取件记录" @close="toggleDrawer">
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
      @close="selectedRecord = null"
      @show-content-preview="showContentPreview"
      :get-download-url="getDownloadUrl"
      :get-qr-code-value="getQRCodeValue"
    />
    
    <ContentPreviewModal
      :visible="showPreview"
      :rendered-content="renderedContent"
      @close="showPreview = false"
      @copy-content="copyContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import RetrieveForm from '@/components/common/RetrieveForm.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import SideDrawer from '@/components/common/SideDrawer.vue'
import FileDetailModal from '@/components/common/FileDetailModal.vue'
import FileRecordList from '@/components/common/FileRecordList.vue'
import ContentPreviewModal from '@/components/common/ContentPreviewModal.vue'

// 定义数据接口
interface FileRecord {
  id: number
  code: string
  filename: string
  size: string
  downloadUrl: string | null
  content: string | null
  date: string
}

interface InputStatus {
  readonly: boolean
  loading: boolean
}

import { useRouter, useRoute } from 'vue-router'
import { useFileDataStore } from '@/stores/fileData'
import { storeToRefs } from 'pinia'
import api from '@/utils/api'
import type { ApiResponse } from '@/types'

interface RetrieveResponse {
  code: string
  name: string
  text: string
  size: number
}
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAlertStore } from '@/stores/alertStore'
import { copyToClipboard } from '@/utils/clipboard'

const alertStore = useAlertStore()
const baseUrl = window.location.origin

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const fileStore = useFileDataStore()
const { receiveData } = storeToRefs(fileStore)
const code = ref('')
const inputStatus = ref<InputStatus>({
  readonly: false,
  loading: false
})

const error = ref('')
const selectedRecord = ref<FileRecord | null>(null)
const showDrawer = ref(false)
const route = useRoute()

// 使用 receiveData 替代原来的 records
const records = receiveData
const config = JSON.parse(localStorage.getItem('config') || '{}')
const codeInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (codeInput.value) {
    codeInput.value.focus()
  }
  const query_code = route.query.code
  if (query_code && typeof query_code === 'string') {
    code.value = query_code
  }
})
watch(code, (newVal) => {
  if (newVal.length === 5) {
    handleSubmit()
  }
})

const getDownloadUrl = (record: FileRecord) => {
  if (record.downloadUrl) {
    if (record.downloadUrl.startsWith('http')) {
      return record.downloadUrl
    } else {
      return `${baseUrl}${record.downloadUrl}`
    }
  }
  return ''
}
// 在其他代码后添加复制功能
const copyContent = async () => {
  if (selectedRecord.value && selectedRecord.value.content) {
    await copyToClipboard(selectedRecord.value.content, {
      successMsg: '内容已复制到剪贴板',
      errorMsg: '复制失败，请重试'
    })
  }
}
const handleSubmit = async () => {
  if (code.value.length !== 5) {
    alertStore.showAlert('请输入5位取件码', 'error')
    return
  }

  inputStatus.value.readonly = true
  inputStatus.value.loading = true

  try {
    const response = await api.post('/share/select/', {
      code: code.value
    })
    const res = (response.data || response) as ApiResponse<RetrieveResponse>

    if (res && res.code === 200) {
      if (res.detail) {
        const isFile = res.detail.text.startsWith('/share/download') || res.detail.name !== 'Text'
        const newFileData = {
          id: Date.now(),
          code: res.detail.code,
          filename: res.detail.name,
          size: formatFileSize(res.detail.size),
          downloadUrl: isFile ? res.detail.text : null,
          content: isFile ? null : res.detail.text,
          date: new Date().toLocaleString()
        }
        let flag = true
        fileStore.receiveData.forEach((file: FileRecord) => {
          if (file.code === newFileData.code) {
            flag = false
          }
        })
        if (flag) {
          fileStore.addReceiveData(newFileData)
        }
        if (isFile) {
          selectedRecord.value = newFileData
        } else {
          selectedRecord.value = newFileData
          showPreview.value = true
        }
        alertStore.showAlert('文件获取成功', 'success')
      } else {
        alertStore.showAlert('无效的取件码', 'error')
      }
    } else {
      alertStore.showAlert('获取文件失败：' + res.detail, 'error')
    }
  } catch (err: unknown) {
    console.error('取件失败:', err)
    const error = err as { response?: { data?: { detail?: string } }; message?: string }
    const errorMessage = error?.response?.data?.detail || error?.message || '未知错误'
    alertStore.showAlert('取件失败，请稍后重试：' + errorMessage, 'error')
  } finally {
    inputStatus.value.readonly = false
    inputStatus.value.loading = false
    code.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const viewDetails = (record: FileRecord) => {
  selectedRecord.value = record
}

const deleteRecord = (id: number) => {
  const index = records.value.findIndex((record: FileRecord) => record.id === id)
  if (index !== -1) {
    fileStore.deleteReceiveData(index)
  }
}

const toggleDrawer = () => {
  showDrawer.value = !showDrawer.value
}

const toSend = () => {
  router.push('/send')
}

const getQRCodeValue = (record: FileRecord) => {
  if (record.downloadUrl) {
    return `${baseUrl}${record.downloadUrl}`
  } else {
    return `${baseUrl}?code=${record.code}`
  }
}

const downloadRecord = (record: FileRecord) => {
  if (record.downloadUrl) {
    // 如果是文件,直接下载
    window.open(
      `${record.downloadUrl.startsWith('http') ? '' : baseUrl}${record.downloadUrl}`,
      '_blank'
    )
  } else if (record.content) {
    // 如果是文本,转成txt下载
    const blob = new Blob([record.content], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `${record.filename}.txt`)
  }
}

const showPreview = ref(false)
const renderedContent = ref('')

// 监听selectedRecord变化，异步渲染内容
watch(
  () => selectedRecord.value?.content,
  async (content) => {
    if (content) {
      try {
        // 使用 marked 解析 Markdown，然后用 DOMPurify 清理 HTML 防止 XSS
        const rawHtml = await marked(content)
        renderedContent.value = DOMPurify.sanitize(rawHtml, {
          // 允许的标签和属性
          ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'ul',
            'ol',
            'li',
            'blockquote',
            'code',
            'pre',
            'a',
            'img'
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
          // 禁用危险的协议
          ALLOWED_URI_REGEXP:
            /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
        })
      } catch (error) {
        console.error('Markdown 渲染失败:', error)
        renderedContent.value = content // fallback 到原始内容
      }
    } else {
      renderedContent.value = ''
    }
  },
  { immediate: true }
)

const showContentPreview = () => {
  showPreview.value = true
}
</script>

<style scoped>
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(20px, -50px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(50px, 50px) scale(1.05);
  }
}

@media (min-width: 640px) {
  .sm\:w-120 {
    width: 30rem;
    /* 480px */
  }
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.w-97-100 {
  width: 97%;
}

/* 添加 Markdown 样式 */
:deep(.prose) {
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: rgb(79, 70, 229);
  /* text-indigo-600 */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(.prose p),
:deep(.prose div),
:deep(.prose span),
:deep(.prose code),
:deep(.prose pre) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

:deep(.prose pre) {
  white-space: pre-wrap;
  overflow-x: auto;
}

:deep(.prose code) {
  white-space: pre-wrap;
}

@media (prefers-color-scheme: dark) {
  :deep(.prose h1),
  :deep(.prose h2),
  :deep(.prose h3),
  :deep(.prose h4),
  :deep(.prose h5),
  :deep(.prose h6) {
    color: rgb(129, 140, 248);
    /* text-indigo-400 */
  }
}

/* 添加新的宽度类 */
@media (min-width: 640px) {
  .sm\:w-120 {
    width: 30rem;
    /* 480px */
  }
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) rgba(243, 244, 246, 0.5);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
  transition: background-color 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 深色模式下的滚动条样式 */
:deep([class*='dark']) .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.5) rgba(31, 41, 55, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

:deep([class*='dark']) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* 确保滚动容器有背景色 */
.custom-scrollbar {
  background: inherit;
}

/* 文本换行相关样式 */
.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
