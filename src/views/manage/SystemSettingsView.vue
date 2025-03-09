<script setup lang="ts">
import { inject, ref } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alertStore'

const isDarkMode = inject('isDarkMode')
interface ConfigState {
  name: string
  description: string
  file_storage: string
  themesChoices: any[]
  expireStyle: string[]
  admin_token: string
  robotsText: string
  keywords: string
  notify_title: string
  notify_content: string
  openUpload: number
  uploadSize: number
  storage_path: string
  uploadMinute: number
  max_save_seconds: number
  opacity: number
  enableChunk: number
  s3_access_key_id: string
  background: string
  showAdminAddr: number
  page_explain: string
  s3_secret_access_key: string
  aws_session_token: string
  s3_signature_version: string
  s3_region_name: string
  s3_bucket_name: string
  s3_endpoint_url: string
  s3_hostname: string
  uploadCount: number
  errorMinute: number
  errorCount: number
  s3_proxy: number
  themesSelect: string
  webdav_url: string
  webdav_username: string
  webdav_password: string
}

const config = ref<ConfigState>({
  name: '',
  description: '',
  file_storage: '',
  webdav_url: '',
  webdav_username: '',
  webdav_password: '',
  themesChoices: [],
  expireStyle: [],
  admin_token: '',
  robotsText: '',
  keywords: '',
  notify_title: '',
  storage_path: '',
  notify_content: '',
  openUpload: 1,
  uploadSize: 1,
  enableChunk: 0,
  uploadMinute: 1,
  max_save_seconds: 0,
  opacity: 0.9,
  s3_access_key_id: '',
  background: '',
  showAdminAddr: 0,
  page_explain: '',
  s3_secret_access_key: '',
  aws_session_token: '',
  s3_signature_version: '',
  s3_region_name: '',
  s3_bucket_name: '',
  s3_endpoint_url: '',
  s3_hostname: '',
  uploadCount: 1,
  errorMinute: 1,
  errorCount: 1,
  s3_proxy: 0,
  themesSelect: ''
})

const fileSize = ref(1)
const sizeUnit = ref('MB')

// 添加保存时间相关的响应式变量
const saveTime = ref(1)
const saveTimeUnit = ref('天')

// 转换时间为秒
const convertToSeconds = (time: number, unit: string): number => {
  const units = {
    秒: 1,
    分: 60,
    时: 3600,
    天: 86400
  }
  return time * units[unit as keyof typeof units]
}

const refreshData = () => {
  api({
    url: 'admin/config/get',
    method: 'get'
  }).then((res: any) => {
    config.value = res.detail

    // 将字节转换为合适的单位
    let size = config.value.uploadSize
    if (size >= 1024 * 1024 * 1024) {
      fileSize.value = Math.round(size / (1024 * 1024 * 1024))
      sizeUnit.value = 'GB'
    } else if (size >= 1024 * 1024) {
      fileSize.value = Math.round(size / (1024 * 1024))
      sizeUnit.value = 'MB'
    } else {
      fileSize.value = Math.round(size / 1024)
      sizeUnit.value = 'KB'
    }

    // 时间单位转换逻辑
    let seconds = config.value.max_save_seconds
    if (seconds === 0) {
      // 如果是0，显示为7天
      saveTime.value = 7
      saveTimeUnit.value = '天'
    } else if (seconds % 86400 === 0 && seconds >= 86400) {
      saveTime.value = seconds / 86400
      saveTimeUnit.value = '天'
    } else if (seconds % 3600 === 0 && seconds >= 3600) {
      saveTime.value = seconds / 3600
      saveTimeUnit.value = '时'
    } else if (seconds % 60 === 0 && seconds >= 60) {
      saveTime.value = seconds / 60
      saveTimeUnit.value = '分'
    } else {
      saveTime.value = seconds
      saveTimeUnit.value = '秒'
    }
  })
}
const alertStore = useAlertStore()
// 转换文件大小为字节
const convertToBytes = (size: number, unit: string): number => {
  const units = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
  }
  return size * units[unit as keyof typeof units]
}

