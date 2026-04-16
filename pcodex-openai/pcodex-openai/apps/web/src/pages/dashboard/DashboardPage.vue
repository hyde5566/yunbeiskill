<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiRequest } from "../../api/client";
import { buildVisibleNavigation } from "../../stores/permission";
import { useAuthStore } from "../../stores/auth";
import {
  buildDashboardNotificationDigest,
  buildDashboardOverview,
} from "./dashboard-page.helpers";

interface DashboardNotificationRow {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const authStore = useAuthStore();
const unreadNotifications = ref<DashboardNotificationRow[]>([]);
const notificationError = ref("");

const currentUser = computed(() => authStore.currentUser);
const visibleNavigation = computed(() =>
  buildVisibleNavigation(authStore.currentUser?.permissions ?? []),
);
const overview = computed(() =>
  currentUser.value
    ? buildDashboardOverview(
        currentUser.value,
        visibleNavigation.value,
        unreadNotifications.value.length,
      )
    : null,
);
const notificationDigest = computed(() =>
  buildDashboardNotificationDigest(unreadNotifications.value),
);

async function loadUnreadNotifications() {
  if (!authStore.currentUser?.permissions.includes("notification.view")) {
    unreadNotifications.value = [];
    notificationError.value = "";
    return;
  }

  try {
    unreadNotifications.value = await apiRequest<DashboardNotificationRow[]>(
      "/notifications?isRead=false",
    );
    notificationError.value = "";
  } catch (error) {
    unreadNotifications.value = [];
    notificationError.value = error instanceof Error ? error.message : "通知摘要加载失败";
  }
}

function handleNotificationChange() {
  void loadUnreadNotifications();
}

onMounted(() => {
  void loadUnreadNotifications();
  if (typeof window !== "undefined") {
    window.addEventListener("notifications:changed", handleNotificationChange);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("notifications:changed", handleNotificationChange);
  }
});
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h2>首页</h2>
        <p>基础平台第一阶段已经具备登录、权限、基础资料和日志能力，这里用于快速总览和进入常用模块。</p>
      </div>
    </header>

    <article v-if="currentUser && overview" class="admin-card">
      <h3>当前用户</h3>
      <div class="admin-stat-grid">
        <div v-for="stat in overview.stats" :key="stat.label" class="admin-stat-card">
          <strong class="admin-stat-label">{{ stat.label }}</strong>
          <div class="admin-stat-value">
            {{ stat.value }}
          </div>
        </div>
      </div>
    </article>

    <article v-if="currentUser && currentUser.permissions.includes('notification.view')" class="admin-card">
      <div class="admin-table-actions" style="justify-content: space-between; align-items: center; margin-bottom: 12px">
        <div>
          <h3>通知摘要</h3>
          <p class="admin-empty" style="margin-top: 6px">
            当前有 {{ notificationDigest.total }} 条未读通知，可直接进入通知中心处理。
          </p>
        </div>
        <RouterLink
          to="/notifications"
          class="admin-button admin-button-primary"
          style="text-decoration: none; display: inline-flex; align-items: center"
        >
          打开通知中心
        </RouterLink>
      </div>

      <p v-if="notificationError" class="admin-message admin-message-error">
        {{ notificationError }}
      </p>
      <p v-else-if="notificationDigest.total === 0" class="admin-empty">
        当前没有未读通知，后续新版本发布会优先在这里提醒。
      </p>
      <div v-else class="admin-list-stack">
        <RouterLink
          v-for="item in notificationDigest.items"
          :key="item.id"
          :to="item.path"
          class="admin-card admin-clickable-card"
          style="text-decoration: none; color: inherit"
        >
          <div class="admin-table-actions" style="justify-content: space-between; align-items: flex-start; margin-bottom: 8px">
            <strong>{{ item.title }}</strong>
            <span class="admin-tag">未读</span>
          </div>
          <p class="admin-empty" style="line-height: 1.6">{{ item.preview }}</p>
          <div style="margin-top: 8px; color: var(--yb-text-secondary); font-size: 13px">
            {{ item.createdAtLabel }}
          </div>
        </RouterLink>
      </div>
    </article>

    <article v-if="currentUser && overview" class="admin-card">
      <h3>快捷入口</h3>
      <div class="admin-tag-list">
        <RouterLink
          v-for="action in overview.quickActions"
          :key="action.path"
          :to="action.path"
          class="admin-button admin-button-secondary"
          style="text-decoration: none; display: inline-flex; align-items: center"
        >
          {{ action.label }}
        </RouterLink>
      </div>
    </article>

    <article class="admin-card">
      <h3>当前阶段覆盖</h3>
      <div class="admin-tag-list">
        <span class="admin-tag">统一登录</span>
        <span class="admin-tag">角色与权限点</span>
        <span class="admin-tag">用户管理</span>
        <span class="admin-tag">部门管理</span>
        <span class="admin-tag">项目管理</span>
        <span class="admin-tag">Skill 分类</span>
        <span class="admin-tag">登录日志</span>
        <span class="admin-tag">操作日志</span>
      </div>
    </article>
  </section>
</template>
