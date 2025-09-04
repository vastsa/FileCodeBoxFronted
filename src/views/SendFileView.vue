<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300"
    @paste.prevent="handlePaste"
  >
    <div
      class="rounded-3xl shadow-2xl overflow-hidden border w-full max-w-md transition-colors duration-300"
      :class="[
        isDarkMode
          ? 'bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl border-gray-700'
          : 'bg-white border-gray-200'
      ]"
    >
      <div class="p-8">
        <PageHeader :title="config.name" @title-click="toRetrieve" />
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <SendTypeSelector
            :selected-type="sendType as any"
            @update:selected-type="sendType = $event"
          />

          <transition name="fade" mode="out-in">
            <div v-if="sendType === 'file'" key="file" class="grid grid-cols-1 gap-8">
              <FileUploadArea
                :selected-file="selectedFile"
                :progress="uploadProgress"
                :description="`支持各种常见格式，最大${getStorageUnit(config.uploadSize)}`"
                @file-selected="handleFileSelected"
                @file-drop="handleFileDrop"
              />
            </div>
            <div v-else key="text" class="grid grid-cols-1 gap-8">
              <TextInputArea
                v-model="textContent"
                placeholder="在此输入要发送的文本..."
              />
            </div>
          </transition>
          <!-- 过期方式选择 -->
          <div class="flex flex-col space-y-3">
            <label :class="['text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              过期时间
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
                    v-model="expirationValue"
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
                  v-model="expirationMethod"
                  :class="[
                    'absolute right-0 top-0 h-full appearance-none cursor-pointer transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-offset-0',
                    expirationMethod === 'forever' ? 'w-full px-5 rounded-2xl' : 'w-28 pl-4 pr-9 border-l rounded-r-2xl',
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
                    v-for="item in config.expireStyle"
                    :value="item"
                    :key="item"
                    :class="[isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900']"
                    :style="{
                      color: isDarkMode ? '#f3f4f6' : '#111827',
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
                    }"
                  >
                    {{ getUnit(item) }}
                  </option>
                </select>
                <div
                  class="absolute pointer-events-none"
                  :class="[
                    expirationMethod === 'forever' ? 'right-3' : 'right-2',
                    'top-1/2 -translate-y-1/2'
                  ]"
                >
                  <svg
                    class="w-4 h-4 transition-colors duration-300"
                    :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          <!-- 提交按钮 -->
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden group"
          >
            <span
              class="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></span>
            <span class="relative z-10 flex items-center justify-center text-lg">
              <SendIcon class="w-6 h-6 mr-2" />
              <span>安全寄送</span>
            </span>
          </button>
        </form>
        <div class="mt-6 text-center">
          <router-link to="/" class="text-indigo-400 hover:text-indigo-300 transition duration-300">
            需要取件？点击这里
          </router-link>
        </div>
      </div>

      <div
        class="px-8 py-4 bg-opacity-50 flex justify-between items-center"
        :class="[isDarkMode ? 'bg-gray-800' : 'bg-gray-100']"
      >
        <span
          class="text-sm flex items-center"
          :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
        >
          <ShieldCheckIcon class="w-4 h-4 mr-1 text-green-400" />
          安全加密
        </span>
        <button
          @click="toggleDrawer"
          class="text-sm hover:text-indigo-300 transition duration-300 flex items-center"
          :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
        >
          发件记录
          <ClipboardListIcon class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>

    <!-- 抽屉式发件记录 -->
    <transition name="drawer">
      <div
        v-if="showDrawer"
        class="fixed inset-y-0 right-0 w-full sm:w-120 bg-opacity-70 backdrop-filter backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col"
        :class="[isDarkMode ? 'bg-gray-900' : 'bg-white']"
      >
        <div
          class="flex justify-between items-center p-6 border-b"
          :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']"
        >
          <h3 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            发件记录
          </h3>
          <button
            @click="toggleDrawer"
            class="hover:text-white transition duration-300"
            :class="[isDarkMode ? 'text-gray-400' : 'text-gray-800']"
          >
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-6">
          <transition-group name="list" tag="div" class="space-y-4">
            <div
              v-for="record in sendRecords"
              :key="record.id"
              class="bg-opacity-50 rounded-lg p-4 flex items-center shadow-md hover:shadow-lg transition duration-300 transform hover:scale-102"
              :class="[isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-white']"
            >
              <div class="flex-shrink-0 mr-4">
                <FileIcon
                  class="w-10 h-10"
                  :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
                />
              </div>
              <div class="flex-grow min-w-0 mr-4">
                <p
                  class="font-medium text-lg truncate"
                  :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
                >
                  {{ record.filename ? record.filename : 'Text' }}
                </p>
                <p
                  class="text-sm truncate"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']"
                >
                  {{ record.date }} · {{ record.size }}
                </p>
              </div>
              <div class="flex-shrink-0 flex space-x-2">
                <button
                  @click="copyRetrieveLink(record.retrieveCode)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
                  :class="[
                    isDarkMode
                      ? 'hover:bg-blue-400 text-blue-400'
                      : 'hover:bg-blue-100 text-blue-600'
                  ]"
                >
                  <ClipboardCopyIcon class="w-5 h-5" />
                </button>
                <button
                  @click="viewDetails(record)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
                  :class="[
                    isDarkMode
                      ? 'hover:bg-green-400 text-green-400'
                      : 'hover:bg-green-100 text-green-600'
                  ]"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button
                  @click="deleteRecord(record.id)"
                  class="p-2 rounded-full hover:bg-opacity-20 transition duration-300"
                  :class="[
                    isDarkMode ? 'hover:bg-red-400 text-red-400' : 'hover:bg-red-100 text-red-600'
                  ]"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <!-- 记录详情弹窗 -->
    <transition name="fade">
      <div
        v-if="selectedRecord"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      >
        <div
          class="w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden"
          :class="[isDarkMode ? 'bg-gray-900 bg-opacity-70' : 'bg-white bg-opacity-95']"
        >
          <!-- 顶部标题栏 -->
          <div
            class="px-4 sm:px-6 py-3 sm:py-4 border-b"
            :class="[isDarkMode ? 'border-gray-800' : 'border-gray-100']"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-lg sm:text-xl font-semibold"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
              >
                文件详情
              </h3>
              <button
                @click="selectedRecord = null"
                class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XIcon
                  class="w-4 h-4 sm:w-5 sm:h-5"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                />
              </button>
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div class="p-4 sm:p-6">
            <!-- 文件信息卡片 -->
            <div
              class="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
              :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
            >
              <div class="flex items-center mb-3 sm:mb-4">
                <div
                  class="p-2 sm:p-3 rounded-lg"
                  :class="[isDarkMode ? 'bg-gray-800' : 'bg-white']"
                >
                  <FileIcon
                    class="w-5 h-5 sm:w-6 sm:h-6"
                    :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
                  />
                </div>
                <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h4
                    class="font-medium text-sm sm:text-base truncate"
                    :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
                  >
                    {{ selectedRecord.filename }}
                  </h4>
                  <p
                    class="text-xs sm:text-sm truncate"
                    :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                  >
                    {{ selectedRecord.size }} · {{ selectedRecord.date }}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div class="flex items-center min-w-0">
                  <ClockIcon
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                    :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                  />
                  <span
                    class="text-xs sm:text-sm truncate"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                  >
                    {{ selectedRecord.expiration }}
                  </span>
                </div>
                <div class="flex items-center min-w-0">
                  <ShieldCheckIcon
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                    :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                  />
                  <span
                    class="text-xs sm:text-sm truncate"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                  >
                    安全加密
                  </span>
                </div>
              </div>
            </div>

            <!-- 取件码和二维码区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <!-- 左侧取件码 -->
              <div class="space-y-3 sm:space-y-4">
                <div
                  class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white"
                >
                  <div class="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 class="font-medium text-sm sm:text-base">取件码</h4>
                    <button
                      @click="copyRetrieveCode(selectedRecord.retrieveCode)"
                      class="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ClipboardCopyIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p class="text-2xl sm:text-3xl font-bold tracking-wider text-center break-all">
                    {{ selectedRecord.retrieveCode }}
                  </p>
                </div>

                <div
                  class="rounded-xl p-3 sm:p-4"
                  :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
                >
                  <div class="flex items-center justify-between mb-2 sm:mb-3">
                    <h4
                      class="font-medium text-sm sm:text-base flex items-center min-w-0"
                      :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
                    >
                      <TerminalIcon
                        class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0"
                      />
                      <span class="truncate">wget下载</span>
                    </h4>
                    <button
                      @click="copyWgetCommand(selectedRecord.retrieveCode, selectedRecord.filename)"
                      class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    >
                      <ClipboardCopyIcon
                        class="w-4 h-4 sm:w-5 sm:h-5"
                        :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                      />
                    </button>
                  </div>
                  <p
                    class="text-xs sm:text-sm font-mono break-all line-clamp-2"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
                  >
                    点击复制wget命令
                  </p>
                </div>
              </div>

              <!-- 右侧二维码 -->
              <div
                class="rounded-xl p-4 sm:p-5 flex flex-col items-center"
                :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-50 bg-opacity-95']"
              >
                <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-3 sm:mb-4">
                  <QRCode
                    :value="getQRCodeValue(selectedRecord)"
                    :size="140"
                    level="M"
                    class="sm:w-[160px] sm:h-[160px]"
                  />
                </div>
                <p
                  class="text-xs sm:text-sm truncate max-w-full"
                  :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']"
                >
                  扫描二维码快速取件
                </p>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div
            class="px-4 sm:px-6 py-3 sm:py-4 border-t"
            :class="[isDarkMode ? 'border-gray-800' : 'border-gray-100']"
          >
            <button
              @click="copyRetrieveLink(selectedRecord.retrieveCode)"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
            >
              复制取件链接
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import {
  SendIcon,
  ClipboardListIcon,
  XIcon,
  TrashIcon,
  FileIcon,
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
  ClipboardCopyIcon,
  TerminalIcon
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode.vue'
import { useFileDataStore } from '@/stores/fileData'
import { useAlertStore } from '@/stores/alertStore'
import api from '@/utils/api'
import type { ApiResponse } from '@/types'
import { copyRetrieveLink, copyRetrieveCode, copyWgetCommand } from '@/utils/clipboard'
import { getStorageUnit } from '@/utils/convert'
import PageHeader from '@/components/common/PageHeader.vue'
import SendTypeSelector from '@/components/common/SendTypeSelector.vue'
import FileUploadArea from '@/components/common/FileUploadArea.vue'
import TextInputArea from '@/components/common/TextInputArea.vue'

interface Config {
  name: string
  uploadSize: number
  expireStyle: string[]
  openUpload: number
  max_save_seconds: number
  enableChunk: boolean
}

interface ShareRecord {
  id: number
  filename: string
  date: string
  size: string
  expiration: string
  retrieveCode: string
}



const config: Config = JSON.parse(localStorage.getItem('config') || '{}') as Config

const router = useRouter()
const isDarkMode = inject('isDarkMode')
const fileDataStore = useFileDataStore()

const sendType = ref('file')
const selectedFile = ref<File | null>(null)
const textContent = ref('')

const expirationMethod = ref(config.expireStyle?.[0] || 'day')
const expirationValue = ref('1')
const uploadProgress = ref(0)
const showDrawer = ref(false)
const selectedRecord = ref<ShareRecord | null>(null)

const alertStore = useAlertStore()
const sendRecords = computed(() => fileDataStore.shareData)

const fileHash = ref('')



const handleFileSelected = (file: File) => {
  selectedFile.value = file
}



const handleFileDrop = async (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    selectedFile.value = file
    if (!checkUpload()) return
    fileHash.value = await calculateFileHash(file)
  }
}

