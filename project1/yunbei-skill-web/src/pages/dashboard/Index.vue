<template>
  <div class="dashboard">
    <a-card title="欢迎使用云贝Skill管理系统">
      <p>当前登录用户：{{ userInfo?.realName }}</p>
      <p>权限：{{ userInfo?.permissions?.join(', ') }}</p>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storage } from '@/utils/storage'

const userInfo = ref<any>(null)

onMounted(() => {
  const userInfoStr = storage.get('userInfo')
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
    } catch (e) {
      userInfo.value = null
    }
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 800px;
}
</style>