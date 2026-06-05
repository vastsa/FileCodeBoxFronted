<template>
  <div
    class="flex h-screen overflow-hidden flex-col transition-colors duration-300 lg:flex-row"
    :class="[isDarkMode ? 'bg-[#101012]' : 'bg-[#f5f5f7]']"
  >
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 transform flex-col border-r lg:relative lg:h-screen lg:translate-x-0"
      :class="[
        isDarkMode
          ? 'border-white/10 bg-zinc-900/80 backdrop-blur-2xl shadow-[12px_0_40px_-28px_rgba(255,255,255,0.18)]'
          : 'border-white/80 bg-white/70 backdrop-blur-2xl shadow-[12px_0_40px_-28px_rgba(24,24,27,0.24)]',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'transition-transform duration-300 ease-in-out lg:transition-none'
      ]"
    >
      <!-- Logo区域 -->
      <div
        class="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4"
        :class="[isDarkMode ? 'border-white/10' : 'border-zinc-200/70']"
      >
        <div class="flex min-w-0 items-center">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors"
            :class="[isDarkMode ? 'bg-white/10 text-zinc-100' : 'bg-zinc-950 text-white']"
          >
            <BoxIcon class="h-5 w-5 shrink-0" />
          </div>
          <h1
            @click="router.push('/')"
            class="ml-2 min-w-0 truncate text-xl font-semibold cursor-pointer"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ t('common.appName') }}
          </h1>
        </div>
        <button @click="toggleSidebar" class="shrink-0 lg:hidden">
          <XIcon class="w-6 h-6" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']" />
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar">
        <ul class="p-4 space-y-2">
          <li v-for="item in menuItems" :key="item.id">
            <RouterLink
              :to="item.redirect"
              class="flex h-10 w-full items-center rounded-lg border-l-4 px-3 text-sm font-medium"
              :class="[
                route.name === item.id
                  ? isDarkMode
                    ? 'border-zinc-200 bg-white/10 text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'border-zinc-900 bg-zinc-900/[0.06] text-zinc-950 shadow-sm'
                  : isDarkMode
                    ? 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                    : 'border-transparent text-zinc-500 hover:bg-zinc-900/[0.04] hover:text-zinc-900'
              ]"
            >
              <component :is="item.icon" class="mr-3 h-5 w-5 shrink-0" />
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- 退出登录按钮 -->
      <div class="p-4 border-t" :class="[isDarkMode ? 'border-white/10' : 'border-zinc-200/70']">
        <button
          @click="handleLogout"
          class="flex items-center w-full p-2 rounded-lg transition-colors duration-200"
          :class="[
            isDarkMode
              ? 'text-zinc-400 hover:bg-white/5 hover:text-white'
              : 'text-zinc-500 hover:bg-zinc-900/[0.04] hover:text-zinc-950'
          ]"
        >
          <LogOutIcon class="w-5 h-5 mr-3" />
          {{ t('admin.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <!-- Header -->
      <header
        class="border-b transition-colors duration-300 h-16 backdrop-blur-xl"
        :class="[isDarkMode ? 'border-white/10 bg-zinc-900/70' : 'border-white/80 bg-white/60']"
      >
        <div class="flex items-center justify-between h-16 px-4">
          <button @click="toggleSidebar" class="lg:hidden">
            <MenuIcon class="w-6 h-6" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']" />
          </button>
        </div>
      </header>

      <!-- Content -->
      <main
        class="min-h-0 flex-1 overflow-y-auto transition-colors duration-300 custom-scrollbar"
        :class="[isDarkMode ? 'bg-[#101012]' : 'bg-[#f5f5f7]']"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import {
  BoxIcon,
  MenuIcon,
  XIcon,
  FolderIcon,
  CogIcon,
  LayoutDashboardIcon,
  LogOutIcon
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ROUTE_NAMES, ROUTES } from '@/constants'
import { useAdminSession } from '@/composables'

interface MenuItem {
  id: string
  name: string
  icon: typeof LayoutDashboardIcon
  redirect: string
}

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const isDarkMode = inject('isDarkMode')
const { verifySession, logout } = useAdminSession()
const menuItems: MenuItem[] = [
  {
    id: ROUTE_NAMES.DASHBOARD,
    name: t('admin.dashboard.title'),
    icon: LayoutDashboardIcon,
    redirect: ROUTES.DASHBOARD
  },
  {
    id: ROUTE_NAMES.FILE_MANAGE,
    name: t('admin.fileManage.title'),
    icon: FolderIcon,
    redirect: ROUTES.FILE_MANAGE
  },
  {
    id: ROUTE_NAMES.SETTINGS,
    name: t('admin.settings.title'),
    icon: CogIcon,
    redirect: ROUTES.SETTINGS
  }
]

const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 响应式处理
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isSidebarOpen.value = true
  } else {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  void verifySession().then((isValid) => {
    if (!isValid) {
      void router.push(ROUTES.LOGIN)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 登出处理
const handleLogout = async () => {
  await logout()
  await router.push(ROUTES.LOGIN)
}
</script>

<style>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.4s;
}

.dark .slider {
  background-color: #4b5563;
}

input:checked + .slider {
  background-color: #18181b;
}

.dark input:checked + .slider {
  background-color: #f4f4f5;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

.dark .slider:before {
  background-color: #e5e7eb;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 3px;

    &:hover {
      background-color: #a0aec0;
    }
  }
}

/* 暗黑模式下的滚动条样式 */
:global(.dark) .custom-scrollbar {
  &::-webkit-scrollbar-thumb {
    background-color: #4a5568;

    &:hover {
      background-color: #2d3748;
    }
  }
}
</style>
