<template>
  <div class="home-container">
    <n-layout has-sider>
      <n-layout-sider bordered :width="200">
        <n-menu :options="menuOptions" />
      </n-layout-sider>
      <n-layout>
        <n-layout-header bordered class="header">
          <div class="header-right">
            <n-dropdown :options="userOptions" @select="handleUserSelect">
              <n-button text>
                {{ userStore.userInfo?.realName || userStore.userInfo?.username }}
              </n-button>
            </n-dropdown>
          </div>
        </n-layout-header>
        <n-layout-content class="content">
          <n-h2>欢迎使用云贝科技 Skill 库管理系统</n-h2>
          <n-p>当前登录用户：{{ userStore.userInfo?.username }}</n-p>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NDropdown,
  NH2,
  NP,
  useMessage,
  useDialog
} from 'naive-ui'
import { useUserStore } from '../stores/user'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const menuOptions = [
  { label: '首页', key: 'home' },
  { label: '用户管理', key: 'user' },
  { label: 'Skill管理', key: 'skill' }
]

const userOptions = [
  { label: '修改密码', key: 'password' },
  { label: '退出登录', key: 'logout' }
]

function handleUserSelect(key: string) {
  if (key === 'logout') {
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
}
</script>

<style scoped>
.home-container {
  height: 100vh;
}
.header {
  height: 50px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.content {
  padding: 20px;
}
</style>