<template>
  <div style="padding: 20px">
    <n-card title="欢迎使用云贝科技 Skill 库管理系统">
      <n-space vertical>
        <n-h3>当前登录用户</n-h3>
        <n-text>用户名：{{ userStore.userInfo?.username }}</n-text>
        <n-text>姓名：{{ userStore.userInfo?.realName }}</n-text>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard, NSpace, NH3, NText } from 'naive-ui'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>