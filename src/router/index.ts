import { createRouter, createWebHistory } from 'vue-router'
import api from '@/utils/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Retrieve',
      component: () => import('@/views/RetrievewFileView.vue')
    },
    {
      path: '/send',
      name: 'Send',
      component: () => import('@/views/SendFileView.vue')
    },
    {
      path: '/admin',
      component: () => import('@/views/AdminView.vue'),
      children: [
        {
          path: '',
          name: 'Admin',
          redirect: '/admin/fileList'
        },
        {
          path: 'fileList',
          name: 'AdminFileList',
          component: () => import('@/components/admin/FileListComponent.vue')
        },
        {
          path: 'systemConfig',
          name: 'AdminSystemConfig',
          component: () => import('@/components/admin/SystemConfigComponent.vue')
        },
        {
          path: 'login',
          name: 'AdminLogin',
          component: () => import('@/views/LoginView.vue')
        }
      ]
    }
  ]
})

// 预加载 SendFileView 组件
import('../views/SendFileView.vue')

// 添加全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要管理员权限
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    // 检查是否已登录（通过获取本地存储的 admin_token）
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      // 如果没有 admin_token，重定向到登录页面
      next('/admin/login')
      return
    }
    
    try {
      // 使用 login 接口验证 admin_token 是否有效
      await api.post('/admin/login', {}, {
        headers: {
          'Authorization': adminToken
        }
      })
      // token 有效,允许访问
      next()
    } catch (error) {
      console.error('验证 token 时出错:', error)
      localStorage.removeItem('admin_token')
      next('/admin/login')
    }
  } else {
    // 不需要管理员权限的路由，直接放行
    next()
  }
})



export default router
