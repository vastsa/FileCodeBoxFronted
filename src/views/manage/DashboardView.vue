<template>
  <div class="p-6 h-screen overflow-y-auto custom-scrollbar">
    <h2 class="text-2xl font-bold mb-6" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
      仪表盘
    </h2>

    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="p-6 rounded-lg shadow-md transition-colors duration-300"
        :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              总文件数
            </p>
            <h3 class="text-2xl font-bold mt-1" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              {{ dashboardData.totalFiles }}
            </h3>
          </div>
          <div class="p-3 rounded-full" :class="[isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100']">
            <FileIcon class="w-6 h-6" :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']" />
          </div>
        </div>
        <p class="text-sm mt-2" :class="[isDarkMode ? 'text-green-400' : 'text-green-600']">
          <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">昨天：</span>
          <span>{{ dashboardData.yesterdayCount }} </span>
          <span class="ml-2" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">今天：</span>
          <span>{{ dashboardData.todayCount }} </span>
        </p>
      </div>

      <div class="p-6 rounded-lg shadow-md transition-colors duration-300"
        :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              存储空间
            </p>
            <h3 class="text-2xl font-bold mt-1" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              {{ dashboardData.storageUsed }}
            </h3>
          </div>
          <div class="p-3 rounded-full" :class="[isDarkMode ? 'bg-purple-900' : 'bg-purple-100']">
            <HardDriveIcon class="w-6 h-6" :class="[isDarkMode ? 'text-purple-400' : 'text-purple-600']" />
          </div>
        </div>

        <p class="text-sm mt-2" :class="[isDarkMode ? 'text-green-400' : 'text-green-600']">
          <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">昨天：</span>
          <span>{{ dashboardData.yesterdaySize }} </span>
          <span class="ml-2" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">今天：</span>
          <span>{{ dashboardData.todaySize }} </span>
        </p>
      </div>

      <div class="p-6 rounded-lg shadow-md transition-colors duration-300"
        :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              活跃用户
            </p>
            <h3 class="text-2xl font-bold mt-1" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              25
            </h3>
          </div>
          <div class="p-3 rounded-full" :class="[isDarkMode ? 'bg-green-900' : 'bg-green-100']">
            <UsersIcon class="w-6 h-6" :class="[isDarkMode ? 'text-green-400' : 'text-green-600']" />
          </div>
        </div>
        <p class="text-sm mt-2" :class="[isDarkMode ? 'text-red-400' : 'text-red-600']">
          <span>↓ 5% </span>
          <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">较上周</span>
        </p>
      </div>

      <div class="p-6 rounded-lg shadow-md transition-colors duration-300"
        :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              系统状态
            </p>
            <h3 class="text-2xl font-bold mt-1" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
              正常
            </h3>
          </div>
          <div class="p-3 rounded-full" :class="[isDarkMode ? 'bg-blue-900' : 'bg-blue-100']">
            <ActivityIcon class="w-6 h-6" :class="[isDarkMode ? 'text-blue-400' : 'text-blue-600']" />
          </div>
        </div>
        <p class="text-sm mt-2" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
          服务器运行时间: {{ dashboardData.sysUptime }}
        </p>
      </div>
    </div>

    <!-- 添加版本和版权信息 -->
    <div class="mt-auto text-center py-4" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
      <p class="text-sm">
        版本 v2.0.3 更新时间：2025-03-03
      </p>
      <p class="text-sm mt-1">
        © {{ new Date().getFullYear() }} <a href="https://github.com/vastsa/FileCodeBox">FileCodeBox</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, reactive } from 'vue'
import {
  FileIcon,
  HardDriveIcon,
  UsersIcon,
  ActivityIcon,
  UploadIcon,
  TrashIcon,
  UserIcon
} from 'lucide-vue-next'
const isDarkMode = inject('isDarkMode')
import api from '@/utils/api'

const dashboardData: any = reactive({
  totalFiles: 0,
  storageUsed: 0,
  yesterdayCount: 0,
  todayCount: 0,
  yesterdaySize: 0,
  todaySize: 0,
  sysUptime: 0
})

// 添加最近活动数据
const recentActivities = [
  {
    icon: UploadIcon,
    description: '张三上传了文件 "项目计划.pdf"',
    time: '10分钟前'
  },
  {
    icon: UserIcon,
    description: '新用户李四加入了系统',
    time: '30分钟前'
  },
  {
    icon: TrashIcon,
    description: '王五删除了文件 "旧文档.doc"',
    time: '1小时前'
  },
  {
    icon: FileIcon,
    description: '系统自动备份完成',
    time: '2小时前'
  }
]

const getSysUptime = (startTimestamp: number) => {
  const now = new Date().getTime()
  const uptime = now - startTimestamp
  const days = Math.floor(uptime / (24 * 60 * 60 * 1000))
  const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${days}天${hours}小时`
}

const getLocalstorageUsed = (nowUsedBit: string) => {
  const kb = parseInt(nowUsedBit) / 1024
  const mb = kb / 1024
  const gb = mb / 1024
  const tb = gb / 1024
  // 根据大小选择合适的单位
  if (tb > 1) {
    return `${tb.toFixed(2)}TB`
  } else if (gb > 1) {
    return `${gb.toFixed(2)}GB`
  } else if (mb > 1) {
    return `${mb.toFixed(2)}MB`
  } else if (kb > 1) {
    return `${kb.toFixed(2)}KB`
  } else {
    return `${nowUsedBit}B`
  }
}
const getDashboardData = async () => {
  const response: any = await api.get('admin/dashboard')
  dashboardData.totalFiles = response.detail.totalFiles
  dashboardData.storageUsed = getLocalstorageUsed(response.detail.storageUsed)
  dashboardData.yesterdaySize = getLocalstorageUsed(response.detail.yesterdaySize)
  dashboardData.todaySize = getLocalstorageUsed(response.detail.todaySize)
  dashboardData.yesterdayCount = response.detail.yesterdayCount
  dashboardData.todayCount = response.detail.todayCount
  dashboardData.sysUptime = getSysUptime(response.detail.sysUptime)
}

onMounted(() => {
  getDashboardData()
})
</script>
