<template>
  <div class="login-page">
    <a-card class="login-card" title="云贝Skill管理系统">
      <a-form :model="form" @finish="handleLogin">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="form.username" placeholder="账号" size="large">
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" placeholder="密码" size="large">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { login } from '@/api/auth'
import { storage } from '@/utils/storage'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    const res = await login({ username: form.value.username, password: form.value.password })
    // 直接存储到localStorage
    storage.setToken(res.token)
    storage.set('userInfo', JSON.stringify(res.user))
    message.success('登录成功')
    // 强制刷新页面跳转
    window.location.href = '/'
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
}
.login-card .ant-card-head-title {
  text-align: center;
}
</style>