<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const form = reactive({
  account: "",
  password: "",
});

async function onSubmit() {
  await authStore.login(form);
  await router.push("/dashboard");
}
</script>

<template>
  <section class="login-page">
    <div class="login-panel">
      <div class="login-brand">
        <img class="login-brand-logo" src="/brand/logo-long.png" alt="云贝 Logo" />
        <h1>云贝 Skill 管理中枢</h1>
        <p>
          面向企业内部的 Skill 资产管理中台，统一覆盖提交、审核、发布、权限、通知和日志管理。
        </p>
      </div>

      <form class="login-card" @submit.prevent="onSubmit">
        <h2>账号登录</h2>
        <p>请使用你的平台账号登录</p>
        <label>
          <span>账号</span>
          <input v-model="form.account" autocomplete="username" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="form.password" type="password" autocomplete="current-password" />
        </label>
        <button type="submit">登录系统</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at 8% 10%, rgba(90, 165, 255, 0.24), transparent 36%),
    radial-gradient(circle at 100% 0, rgba(29, 98, 220, 0.16), transparent 34%),
    linear-gradient(140deg, #edf4ff 0%, #e6f0ff 52%, #f7faff 100%);
}

.login-panel {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  border: 1px solid var(--yb-border);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--yb-shadow-md);
}

.login-brand {
  padding: 44px 40px;
  color: var(--yb-title);
  background:
    radial-gradient(circle at 20% 12%, rgba(93, 168, 255, 0.24), transparent 45%),
    linear-gradient(180deg, #f1f7ff 0%, #eaf3ff 100%);
}

.login-brand-tag {
  display: none;
}

.login-brand-logo {
  width: min(360px, 100%);
  height: auto;
  display: block;
  filter: drop-shadow(0 10px 24px rgba(26, 84, 177, 0.22));
}

.login-brand h1 {
  margin: 16px 0 0;
  font-size: 30px;
  line-height: 1.2;
}

.login-brand p {
  margin: 16px 0 0;
  color: var(--yb-text-secondary);
  line-height: 1.7;
}

.login-card {
  display: grid;
  gap: 14px;
  padding: 44px 38px;
}

.login-card h2 {
  margin: 0;
  font-size: 28px;
  color: var(--yb-title);
}

.login-card > p {
  margin: 0 0 8px;
  color: var(--yb-text-secondary);
}

.login-card label {
  display: grid;
  gap: 8px;
  color: #3f5d86;
  font-weight: 600;
}

.login-card input {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--yb-border-strong);
  border-radius: 8px;
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.login-card input:focus {
  border-color: var(--yb-primary);
  box-shadow: 0 0 0 3px rgba(45, 125, 247, 0.15);
}

.login-card button {
  margin-top: 8px;
  min-height: 42px;
  border: none;
  border-radius: 8px;
  color: #fff;
  background: var(--yb-primary-gradient);
  font-weight: 700;
  cursor: pointer;
}

.login-card button:hover {
  background: var(--yb-primary-gradient-hover);
}

@media (max-width: 900px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-brand {
    padding: 24px 24px 18px;
  }

  .login-brand h1 {
    font-size: 28px;
  }

  .login-card {
    padding: 24px;
  }
}
</style>
