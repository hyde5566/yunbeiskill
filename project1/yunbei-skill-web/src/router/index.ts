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
      },
      {
        path: 'admin/categories',
        name: 'CategoryList',
        component: () => import('@/pages/admin/CategoryList.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/logs',
        name: 'OperationLogs',
        component: () => import('@/pages/admin/OperationLogs.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/login-logs',
        name: 'LoginLogs',
        component: () => import('@/pages/admin/LoginLogs.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'admin/stats',
        name: 'Statistics',
        component: () => import('@/pages/admin/Statistics.vue'),
        meta: { permission: 'admin' }
      },
      {
        path: 'skill',
        name: 'SkillList',
        component: () => import('@/pages/skill/SkillList.vue')
      },
      {
        path: 'skill/submit',
        name: 'SkillSubmit',
        component: () => import('@/pages/skill/SkillSubmit.vue')
      },
      {
        path: 'skill/:id',
        name: 'SkillDetail',
        component: () => import('@/pages/skill/SkillDetail.vue')
      },
      {
        path: 'my-downloads',
        name: 'MyDownloads',
        component: () => import('@/pages/user/MyDownloads.vue')
      },
      {
        path: 'my-submissions',
        name: 'MySubmissions',
        component: () => import('@/pages/user/MySubmissions.vue')
      },
      {
        path: 'review',
        name: 'ReviewList',
        component: () => import('@/pages/review/ReviewList.vue'),
        meta: { permission: 'review' }
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