const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        // 检查文件是否为空
        if (file.size === 0) {
          alertStore.showAlert('无法读取空文件', 'error')
          return
        }

        selectedFile.value = file
        if (!checkUpload()) return

        try {
          fileHash.value = await calculateFileHash(file)
          alertStore.showAlert('已从剪贴板添加文件：' + file.name, 'success')
        } catch (err) {
          alertStore.showAlert('文件处理失败', 'error')
          console.error('File hash calculation failed:', err)
        }
        break
      }
    } else {
      sendType.value = 'text'
      items[0].getAsString((str: string) => {
        const trimmedStr = str.trim()
        if (!trimmedStr) return

        // 获取文本框元素
        const textareaElement = document.getElementById('text-content') as HTMLTextAreaElement
        if (!textareaElement) {
          // 如果无法获取文本框元素，则直接追加
          textContent.value += trimmedStr
          return
        }

        const selectionStart = textareaElement.selectionStart
        const selectionEnd = textareaElement.selectionEnd
        const hasSelection = selectionStart !== selectionEnd

        if (hasSelection) {
          // 如果有选中文字，则覆盖选中的部分
          const beforeSelection = textContent.value.substring(0, selectionStart)
          const afterSelection = textContent.value.substring(selectionEnd)
          textContent.value = beforeSelection + trimmedStr + afterSelection

          // 设置光标位置到粘贴内容的末尾
          setTimeout(() => {
            const newCursorPosition = selectionStart + trimmedStr.length
            textareaElement.setSelectionRange(newCursorPosition, newCursorPosition)
            textareaElement.focus()
          }, 0)
        } else {
          // 如果没有选中文字，则在光标位置追加
          const cursorPosition = selectionStart
          const beforeCursor = textContent.value.substring(0, cursorPosition)
          const afterCursor = textContent.value.substring(cursorPosition)
          textContent.value = beforeCursor + trimmedStr + afterCursor

          // 设置光标位置到粘贴内容的末尾
          setTimeout(() => {
            const newCursorPosition = cursorPosition + trimmedStr.length
            textareaElement.setSelectionRange(newCursorPosition, newCursorPosition)
            textareaElement.focus()
          }, 0)
        }
      })
    }
  }
}

const calculateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const chunkSize = 2097152 // 保持 2MB 的切片大小用于计算哈希
    const fileReader = new FileReader()
    let currentChunk = 0
    const chunks = Math.ceil(file.size / chunkSize)

    fileReader.onload = async (e) => {
      const chunk = new Uint8Array(e.target!.result as ArrayBuffer)

      try {
        // 尝试使用 crypto.subtle.digest
        if (window.isSecureContext) {
          const hashBuffer = await crypto.subtle.digest('SHA-256', chunk)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

          currentChunk++
          if (currentChunk < chunks) {
            loadNext()
          } else {
            resolve(hashHex)
          }
        } else {
          // 如果不是安全上下文（HTTP），则返回一个基于文件信息的替代哈希
          const fallbackHash = generateFallbackHash(file)
          resolve(fallbackHash)
        }
      } catch (err) {
        // 如果 crypto.subtle.digest 失败，使用替代方案
        const fallbackHash = generateFallbackHash(file)
        console.error('File hash calculation failed:', err)
        resolve(fallbackHash)
      }
    }

    const loadNext = () => {
      const start = currentChunk * chunkSize
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

// 生成替代哈希的函数
const generateFallbackHash = (file: File): string => {
  // 使用文件名、大小和最后修改时间生成一个简单的哈希
  const fileInfo = `${file.name}-${file.size}-${file.lastModified}`
  let hash = 0
  for (let i = 0; i < fileInfo.length; i++) {
    const char = fileInfo.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // 转换为16进制字符串并填充到64位
  return Math.abs(hash).toString(16).padStart(64, '0')
}

const getPlaceholder = (value: string = expirationMethod.value) => {
  switch (value) {
    case 'day':
      return '输入天数'
    case 'hour':
      return '输入小时数'
    case 'minute':
      return '输入分钟数'
    case 'count':
      return '输入查看次数'
    case 'forever':
      return '永久'
    default:
      return '输入值'
  }
}

const getUnit = (value: string = expirationMethod.value) => {
  switch (value) {
    case 'day':
      return '天'
    case 'hour':
      return '小时'
    case 'minute':
      return '分钟'
    case 'count':
      return '次'
    case 'forever':
      return '永久'
    default:
      return ''
  }
}

const getExpirationTime = (method: string, value: string) => {
  if (method === 'forever') {
    return '永久'
  }
  if (method === 'count') {
    return `${value}次后过期`
  }

  const now = new Date()
  const expireValue = parseInt(value)

  switch (method) {
    case 'minute':
      now.setMinutes(now.getMinutes() + expireValue)
      break
    case 'hour':
      now.setHours(now.getHours() + expireValue)
      break
    case 'day':
      now.setDate(now.getDate() + expireValue)
      break
    default:
      return `${value}${getUnit(method)}后过期`
  }

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}过期`
}

const handleChunkUpload = async (file: File) => {
  try {
    // 默认切片大小为5MB
    const chunkSize = 5 * 1024 * 1024
    const chunks = Math.ceil(file.size / chunkSize)
    // 1. 初始化切片上传
    const initResponse: ApiResponse<{
      code?: string
      name?: string
      upload_id?: string
      existed?: boolean
    }> = await api.post('chunk/upload/init/', {
      file_name: file.name,
      file_size: file.size,
      chunk_size: chunkSize,
      file_hash: fileHash.value
    })

    if (initResponse.code !== 200) {
      throw new Error('初始化切片上传失败')
    }
    if (initResponse.detail?.existed) {
      return initResponse
    }
    const uploadId = initResponse.detail?.upload_id

    // 2. 上传切片
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const chunkFormData = new FormData()
      chunkFormData.append('chunk', new Blob([chunk], { type: file.type })) // 确保以Blob形式添加

      // 使用 application/x-www-form-urlencoded 格式
      const chunkResponse: ApiResponse<unknown> = await api.post(
        `chunk/upload/chunk/${uploadId}/${i}`,
        chunkFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
            const percentCompleted = Math.round(
              ((i * chunkSize + progressEvent.loaded) * 100) / file.size
            )
            uploadProgress.value = percentCompleted
          }
        }
      )

      if (chunkResponse.code !== 200) {
        throw new Error(`切片 ${i} 上传失败`)
      }
    }

    // 3. 完成上传
    const completeResponse: ApiResponse<{ code?: string; name?: string }> = await api.post(`chunk/upload/complete/${uploadId}`, {
      expire_value: expirationValue.value ? parseInt(expirationValue.value) : 1,
      expire_style: expirationMethod.value
    })

    if (completeResponse.code !== 200) {
      throw new Error('完成上传失败')
    }

    return completeResponse
  } catch (error: unknown) {
    console.error('切片上传失败:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      if (axiosError.response?.data?.detail) {
        alertStore.showAlert(axiosError.response.data.detail, 'error')
      }
    } else {
      alertStore.showAlert('上传失败,请稍后重试', 'error')
    }
    throw error
  }
}
const handleDefaultFileUpload = async (file: File) => {
  const formData = new FormData()
  // 添加上传进度监听
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
      uploadProgress.value = percentCompleted
    }
  }
  formData.append('file', file)
  formData.append('expire_value', expirationValue.value)
  formData.append('expire_style', expirationMethod.value)
  const response: ApiResponse<{ code?: string; name?: string }> = await api.post('share/file/', formData, config)
  return response
}
const checkOpenUpload = () => {
  if (config.openUpload === 0 && localStorage.getItem('token') === null) {
    alertStore.showAlert('游客上传功能已关闭', 'error')
    return false
  }
  return true
}

const checkFileSize = (file: File) => {
  if (file.size > config.uploadSize) {
    alertStore.showAlert(`文件大小超过限制 (${getStorageUnit(config.uploadSize)})`, 'error')
    selectedFile.value = null
    return false
  }
  return true
}

const checkExpirationTime = (method: string, value: string): boolean => {
  if (method === 'forever' || method === 'count') return true

  const maxSaveSeconds = config.max_save_seconds || 0
  if (maxSaveSeconds === 0) return true // 如果没有限制，直接返回true

  let totalSeconds = 0
  switch (method) {
    case 'minute':
      totalSeconds = parseInt(value) * 60
      break
    case 'hour':
      totalSeconds = parseInt(value) * 3600
      break
    case 'day':
      totalSeconds = parseInt(value) * 86400
      break
    default:
      return false
  }

  return totalSeconds <= maxSaveSeconds
}

const checkUpload = () => {
  if (!checkOpenUpload()) return false
  if (!checkFileSize(selectedFile.value!)) return false
  if (!checkExpirationTime(expirationMethod.value, expirationValue.value)) return false
  return true
}
const handleSubmit = async () => {
  if (sendType.value === 'file' && !selectedFile.value) {
    alertStore.showAlert('请选择要上传的文件', 'error')
    return
  }
  if (sendType.value === 'text' && !textContent.value.trim()) {
    alertStore.showAlert('请输入要发送的文本', 'error')
    return
  }
  if (expirationMethod.value !== 'forever' && !expirationValue.value) {
    alertStore.showAlert('请输入过期值', 'error')
    return
  }

  // 添加过期时间验证
  if (!checkExpirationTime(expirationMethod.value, expirationValue.value)) {
    const maxDays = Math.floor(config.max_save_seconds / 86400)
    alertStore.showAlert(`过期时间不能超过${maxDays}天`, 'error')
    return
  }

  try {
    let response: ApiResponse

    if (sendType.value === 'file') {
      // 使用切片上传替代原来的直接上传
      if (config.enableChunk) {
        response = await handleChunkUpload(selectedFile.value!)
      } else {
        response = await handleDefaultFileUpload(selectedFile.value!)
      }
    } else {
      // 文本上传保持不变
      const formData = new FormData()
      formData.append('text', textContent.value)
      formData.append('expire_value', expirationValue.value)
      formData.append('expire_style', expirationMethod.value)
      response = await api.post('share/text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    if (response && response.code === 200) {
       const retrieveCode = (response.detail as unknown as { code?: string })?.code || ''
       const fileName = (response.detail as unknown as { name?: string })?.name || ''
      // 添加新的发送记录
      const newRecord: ShareRecord = {
        id: Date.now(),
        filename: fileName,
        date: new Date().toISOString().split('T')[0],
        size:
          sendType.value === 'text'
            ? `${(textContent.value.length / 1024).toFixed(2)} KB`
            : `${(selectedFile.value!.size / (1024 * 1024)).toFixed(1)} MB`,
        expiration:
          expirationMethod.value === 'forever'
            ? '永久'
            : getExpirationTime(expirationMethod.value, expirationValue.value),
        retrieveCode: retrieveCode
      }
      fileDataStore.addShareDataRecord(newRecord)

      // 显示发送成功消息
      alertStore.showAlert(`文件发送成功！取件码：${retrieveCode}`, 'success')
      // 重置表单 - 只重置文件和文本内容,保留过期信息
      selectedFile.value = null
      textContent.value = ''
      uploadProgress.value = 0
      // 显示详情
      selectedRecord.value = newRecord
      // 自动复制取件码链接
      await copyRetrieveLink(retrieveCode)
    } else {
      throw new Error('服务器响应异常')
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { detail?: string } } }
      if (axiosError.response?.data?.detail) {
        alertStore.showAlert(axiosError.response.data.detail, 'error')
      }
    } else {
      alertStore.showAlert('发送失败,请稍后重试', 'error')
    }
  } finally {
    uploadProgress.value = 0
  }
}

const toRetrieve = () => {
  router.push('/')
}

const toggleDrawer = () => {
  showDrawer.value = !showDrawer.value
}

const viewDetails = (record: ShareRecord) => {
  selectedRecord.value = record
}

const deleteRecord = (id: number) => {
  const index = fileDataStore.shareData.findIndex((record: ShareRecord) => record.id === id)
  if (index !== -1) {
    fileDataStore.deleteShareData(index)
  }
}
const baseUrl = window.location.origin + '/#/'
const getQRCodeValue = (record: ShareRecord) => {
  return `${baseUrl}?code=${record.retrieveCode}`
}

const incrementValue = (delta: number) => {
  const currentValue = parseInt(expirationValue.value) || 0
  const newValue = currentValue + delta
  if (newValue >= 1) {
    expirationValue.value = newValue.toString()
  }
}

// 使用 onMounted 钩子延迟加载一些非关键资源或初始化
onMounted(() => {
  // 这里可以放置一些非立即需要的初始化代码
  console.log('SendFileView mounted')
})
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

@media (min-width: 640px) {
  .sm\:w-120 {
    width: 30rem;
    /* 480px */
  }
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
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

select option {
  padding: 8px;
  margin: 4px;
  border-radius: 6px;
}

select option:checked {
  background: linear-gradient(to right, rgb(99 102 241 / 0.5), rgb(168 85 247 / 0.5)) !important;
  color: white !important;
}

.dark select option:checked {
  background: linear-gradient(to right, rgb(99 102 241 / 0.7), rgb(168 85 247 / 0.7)) !important;
}

select option:hover {
  background-color: rgb(99 102 241 / 0.1);
}

.dark select option:hover {
  background-color: rgb(99 102 241 / 0.2);
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) rgba(243, 244, 246, 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.3);
  border-radius: 6px;
  margin: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6));
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
  transform: scale(1.1);
}

.custom-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}

/* 深色模式下的滚动条样式 */
.dark .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.6) rgba(31, 41, 55, 0.4);
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.4);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(168, 85, 247, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9));
}
</style>
