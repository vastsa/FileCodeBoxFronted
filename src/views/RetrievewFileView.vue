<template>
  <div class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
    <div class="w-full max-w-md relative z-10">
      <div class="rounded-3xl shadow-2xl overflow-hidden border transform transition-all duration-300" :class="[
        isDarkMode
          ? 'bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl border-gray-700'
          : 'bg-white border-gray-200'
      ]">
        <div class="p-8">
          <div class="flex justify-center mb-8">
            <div class="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 animate-spin-slow">
              <div class="rounded-full bg-gray-900 p-2">
                <BoxIcon class="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h2 @click="toSend" class="text-3xl cursor-pointer font-extrabold text-center mb-6" :class="[
            isDarkMode
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300'
              : 'text-indigo-600'
          ]">
            {{ config.name }}
          </h2>
          <form @submit.prevent="handleSubmit">
            <div class="mb-6 relative">
              <label for="code" class="block text-sm font-medium mb-2"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']">取件码</label>
              <div class="relative">
                <input id="code" v-model="code" type="text"
                  class="w-full px-4 py-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 pr-10"
                  :class="[
                    isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100',
                    { 'ring-2 ring-red-500': error },
                    isDarkMode ? 'text-gray-300' : 'text-gray-800'
                  ]" placeholder="请输入5位取件码" required :readonly="inputStatus.readonly" maxlength="5"
                  @focus="isInputFocused = true" @blur="isInputFocused = false" />
                <div v-if="inputStatus.loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></span>
                </div>
              </div>
              <div
                class="absolute -bottom-0.5 left-2 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-in-out"
                :class="{ 'w-97-100': isInputFocused, 'w-0': !isInputFocused }"></div>
            </div>
            <button type="submit"
              class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              :disabled="inputStatus.loading">
              <span class="flex items-center justify-center relative z-10">
                <span>{{ inputStatus.loading ? '处理中...' : '提取文件' }}</span>
                <ArrowRightIcon
                  class="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" />
              </span>
              <span
                class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <router-link to="/send" class="text-indigo-400 hover:text-indigo-300 transition duration-300">
              需要发送文件？点击这里
            </router-link>
          </div>
        </div>
        <div class="px-8 py-4 bg-opacity-50 flex justify-between items-center"
          :class="[isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
          <span class="text-sm flex items-center" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']">
            <ShieldCheckIcon class="w-4 h-4 mr-1 text-green-400" />
            安全加密
          </span>
          <button @click="toggleDrawer" class="text-sm hover:text-indigo-300 transition duration-300 flex items-center"
            :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']">
            取件记录
            <ClipboardListIcon class="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <transition name="drawer">
      <div v-if="showDrawer"
        class="fixed inset-y-0 right-0 w-full sm:w-120 bg-opacity-70 backdrop-filter backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col"
        :class="[isDarkMode ? 'bg-gray-900' : 'bg-white']">
        <div class="flex justify-between items-center p-6 border-b"
          :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']">
          <h3 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            取件记录
          </h3>
          <button @click="toggleDrawer" class="hover:text-white transition duration-300"
            :class="[isDarkMode ? 'text-gray-400' : 'text-gray-800']">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-6">
          <transition-group name="list" tag="div" class="space-y-4">
            <div v-for="record in records" :key="record.id"
              class="bg-opacity-50 rounded-lg p-4 flex items-center shadow-md hover:shadow-lg transition duration-300 transform hover:scale-102"
              :class="[isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-white']">
              <div class="flex-shrink-0 mr-4">
                <FileIcon class="w-10 h-10" :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              </div>
              <div class="flex-grow min-w-0 mr-4">
                <p class="font-medium text-lg truncate" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
                  {{ record.filename }}
                </p>
                <p class="text-sm truncate" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                  {{ record.date }} · {{ record.size }}
                </p>
              </div>
              <div class="flex-shrink-0 flex space-x-2">
                <button @click="viewDetails(record)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300" :class="[
                    isDarkMode
                      ? 'hover:bg-indigo-400 text-indigo-400'
                      : 'hover:bg-indigo-100 text-indigo-600'
                  ]">
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button @click="downloadRecord(record)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300" :class="[
                    isDarkMode
                      ? 'hover:bg-green-400 text-green-400'
                      : 'hover:bg-green-100 text-green-600'
                  ]">
                  <DownloadIcon class="w-5 h-5" />
                </button>
                <button @click="deleteRecord(record.id)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300" :class="[
                    isDarkMode ? 'hover:bg-red-400 text-red-400' : 'hover:bg-red-100 text-red-600'
                  ]">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="selectedRecord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          class="p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 ease-out backdrop-filter backdrop-blur-lg overflow-hidden"
          :class="[
            isDarkMode 
              ? 'bg-gray-800 bg-opacity-70' 
              : 'bg-white bg-opacity-95'
          ]">
          <h3 class="text-2xl font-bold mb-6 truncate" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            文件详情
          </h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <FileIcon class="w-6 h-6 mr-3 flex-shrink-0"
                :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']" class="truncate flex-grow">
                <span class="font-medium">文件名：</span>{{ selectedRecord.filename }}
              </p>
            </div>
            <div class="flex items-center">
              <CalendarIcon class="w-6 h-6 mr-3 flex-shrink-0"
                :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']" class="truncate flex-grow">
                <span class="font-medium">取件日期：</span>{{ selectedRecord.date }}
              </p>
            </div>
            <div class="flex items-center">
              <HardDriveIcon class="w-6 h-6 mr-3 flex-shrink-0"
                :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']" class="truncate flex-grow">
                <span class="font-medium">文件大小：</span>{{ selectedRecord.size }}
              </p>
            </div>
            <div class="flex items-center">
              <DownloadIcon class="w-6 h-6 mr-3" :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              <p :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']">
                <span class="font-medium">文件内容：</span>
              </p>
              <div v-if="selectedRecord.filename == 'Text'" class="ml-2">
                <button @click="showContentPreview"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300">
                  预览内容
                </button>
              </div>
              <div v-else>
                <a :href="`${baseUrl}${selectedRecord.downloadUrl}`" target="_blank" rel="noopener noreferrer"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300">
                  点击下载
                </a>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col items-center">
            <h4 class="text-lg font-semibold mb-3" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              取件二维码
            </h4>
            <div class="bg-white p-2 rounded-lg shadow-md">
              <QRCode :value="getQRCodeValue(selectedRecord)" :size="128" level="M" />
            </div>
            <p class="mt-2 text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              扫描二维码快速取件
            </p>
          </div>

          <button @click="selectedRecord = null"
            class="mt-8 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105">
            关闭
          </button>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          class="p-8 rounded-2xl max-w-3xl w-full mx-4 shadow-2xl transform transition-all duration-300 ease-out backdrop-filter backdrop-blur-lg bg-opacity-70 max-h-[80vh] overflow-y-auto"
          :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              内容预览
            </h3>
            <div class="flex items-center gap-2">
              <button @click="copyContent" 
                class="px-3 py-1 rounded-lg transition duration-300 flex items-center gap-1"
                :class="[
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                ]">
                <CopyIcon class="w-4 h-4" />
                复制
              </button>
              <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">
                <XIcon class="w-6 h-6" />
              </button>
            </div>
          </div>
          <div class="prose max-w-none" :class="[isDarkMode ? 'prose-invert' : '']" v-html="renderedContent"></div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from 'vue'
