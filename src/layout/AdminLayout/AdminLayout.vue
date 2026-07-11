<template>
  <div
    class="theme-page flex h-screen overflow-hidden flex-col transition-colors duration-300 lg:flex-row"
  >
    <!-- Sidebar -->
    <aside
      class="theme-surface fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 transform flex-col border-r shadow-[var(--shadow-sidebar)] backdrop-blur-2xl lg:relative lg:h-screen lg:translate-x-0"
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'transition-transform duration-300 ease-in-out lg:transition-none'
      ]"
    >
      <!-- Logo区域 -->
      <div
        class="theme-divider flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4"
      >
        <div class="flex min-w-0 items-center">
          <div
            class="theme-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors"
          >
            <BoxIcon class="h-5 w-5 shrink-0" />
          </div>
          <h1
            @click="router.push('/')"
            class="theme-text-strong ml-2 min-w-0 truncate text-xl font-semibold cursor-pointer"
          >
            {{ t('common.appName') }}
          </h1>
        </div>
        <button @click="toggleSidebar" class="shrink-0 lg:hidden">
          <XIcon class="theme-text-muted w-6 h-6" />
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar">
        <ul class="p-4 space-y-2">
          <li v-for="item in menuItems" :key="item.id">
            <RouterLink
              :to="item.redirect"
              class="flex h-10 w-full items-center rounded-lg border-l-4 px-3 text-sm font-medium"
              :class="route.name === item.id ? 'theme-nav-item-active' : 'theme-nav-item'"
            >
              <component :is="item.icon" class="mr-3 h-5 w-5 shrink-0" />
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- 退出登录按钮 -->
      <div class="theme-divider p-4 border-t">
        <button
          @click="handleLogout"
          class="theme-icon-button flex items-center w-full p-2 rounded-lg transition-colors duration-200"
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
        class="theme-surface border-b transition-colors duration-300 h-16 backdrop-blur-xl"
      >
        <div class="flex items-center justify-between h-16 px-4">
          <button @click="toggleSidebar" class="lg:hidden">
            <MenuIcon class="theme-text-muted w-6 h-6" />
          </button>
        </div>
      </header>

      <!-- Content -->
      <main
        class="theme-page min-h-0 flex-1 overflow-y-auto transition-colors duration-300 custom-scrollbar"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  background-color: rgb(var(--color-surface-muted));
  transition: 0.4s;
}

input:checked + .slider {
  background-color: rgb(var(--color-accent));
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: rgb(var(--color-accent-contrast));
  transition: 0.4s;
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
    background-color: rgb(var(--color-scrollbar));
    border-radius: 3px;

    &:hover {
      background-color: rgb(var(--color-scrollbar-hover));
    }
  }
}

</style>
