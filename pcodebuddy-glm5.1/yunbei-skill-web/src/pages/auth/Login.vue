<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand-content">
        <div class="brand-logo">S</div>
        <h1 class="brand-title">云贝Skill管理系统</h1>
        <p class="brand-desc">集中管理AI Skill、插件、提示词等资源<br />支持提交、审核、入库、发布全流程</p>
        <div class="brand-features">
          <div class="feature-item">
            <CheckCircleOutlined />
            <span>Skill统一检索与下载</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined />
            <span>版本管理与审核流程</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined />
            <span>评分反馈与项目关联</span>
          </div>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">请输入您的账号和密码</p>
        <a-form
          :model="formState"
          :rules="rules"
          @finish="handleLogin"
          layout="vertical"
          size="large"
        >
          <a-form-item name="username" label="账号">
            <a-input
              v-model:value="formState.username"
              placeholder="请输入账号"
              :prefix="h(UserOutlined)"
            />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              :prefix="h(LockOutlined)"
              @pressEnter="handleLogin"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              block
              :loading="loading"
              class="login-btn"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
        <div class="login-version">v1.0.0</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function handleLogin() {
  loading.value = true
  try {
    await authStore.login(formState.username, formState.password)
    message.success('登录成功')
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (error: any) {
    message.error(error?.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-left {
  flex: 3;
  background: linear-gradient(135deg, #001529 0%, #003a8c 50%, #0050b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(24, 144, 255, 0.15) 0%, transparent 60%);
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.4);
}

.brand-title {
  color: #fff;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.brand-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 40px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
}

.feature-item :deep(.anticon) {
  color: #52c41a;
  font-size: 18px;
}

.login-right {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 40px;
}

.login-card {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 36px;
}

.login-btn {
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.login-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #1890ff);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.login-version {
  text-align: center;
  color: #bfbfbf;
  font-size: 12px;
  margin-top: 24px;
}
</style>
