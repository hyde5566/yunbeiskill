import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/Index.vue')
      },
      {
        path: 'admin/users',
        name: 'UserList',
        component: () => import('@/pages/admin/UserList.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/departments',
        name: 'DepartmentList',
        component: () => import('@/pages/admin/DepartmentList.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/permissions',
        name: 'PermissionConfig',
        component: () => import('@/pages/admin/PermissionConfig.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/projects',
        name: 'ProjectList',
        component: () => import('@/pages/admin/ProjectList.vue'),
        meta: { permission: 'admin' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')

  // 公开页面直接访问
  if (to.meta.public) {
    next()
    return
  }

  // 未登录跳转登录页
  if (!token) {
    next('/login')
    return
  }

  // 解析用户信息检查权限
  let userInfo: any = null
  if (userInfoStr) {
    try {
      userInfo = JSON.parse(userInfoStr)
    } catch (e) {
      localStorage.removeItem('userInfo')
      next('/login')
      return
    }
  }

  if (!userInfo) {
    next('/login')
    return
  }

  // 权限检查
  const requiredPerm = to.meta.permission as string
  if (requiredPerm && !userInfo.permissions?.includes(requiredPerm)) {
    if (!userInfo.permissions?.includes('admin')) {
      next('/')
      return
    }
  }

  next()
})

export default router