const submitSave = () => {
  const formData = { ...config.value }
  formData.uploadSize = convertToBytes(fileSize.value, sizeUnit.value)

  // 如果保存时间为0，则默认设置为7天
  if (saveTime.value === 0) {
    formData.max_save_seconds = 7 * 86400 // 7天转换为秒
  } else {
    formData.max_save_seconds = convertToSeconds(saveTime.value, saveTimeUnit.value)
  }

  api({
    url: 'admin/config/update',
    method: 'patch',
    data: formData
  }).then((res: any) => {
    if (res.code == 200) {
      alertStore.showAlert('保存成功', 'success')
    } else {
      alertStore.showAlert(res.message, 'error')
    }
  })
}

refreshData()
</script>

<template>
  <div class="p-6 h-screen overflow-y-auto custom-scrollbar">
    <h2 class="text-2xl font-bold mb-6" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
      系统设置
    </h2>

    <div class="space-y-6 rounded-lg shadow-md p-6" :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
      <!-- 基本设置 -->
      <section class="space-y-4">
        <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
          基本设置
        </h3>

        <!-- 网基本信息 -->
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              网站名称
            </label>
            <input type="text" v-model="config.name"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              网站描述
            </label>
            <input type="text" v-model="config.description"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              管理员密码
            </label>
            <div class="relative">
              <input type="password" minlength="6" v-model="config.admin_token" placeholder="留空则不修改密码"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="[
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                ]" />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400"
                :class="[isDarkMode ? 'text-gray-500' : 'text-gray-400']">
                <span class="text-xs">留空则不修改</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              关键词
            </label>
            <input type="text" v-model="config.keywords"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]" />
          </div>

          <!-- 主题选择 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              主题选择
            </label>
            <select v-model="config.themesSelect"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              ]" style="
                background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E');
              ">
              <option v-for="item in config.themesChoices" :value="item.key" :key="item.key">
                {{ item.name }} (by {{ item.author }} V{{ item.version }})
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              Robots.txt
            </label>
            <textarea v-model="config.robotsText" rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"></textarea>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="grid grid-cols-1 gap-6 mt-8">
          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              通知标题
            </label>
            <input type="text" v-model="config.notify_title"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              通知内容
            </label>
            <textarea v-model="config.notify_content" rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"></textarea>
          </div>
        </div>

        <!-- 存储设置 -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            存储设置
          </h3>
          <!-- 通知设置 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
              存储路径
            </label>
            <input type="text" placeholder="留空则使用默认路径，可不填写" v-model="config.storage_path"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]" />
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                存储方式
              </label>
              <select v-model="config.file_storage"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                :class="[
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                ]" style="
                  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E');
                ">
                <option value="local">本地存储</option>
                <option value="s3">S3 存储</option>
                <option value="webdav">Webdav 存储</option>
              </select>
            </div>
            <div class="space-y-2" v-if="config.file_storage === 'local'">
              <label class="block text-sm font-medium mb-2" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                开启切片上传（实验性功能，还在开发中，目前仅本地存储可用，可能会出现未知问题）
              </label>
              <div class="flex items-center">
                <button type="button" @click="config.enableChunk = config.enableChunk === 1 ? 0 : 1"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  :class="[config.enableChunk === 1 ? 'bg-indigo-600' : 'bg-gray-200']" role="switch"
                  :aria-checked="config.enableChunk === 1">
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="[
                      config.enableChunk === 1 ? 'translate-x-5' : 'translate-x-0',
                      isDarkMode && config.enableChunk !== 1 ? 'bg-gray-100' : 'bg-white'
                    ]" />
                </button>
                <span class="ml-3 text-sm" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ config.enableChunk === 1 ? '已开启' : '已关闭' }}
                </span>
              </div>
            </div>
            <div v-if="config.file_storage === 'webdav'" class="space-y-4">
              <!-- 通知设置 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  Webdav URL
                </label>
                <input type="text" placeholder="请输入 Webdav URL" v-model="config.webdav_url"
                  class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    Webdav Username
                  </label>
                  <input type="text" placeholder="请输入 Webdav Username" v-model="config.webdav_username"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    Webdav Password
                  </label>
                  <input type="password" placeholder="请输入 Webdav Password" v-model="config.webdav_password"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>
              </div>
            </div>
            <!-- S3 配置 -->
            <div v-if="config.file_storage === 's3'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 AccessKeyId
                  </label>
                  <input type="text" v-model="config.s3_access_key_id"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 SecretAccessKey
                  </label>
                  <input type="password" v-model="config.s3_secret_access_key"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 BucketName
                  </label>
                  <input type="text" v-model="config.s3_bucket_name"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 EndpointUrl
                  </label>
                  <input type="text" v-model="config.s3_endpoint_url"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 Region Name
                  </label>
                  <input type="text" v-model="config.s3_region_name" placeholder="auto"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 Signature Version
                  </label>
                  <select v-model="config.s3_signature_version"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    ]">
                    <option value="s3v2">S3v2</option>
                    <option value="s3v4">S3v4</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    S3 Hostname
                  </label>
                  <input type="text" v-model="config.s3_hostname"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]" />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium mb-2"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                    启用代理
                  </label>
                  <div class="flex items-center">
                    <button type="button" @click="config.s3_proxy = config.s3_proxy === 1 ? 0 : 1"
                      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      :class="[config.s3_proxy === 1 ? 'bg-indigo-600' : 'bg-gray-200']" role="switch"
                      :aria-checked="config.s3_proxy === 1">
                      <span
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        :class="[
                          config.s3_proxy === 1 ? 'translate-x-5' : 'translate-x-0',
                          isDarkMode && config.s3_proxy !== 1 ? 'bg-gray-100' : 'bg-white'
                        ]" />
                    </button>
                    <span class="ml-3 text-sm" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                      {{ config.s3_proxy === 1 ? '已开启' : '已关闭' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传限制 -->
        <div class="mt-8">
          <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            上传限制
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                每分钟上传限制
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="config.uploadMinute"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">分钟</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                上传数量限制
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="config.uploadCount"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">个文件</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                文件大小限制
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="fileSize"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <select v-model="sizeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  ]">
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium mb-2" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                过期方式
              </label>
              <div class="flex flex-wrap gap-3">
                <label v-for="style in ['day', 'hour', 'minute', 'forever', 'count']" :key="style"
                  class="relative inline-flex items-center group cursor-pointer">
                  <input type="checkbox" :value="style" v-model="config.expireStyle" class="peer sr-only" />
                  <div class="px-4 py-2 rounded-full border-2 transition-all duration-200 select-none" :class="[
                    config.expireStyle.includes(style)
                      ? isDarkMode
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-indigo-600 border-indigo-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-500'
                  ]">
                    {{
                      {
                        day: '按天',
                        hour: '按小时',
                        minute: '按分钟',
                        forever: '永久',
                        count: '按次数'
                      }[style]
                    }}
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                最长保存时间
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="saveTime"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <select v-model="saveTimeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  ]">
                  <option value="秒">秒</option>
                  <option value="分">分</option>
                  <option value="时">时</option>
                  <option value="天">天</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium mb-2" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                游客上传
              </label>
              <div class="flex items-center">
                <button type="button" @click="config.openUpload = config.openUpload === 1 ? 0 : 1"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  :class="[config.openUpload === 1 ? 'bg-indigo-600' : 'bg-gray-200']" role="switch"
                  :aria-checked="config.openUpload === 1">
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="[
                      config.openUpload === 1 ? 'translate-x-5' : 'translate-x-0',
                      isDarkMode && config.openUpload !== 1 ? 'bg-gray-100' : 'bg-white'
                    ]" />
                </button>
                <span class="ml-3 text-sm" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ config.openUpload === 1 ? '已开启' : '已关闭' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误限制 -->
        <div class="mt-8">
          <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            错误限制
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                每分钟错误限制
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="config.errorMinute"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">分钟</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                错误次数限制
              </label>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="config.errorCount"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">次</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end mt-8">
          <button @click="submitSave"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            保存设置
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped></style>
