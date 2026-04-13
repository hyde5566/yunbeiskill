<template>
  <a-layout class="app-layout">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
      <div class="logo">
        <span v-if="!collapsed">云贝Skill管理</span>
        <span v-else>云贝</span>
      </div>
      <a-menu :selectedKeys="selectedKeys" @update:selectedKeys="onSelectChange" mode="inline">
        <a-menu-item key="dashboard" @click="$router.push('/')">
          <template #icon><DashboardOutlined /></template>
          <span>首页</span>
        </a-menu-item>
        <a-sub-menu key="admin" v-if="isAdmin">
          <template #icon><SettingOutlined /></template>
          <template #title>系统管理</template>
          <a-menu-item key="users" @click="$router.push('/admin/users')">用户管理</a-menu-item>
          <a-menu-item key="departments" @click="$router.push('/admin/departments')">部门管理</a-menu-item>
          <a-menu-item key="permissions" @click="$router.push('/admin/permissions')">权限配置</a-menu-item>
          <a-menu-item key="projects" @click="$router.push('/admin/projects')">项目管理</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-right">
          <span>{{ userInfo?.realName }}</span>
          <a-dropdown>
            <a-button type="text">
              <UserOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DashboardOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue'
import { storage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const userInfo = ref<any>(null)
const selectedKeys = ref<string[]>(['dashboard'])

const isAdmin = ref(false)

// 根据路由更新选中状态
watch(() => route.path, (path) => {
  if (path === '/') selectedKeys.value = ['dashboard']
  else if (path.includes('/admin/users')) selectedKeys.value = ['users']
  else if (path.includes('/admin/departments')) selectedKeys.value = ['departments']
  else if (path.includes('/admin/permissions')) selectedKeys.value = ['permissions']
  else if (path.includes('/admin/projects')) selectedKeys.value = ['projects']
}, { immediate: true })

function onSelectChange(keys: string[]) {
  selectedKeys.value = keys
}

onMounted(() => {
  const userInfoStr = storage.get('userInfo')
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
      isAdmin.value = userInfo.value?.permissions?.includes('admin') || false
    } catch (e) {
      userInfo.value = null
      isAdmin.value = false
    }
  }
})

function handleLogout() {
  storage.removeToken()
  storage.remove('userInfo')
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
}
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid #f0f0f0;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.content {
  padding: 24px;
  background: #f0f2f5;
  overflow: auto;
}
</style>