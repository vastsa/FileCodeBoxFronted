<template>
  <div class="min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300"
    :class="[isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-100 to-purple-100']">
    <div class="w-full max-w-4xl relative z-10">
      <div class="rounded-3xl shadow-2xl overflow-hidden border transform transition-all duration-300 hover:scale-105"
        :class="[isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-xl border-gray-600' : 'bg-white border-gray-200']">
        <div class="p-2 sm:p-6 md:p-10">
          <div class="flex justify-center mb-6 sm:mb-8">
            <div class="rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 p-1 animate-pulse">
              <div class="rounded-full bg-white p-2">
                <CloudDownloadIcon class="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" @click="handleCloudDownloadIconClick" />
              </div>
            </div>
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold mb-6 sm:mb-8 text-center animate-pulse cursor-pointer"
            :class="[isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300' : 'text-indigo-600']"
            @click="toSend">
            文件取件
          </h1>

          <div class="mb-4 text-center">
            <span
              class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
              安全加密
            </span>
            <span
              class="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
              快速传输
            </span>
            <span
              class="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
              临时存储
            </span>
          </div>

          <form @submit.prevent="handleSubmit" class="mb-8 sm:mb-10">
            <div class="relative">
              <input v-model="code" type="text"
                class="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                :class="[isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100']" placeholder="请输入5位取件码" required
                maxlength="5" :readonly="inputStatus.readonly" />
              <button type="submit"
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
                :disabled="inputStatus.loading"
                @click="handleSubmit">
                <span class="flex items-center">
                  <span>{{ inputStatus.loading ? '处理中...' : '提取文件' }}</span>
                  <ArrowRightIcon class="w-5 h-5 ml-2" />
                </span>
              </button>
            </div>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              想发送文件？
              <a @click="toSend" class="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">点击这里</a>
            </p>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-8">
        <button @click="toggleRecords"
          class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
            {{ showRecords ? '隐藏取件记录' : '查看取件记录' }}
        </button>
      </div>
    </div>
    <RetrieveHistory v-if="showRecords" @close="showRecords = false" />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { CloudDownloadIcon, ArrowRightIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useFileDataStore } from '@/stores/fileData'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alertStore'
import RetrieveHistory from '@/components/infoshow/RetrieveHistory.vue'
const alertStore = useAlertStore()
const router = useRouter()
const isDarkMode = inject('isDarkMode')
const fileStore = useFileDataStore()
const code = ref('')
const inputStatus = ref({
  readonly: false,
  loading: false
})

const showRecords = ref(false)
/*
    文件
    "detail": {
        "code": "16747",
        "name": "1610.02391v4.pdf",
        "size": 7262053,
        "text": "/share/download?key=7044139cf46761e2b0e7648833d4b0d1e1cd6e9934a0e441c849ec6df286e781&code=16747"
    }
    文本
    "detail": {
        "code": "92416",
        "name": "文本分享",
        "size": 13,
        "text": "asdasdasasdas"
    }
*/
const handleSubmit = async () => {
  if (code.value.length !== 5) {
    alertStore.showAlert('请输入5位取件码', 'error')
    return
  }

  inputStatus.value.loading = true
  inputStatus.value.readonly = true

  try {
    const response = await api.post('share/select/', { code: code.value })
    if (response.code === 200) {
      fileStore.addReceiveData({
        ...response.detail,
      })
      showRecords.value = true
    } else {
      alertStore.showAlert(response.detail, 'error')
    }
  } catch (error) {
    console.error('文件获取失败:', error)
    alertStore.showAlert('文件获取失败，请稍后重试', 'error')
  } finally {
    inputStatus.value.loading = false
    inputStatus.value.readonly = false
  }
}

function toSend() {
  router.push('/send')
}

function toggleRecords() {
  showRecords.value = !showRecords.value
}

const clickCount = ref(0)
const handleCloudDownloadIconClick = () => {
  clickCount.value++
  if (clickCount.value === 5) {
    router.push('/admin')
    clickCount.value = 0
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}
</style>
