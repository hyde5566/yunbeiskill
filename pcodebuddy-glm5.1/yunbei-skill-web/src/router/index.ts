import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../pages/dashboard/Index.vue'),
        meta: { title: '首页', icon: 'DashboardOutlined' },
      },
      // Skill 检索中心
      {
        path: 'skill/search',
        name: 'SkillSearch',
        component: () => import('../pages/skill/SearchCenter.vue'),
        meta: { title: 'Skill检索中心', icon: 'SearchOutlined' },
      },
      {
        path: 'skill/detail/:id',
        name: 'SkillDetail',
        component: () => import('../pages/skill/Detail.vue'),
        meta: { title: 'Skill详情', hidden: true },
      },
      {
        path: 'skill/submit',
        name: 'SkillSubmit',
        component: () => import('../pages/skill/Submit.vue'),
        meta: { title: '提交Skill', icon: 'PlusOutlined' },
      },
      {
        path: 'skill/submit/:id',
        name: 'SkillEdit',
        component: () => import('../pages/skill/Submit.vue'),
        meta: { title: '编辑Skill', hidden: true },
      },
      {
        path: 'skill/my-submissions',
        name: 'MySubmissions',
        component: () => import('../pages/skill/MySubmissions.vue'),
        meta: { title: '我的提交', icon: 'FileTextOutlined' },
      },
      // 审核
      {
        path: 'review/pending',
        name: 'ReviewPending',
        component: () => import('../pages/review/PendingList.vue'),
        meta: { title: '审核管理', icon: 'AuditOutlined', requireReview: true },
      },
      {
        path: 'review/detail/:id',
        name: 'ReviewDetail',
        component: () => import('../pages/review/ReviewDetail.vue'),
        meta: { title: '审核详情', hidden: true, requireReview: true },
      },
      // 下载记录
      {
        path: 'download/my',
        name: 'MyDownloads',
        component: () => import('../pages/download/MyDownloads.vue'),
        meta: { title: '我的下载', icon: 'DownloadOutlined' },
      },
      // 通知
      {
        path: 'notification',
        name: 'NotificationList',
        component: () => import('../pages/notification/NotificationList.vue'),
        meta: { title: '站内通知', icon: 'BellOutlined' },
      },
      // 管理员页面
      {
        path: 'admin/users',
        name: 'UserList',
        component: () => import('../pages/admin/UserList.vue'),
        meta: { title: '用户管理', icon: 'UserOutlined', requireAdmin: true },
      },
      {
        path: 'admin/departments',
        name: 'DepartmentList',
        component: () => import('../pages/admin/DepartmentList.vue'),
        meta: { title: '部门管理', icon: 'ApartmentOutlined', requireAdmin: true },
      },
      {
        path: 'admin/permissions',
        name: 'PermissionConfig',
        component: () => import('../pages/admin/PermissionConfig.vue'),
        meta: { title: '权限配置', icon: 'SafetyOutlined', requireAdmin: true },
      },
      {
        path: 'admin/projects',
        name: 'ProjectList',
        component: () => import('../pages/admin/ProjectList.vue'),
        meta: { title: '项目管理', icon: 'ProjectOutlined', requireAdmin: true },
      },
      {
        path: 'admin/projects/:id/members',
        name: 'ProjectMembers',
        component: () => import('../pages/admin/ProjectMembers.vue'),
        meta: { title: '项目成员', hidden: true, requireAdmin: true },
      },
      {
        path: 'admin/feedbacks',
        name: 'FeedbackManage',
        component: () => import('../pages/admin/FeedbackManage.vue'),
        meta: { title: '反馈管理', icon: 'CommentOutlined', requireAdmin: true },
      },
      {
        path: 'admin/statistics',
        name: 'Statistics',
        component: () => import('../pages/admin/Statistics.vue'),
        meta: { title: '统计管理', icon: 'BarChartOutlined', requireAdmin: true },
      },
      {
        path: 'admin/operation-logs',
        name: 'OperationLogs',
        component: () => import('../pages/admin/OperationLogs.vue'),
        meta: { title: '操作日志', icon: 'FileSearchOutlined', requireAdmin: true },
      },
      {
        path: 'admin/login-logs',
        name: 'LoginLogs',
        component: () => import('../pages/admin/LoginLogs.vue'),
        meta: { title: '登录日志', icon: 'LoginOutlined', requireAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '云贝Skill'} - 云贝Skill管理系统`

  // 公开页面直接通过
  if (to.meta.public) {
    const token = localStorage.getItem('token')
    if (token && to.name === 'Login') {
      next({ path: '/dashboard' })
      return
    }
    next()
    return
  }

  // 检查登录
  const token = localStorage.getItem('token')
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 检查权限
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  const isAdmin = permissions.includes('admin')
  const isReview = permissions.includes('review')

  if (to.meta.requireAdmin && !isAdmin) {
    next({ path: '/dashboard' })
    return
  }

  if (to.meta.requireReview && !isAdmin && !isReview) {
    next({ path: '/dashboard' })
    return
  }

  next()
})

export default router