import {
  BoxIcon,
  EyeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ClipboardListIcon,
  XIcon,
  TrashIcon,
  FileIcon,
  CalendarIcon,
  HardDriveIcon,
  DownloadIcon,
  CopyIcon
} from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import QRCode from 'qrcode.vue'
import { useFileDataStore } from '@/stores/fileData'
import { storeToRefs } from 'pinia'
import api from '@/utils/api'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import { useAlertStore } from '@/stores/alertStore'
import { copyToClipboard } from '@/utils/clipboard'

const alertStore = useAlertStore()
const baseUrl = window.location.origin

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const fileStore = useFileDataStore()
const { receiveData } = storeToRefs(fileStore)
const code = ref('')
const inputStatus = ref({
  readonly: false,
  loading: false
})
const isInputFocused = ref(false)
const error = ref('')
const selectedRecord = ref(null)
const showDrawer = ref(false)
const route = useRoute()

// 使用 receiveData 替代原来的 records
const records = receiveData
const config = JSON.parse(localStorage.getItem('config') || '{}')

onMounted(() => {
  const query_code = route.query.code
  if (query_code) {
    code.value = query_code
  }
})
watch(code, (newVal) => {
  if (newVal.length === 5) {
    handleSubmit()
  }
})

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
    const res = await api.post('/share/select/', {
      code: code.value
    })

    if (res.code === 200) {
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
        fileStore.receiveData.forEach((file) => {
          if (file.code === newFileData.code) {
            flag = false
            return
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
      alertStore.showAlert(res.detail || '获取文件失败', 'error')
    }
  } catch (err) {
    console.error('取件失败:', err)
    alertStore.showAlert('取件失败，请稍后重试', 'error')
  } finally {
    inputStatus.value.readonly = false
    inputStatus.value.loading = false
    code.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const viewDetails = (record) => {
  selectedRecord.value = record
}

const deleteRecord = (id) => {
  const index = records.value.findIndex((record) => record.id === id)
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

const getQRCodeValue = (record) => {
  if (record.downloadUrl) {
    return `${baseUrl}${record.downloadUrl}`
  } else {
    return `${baseUrl}?code=${record.code}`
  }
}

const downloadRecord = (record) => {
  console.log(record)

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
const renderedContent = computed(() => {
  if (selectedRecord.value && selectedRecord.value.content) {
    return marked(selectedRecord.value.content)
  }
  return ''
})

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

.animate-blob-1 {
  animation: blob 25s infinite;
}

.animate-blob-2 {
  animation: blob 30s infinite;
}

.animate-blob-3 {
  animation: blob 35s infinite;
}

.animate-blob-4 {
  animation: blob 40s infinite;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.w-97-100 {
  width: 97%;
}

/* 添加 Markdown 样式 */
:deep(.prose) {
  text-align: left;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: rgb(79, 70, 229);
  /* text-indigo-600 */
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
</style>
