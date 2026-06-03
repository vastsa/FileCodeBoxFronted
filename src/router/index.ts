import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTES } from '@/constants'
import { readStoredToken } from '@/utils/auth-storage'

const publicPageMeta = {
  showGlobalControls: true,
  showRouteLoading: false,
  routeTransition: 'transfer-fade'
}

const adminPageMeta = {
  requiresAuth: true,
  showGlobalControls: false,
  showRouteLoading: false
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.RETRIEVE,
    component: () => import('@/views/RetrievewFileView.vue'),
    meta: {
      ...publicPageMeta,
      title: 'retrieve'
    }
  },
  {
    path: ROUTES.SEND,
    name: ROUTE_NAMES.SEND,
    component: () => import('@/views/SendFileView.vue'),
    meta: {
      ...publicPageMeta,
      title: 'send'
    }
  },
  {
    path: ROUTES.ADMIN,
    name: ROUTE_NAMES.ADMIN,
    component: () => import('@/layout/AdminLayout/AdminLayout.vue'),
    redirect: ROUTES.DASHBOARD,
    meta: adminPageMeta,
    children: [
      {
        path: 'dashboard',
        name: ROUTE_NAMES.DASHBOARD,
        component: () => import('@/views/manage/DashboardView.vue'),
        meta: {
          ...adminPageMeta,
          title: 'dashboard'
        }
      },
      {
        path: 'files',
        name: ROUTE_NAMES.FILE_MANAGE,
        component: () => import('@/views/manage/FileManageView.vue'),
        meta: {
          ...adminPageMeta,
          title: 'files'
        }
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.SETTINGS,
        component: () => import('@/views/manage/SystemSettingsView.vue'),
        meta: {
          ...adminPageMeta,
          title: 'settings'
        }
      }
    ]
  },
  {
    path: ROUTES.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/views/manage/LoginView.vue'),
    meta: {
      showGlobalControls: true,
      showRouteLoading: true,
      title: 'login'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: ROUTES.HOME
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !readStoredToken()) {
    return {
      path: ROUTES.LOGIN,
      query: {
        redirect: to.fullPath
      }
    }
  }
})

export default router
