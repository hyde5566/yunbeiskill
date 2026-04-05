import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'user',
          name: 'UserList',
          component: () => import('../views/system/UserList.vue'),
          meta: { permission: 'user:manage' }
        },
        {
          path: 'role',
          name: 'RoleList',
          component: () => import('../views/system/RoleList.vue'),
          meta: { permission: 'role:manage' }
        },
        {
          path: 'permission',
          name: 'PermissionList',
          component: () => import('../views/system/PermissionList.vue'),
          meta: { permission: 'permission:manage' }
        },
        {
          path: 'org',
          name: 'OrgList',
          component: () => import('../views/system/OrgList.vue'),
          meta: { permission: 'org:manage' }
        },
        {
          path: 'skill',
          name: 'SkillList',
          component: () => import('../views/skill/SkillList.vue'),
          meta: { permission: 'skill:manage' }
        },
        {
          path: 'skill/:id',
          name: 'SkillDetail',
          component: () => import('../views/skill/SkillDetail.vue'),
          meta: { permission: 'skill:manage' }
        },
        {
          path: 'skill-category',
          name: 'CategoryList',
          component: () => import('../views/skill/CategoryList.vue'),
          meta: { permission: 'skill:manage' }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/')
  } else if (to.meta.permission) {
    // 检查权限
    if (userStore.hasPermission(to.meta.permission as string)) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router