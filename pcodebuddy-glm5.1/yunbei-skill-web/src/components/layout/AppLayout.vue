<template>
  <a-layout class="app-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      width="220"
      class="app-sider"
    >
      <div class="logo">
        <div class="logo-icon">S</div>
        <span v-if="!collapsed" class="logo-text">云贝Skill</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="onMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon><DashboardOutlined /></template>
          <span>首页</span>
        </a-menu-item>

        <a-sub-menu key="skill-group">
          <template #icon><AppstoreOutlined /></template>
          <template #title>Skill管理</template>
          <a-menu-item key="/skill/search">
            <template #icon><SearchOutlined /></template>
            <span>Skill检索中心</span>
          </a-menu-item>
          <a-menu-item key="/skill/submit">
            <template #icon><PlusOutlined /></template>
            <span>提交Skill</span>
          </a-menu-item>
          <a-menu-item key="/skill/my-submissions">
            <template #icon><FileTextOutlined /></template>
            <span>我的提交</span>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="/download/my">
          <template #icon><DownloadOutlined /></template>
          <span>我的下载</span>
        </a-menu-item>

        <a-menu-item v-if="hasReviewPermission" key="/review/pending">
          <template #icon><AuditOutlined /></template>
          <span>审核管理</span>
        </a-menu-item>

        <a-menu-item key="/notification">
          <template #icon><BellOutlined /></template>
          <span>站内通知</span>
        </a-menu-item>

        <a-sub-menu v-if="isAdmin" key="admin-group">
          <template #icon><SettingOutlined /></template>
          <template #title>系统管理</template>
          <a-menu-item key="/admin/users">
            <template #icon><UserOutlined /></template>
            <span>用户管理</span>
          </a-menu-item>
          <a-menu-item key="/admin/departments">
            <template #icon><ApartmentOutlined /></template>
            <span>部门管理</span>
          </a-menu-item>
          <a-menu-item key="/admin/permissions">
            <template #icon><SafetyOutlined /></template>
            <span>权限配置</span>
          </a-menu-item>
          <a-menu-item key="/admin/projects">
            <template #icon><ProjectOutlined /></template>
            <span>项目管理</span>
          </a-menu-item>
          <a-menu-item key="/admin/feedbacks">
            <template #icon><CommentOutlined /></template>
            <span>反馈管理</span>
          </a-menu-item>
          <a-menu-item key="/admin/statistics">
            <template #icon><BarChartOutlined /></template>
            <span>统计管理</span>
          </a-menu-item>
          <a-menu-item key="/admin/operation-logs">
            <template #icon><FileSearchOutlined /></template>
            <span>操作日志</span>
          </a-menu-item>
          <a-menu-item key="/admin/login-logs">
            <template #icon><LoginOutlined /></template>
            <span>登录日志</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧区域 -->
    <a-layout>
      <!-- 顶栏 -->
      <a-layout-header class="app-header">
        <div class="header-left">
          <component
            :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            class="trigger"
            @click="collapsed = !collapsed"
          />
          <a-breadcrumb class="header-breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-badge :count="unreadCount" :offset="[-2, 2]">
            <BellOutlined class="header-icon" @click="$router.push('/notification')" />
          </a-badge>
          <a-dropdown>
            <div class="header-user">
              <a-avatar :size="28" style="background-color: #1890ff">
                {{ userInitial }}
              </a-avatar>
              <span class="user-name">{{ userName }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  <span style="margin-left: 8px">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  AppstoreOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  DownloadOutlined,
  AuditOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  ProjectOutlined,
  CommentOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  LoginOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const collapsed = ref(false)
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>(['skill-group'])

const userName = computed(() => authStore.user?.name || authStore.user?.username || '用户')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const unreadCount = computed(() => notificationStore.unreadCount)
const isAdmin = computed(() => authStore.isAdmin)
const hasReviewPermission = computed(() => authStore.hasReviewPermission)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title as string,
  }))
})

watch(
  () => route.path,
  path => {
    selectedKeys.value = [path]
    // 自动展开对应菜单组
    if (path.startsWith('/skill')) {
      openKeys.value = ['skill-group']
    } else if (path.startsWith('/admin')) {
      openKeys.value = ['admin-group']
    }
  },
  { immediate: true }
)

function onMenuClick({ key }: { key: string }) {
  router.push(key)
}

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// 加载未读通知数
notificationStore.fetchUnreadCount()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.app-sider .logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(90deg, #fff, #91d5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 9;
  height: 64px;
  line-height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-breadcrumb {
  line-height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.header-icon:hover {
  color: #1890ff;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #262626;
}

.app-content {
  margin: 24px;
  min-height: calc(100vh - 64px - 48px);
}
</style>
