<template>
  <div class="p-6 overflow-y-auto custom-scrollbar">
    <h2 class="text-2xl font-bold mb-6" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
      {{ t('admin.dashboard.title') }}
    </h2>
    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        :title="t('admin.dashboard.totalFiles')"
        :value="dashboardData.totalFiles"
        :icon="FileIcon"
        icon-color="indigo"
        description-type="success">
        <template #description>
          <span>{{ t('admin.dashboard.yesterday') }}：{{ dashboardData.yesterdayCount }}</span>
          <span class="ml-2">{{ t('admin.dashboard.today') }}：{{ dashboardData.todayCount }}</span>
        </template>
      </StatCard>

      <StatCard
        :title="t('admin.dashboard.storageSpace')"
        :value="dashboardData.storageUsed"
        :icon="HardDriveIcon"
        icon-color="purple"
        description-type="success">
        <template #description>
          <span>{{ t('admin.dashboard.yesterday') }}：{{ dashboardData.yesterdaySize }}</span>
          <span class="ml-2">{{ t('admin.dashboard.today') }}：{{ dashboardData.todaySize }}</span>
        </template>
      </StatCard>

      <StatCard
:title="t('admin.dashboard.activeUsers')"
        value="25"
        :icon="UsersIcon"
        icon-color="green"
        description-type="error">
        <template #description>
          <span>{{ t('admin.dashboard.weeklyChange') }}</span>
        </template>
      </StatCard>

      <StatCard
:title="t('admin.dashboard.systemStatus')"
:value="t('admin.dashboard.normal')"
        :icon="ActivityIcon"
        icon-color="blue"
        description-type="neutral">
        <template #description>
          {{ t('admin.dashboard.serverUptime') }}: {{ dashboardData.sysUptime }}
        </template>
      </StatCard>
    </div>

    <!-- 添加版本和版权信息 -->
    <div class="mt-auto text-center py-4" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
      <p class="text-sm">
        版本 v2.2.1 更新时间：2025-09-04
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
} from 'lucide-vue-next'
import { StatsService } from '@/services'
import type { DashboardData } from '@/types'
import StatCard from '@/components/common/StatCard.vue'
import { useI18n } from 'vue-i18n'
const isDarkMode = inject('isDarkMode')
const { t } = useI18n()

const dashboardData = reactive<DashboardData>({
  totalFiles: 0,
  storageUsed: 0,
  yesterdayCount: 0,
  todayCount: 0,
  yesterdaySize: 0,
  todaySize: 0,
  sysUptime: 0
})

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
  const response = await StatsService.getDashboard()
  if (response.detail) {
    dashboardData.totalFiles = response.detail.totalFiles
    dashboardData.storageUsed = getLocalstorageUsed(response.detail.storageUsed.toString())
    dashboardData.yesterdaySize = getLocalstorageUsed(response.detail.yesterdaySize.toString())
    dashboardData.todaySize = getLocalstorageUsed(response.detail.todaySize.toString())
    dashboardData.yesterdayCount = response.detail.yesterdayCount
    dashboardData.todayCount = response.detail.todayCount
    dashboardData.sysUptime = getSysUptime(Number(response.detail.sysUptime))
  }
}

onMounted(() => {
  getDashboardData()
})
</script>
