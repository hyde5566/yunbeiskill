<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider bordered :width="200" :collapsed-width="64" :collapsed="collapsed" show-trigger @collapse="collapsed = true" @expand="collapsed = false">
      <n-menu :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" :options="filteredMenuOptions" :value="currentKey" @update:value="handleMenuSelect" />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered style="height: 50px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between">
        <span>云贝科技 Skill 库管理系统</span>
        <n-space align="center">
          <n-tag type="info">{{ userStore.userInfo?.realName || userStore.userInfo?.username || '未登录' }}</n-tag>
          <n-button size="small" @click="handleLogout">退出登录</n-button>
        </n-space>
      </n-layout-header>
      <n-layout-content style="padding: 0">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NButton, NIcon, NSpace, NTag, useMessage, useDialog } from 'naive-ui'
import { useUserStore } from '../stores/user'
import { PeopleOutline, ShieldCheckmarkOutline, KeyOutline, BusinessOutline, HomeOutline, BulbOutline, FolderOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()
const collapsed = ref(false)

const currentKey = computed(() => route.path)

const renderIcon = (icon: any) => () => h(NIcon, null, { default: () => h(icon) })

const allMenuOptions = [
  { label: '首页', key: '/', icon: renderIcon(HomeOutline), permission: null },
  { label: 'Skill管理', key: '/skill', icon: renderIcon(BulbOutline), permission: 'skill:manage' },
  { label: 'Skill分类', key: '/skill-category', icon: renderIcon(FolderOutline), permission: 'skill:manage' },
  { label: '用户管理', key: '/user', icon: renderIcon(PeopleOutline), permission: 'user:manage' },
  { label: '角色管理', key: '/role', icon: renderIcon(ShieldCheckmarkOutline), permission: 'role:manage' },
  { label: '权限管理', key: '/permission', icon: renderIcon(KeyOutline), permission: 'permission:manage' },
  { label: '组织管理', key: '/org', icon: renderIcon(BusinessOutline), permission: 'org:manage' }
]

const filteredMenuOptions = computed(() => {
  return allMenuOptions.filter(menu => {
    if (!menu.permission) return true
    return userStore.hasPermission(menu.permission)
  })
})

function handleMenuSelect(key: string) {
  router.push(key)
}

function handleLogout() {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await userStore.logoutAction()
      message.success('已退出登录')
      router.push('/login')
    }
  })
}

onMounted(() => {
  userStore.initPermissions()
})
</script>