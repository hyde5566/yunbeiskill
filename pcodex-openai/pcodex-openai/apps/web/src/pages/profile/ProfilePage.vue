<script setup lang="ts">
import { reactive, ref } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import { validatePasswordDraft } from "./profile-page.helpers";

const authStore = useAuthStore();
const submitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetForm() {
  form.currentPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
}

async function submitPasswordChange() {
  const validationError = validatePasswordDraft(form);
  if (validationError) {
    errorMessage.value = validationError;
    successMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    await apiRequest("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });

    successMessage.value = "密码已更新";
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "密码更新失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h2>个人信息</h2>
        <p>查看当前账号基础信息，并支持修改自己的登录密码。</p>
      </div>
    </header>

    <article class="admin-card">
      <h3>账号信息</h3>
      <div class="admin-form-grid">
        <div class="admin-field">
          <label>姓名</label>
          <input :value="authStore.currentUser?.name ?? '-'" disabled />
        </div>
        <div class="admin-field">
          <label>登录账号</label>
          <input :value="authStore.currentUser?.account ?? '-'" disabled />
        </div>
        <div class="admin-field">
          <label>所属部门</label>
          <input :value="authStore.currentUser?.department ?? '-'" disabled />
        </div>
        <div class="admin-field">
          <label>权限点数</label>
          <input :value="String(authStore.currentUser?.permissions.length ?? 0)" disabled />
        </div>
      </div>
    </article>

    <article class="admin-card">
      <h3>修改密码</h3>
      <div class="admin-form-grid">
        <div class="admin-field">
          <label for="current-password">当前密码</label>
          <input id="current-password" v-model.trim="form.currentPassword" type="password" />
        </div>
        <div class="admin-field">
          <label for="new-password">新密码</label>
          <input id="new-password" v-model.trim="form.newPassword" type="password" />
        </div>
        <div class="admin-field">
          <label for="confirm-password">确认新密码</label>
          <input id="confirm-password" v-model.trim="form.confirmPassword" type="password" />
        </div>
      </div>

      <div class="admin-actions">
        <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitPasswordChange">
          {{ submitting ? "提交中..." : "更新密码" }}
        </button>
        <button class="admin-button admin-button-secondary" :disabled="submitting" @click="resetForm">
          重置
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>
  </section>
</template>
