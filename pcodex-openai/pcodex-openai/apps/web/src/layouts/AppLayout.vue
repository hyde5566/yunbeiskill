<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { apiRequest } from "../api/client";
import { useAuthStore } from "../stores/auth";
import AppSidebar from "./AppSidebar.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const searchKeyword = ref("");
const unreadNotificationCount = ref(0);

const pageTitle = computed(() => {
  const matched = route.matched[route.matched.length - 1];
  if (typeof matched?.path !== "string") {
    return "工作台";
  }

  const titleMap: Record<string, string> = {
    "/dashboard": "首页总览",
    "/profile": "个人信息",
    "/notifications": "通知中心",
    "/users": "用户管理",
    "/roles": "角色管理",
    "/departments": "部门管理",
    "/projects": "项目管理",
    "/skills": "Skill 管理",
    "/skill-categories": "Skill 分类",
    "/logs/login": "登录日志",
    "/logs/operation": "操作日志",
  };

  return titleMap[matched.path] ?? "工作台";
});

const pageDescription = computed(() => {
  const matched = route.matched[route.matched.length - 1];
  const path = typeof matched?.path === "string" ? matched.path : "";

  const descriptionMap: Record<string, string> = {
    "/dashboard": "查看平台运行概览和关键入口",
    "/profile": "维护个人账号信息与安全设置",
    "/notifications": "处理系统通知与版本提醒",
    "/users": "统一管理员工账号与角色分配",
    "/roles": "按模块和功能点配置权限",
    "/departments": "维护组织结构与上下级关系",
    "/projects": "管理项目与成员可见范围",
    "/skills": "Skill 提交、审核、发布与反馈全流程",
    "/skill-categories": "维护 Skill 分类、排序与启停用",
    "/logs/login": "追踪账号登录行为和异常记录",
    "/logs/operation": "审计关键操作行为与变更轨迹",
  };

  return descriptionMap[path] ?? "企业级 Skill 管理中枢";
});

const canViewNotifications = computed(() =>
  authStore.currentUser?.permissions.includes("notification.view") ?? false,
);

const canQuickCreateSkill = computed(() =>
  authStore.currentUser?.permissions.includes("skill.submit") ?? false,
);

const dateLabel = computed(() =>
  new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }),
);

function resolveSearchTarget(keyword: string) {
  const value = keyword.trim().toLowerCase();
  if (!value) {
    return "";
  }

  if (value.includes("用户") || value.includes("account") || value.includes("user")) {
    return "/users";
  }

  if (value.includes("角色") || value.includes("role")) {
    return "/roles";
  }

  if (value.includes("部门") || value.includes("department")) {
    return "/departments";
  }

  if (value.includes("项目") || value.includes("project")) {
    return "/projects";
  }

  if (value.includes("日志") || value.includes("log")) {
    return "/logs/operation";
  }

  if (value.includes("通知") || value.includes("notification")) {
    return "/notifications";
  }

  return "/skills";
}

async function jumpBySearch() {
  const target = resolveSearchTarget(searchKeyword.value);
  if (!target) {
    return;
  }

  await router.push(target);
  searchKeyword.value = "";
}

async function loadUnreadNotificationCount() {
  if (!canViewNotifications.value) {
    unreadNotificationCount.value = 0;
    return;
  }

  try {
    const notifications = await apiRequest<Array<{ id: string }>>("/notifications?isRead=false");
    unreadNotificationCount.value = notifications.length;
  } catch {
    unreadNotificationCount.value = 0;
  }
}

function handleNotificationChanged() {
  void loadUnreadNotificationCount();
}

watch(
  () => route.fullPath,
  () => {
    void loadUnreadNotificationCount();
  },
);

onMounted(() => {
  void loadUnreadNotificationCount();
  if (typeof window !== "undefined") {
    window.addEventListener("notifications:changed", handleNotificationChanged);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("notifications:changed", handleNotificationChanged);
  }
});
</script>

<template>
  <div class="app-layout">
    <AppSidebar class="app-layout-sidebar" />
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-title">
          <div class="app-topbar-title-main">
            <img class="app-topbar-logo" src="/brand/logo.png" alt="云贝 Logo" />
            <h1>{{ pageTitle }}</h1>
          </div>
          <p>{{ pageDescription }}</p>
        </div>
        <div class="app-topbar-actions">
          <form class="app-search" @submit.prevent="jumpBySearch">
            <input
              v-model.trim="searchKeyword"
              placeholder="搜索模块、用户、Skill（回车跳转）"
            />
          </form>
          <button
            v-if="canQuickCreateSkill"
            class="app-topbar-button app-topbar-button-primary"
            @click="router.push('/skills')"
          >
            新建 Skill
          </button>
          <RouterLink
            v-if="canViewNotifications"
            to="/notifications"
            class="app-topbar-button app-topbar-button-ghost"
          >
            通知
            <span v-if="unreadNotificationCount > 0" class="app-topbar-badge">
              {{ unreadNotificationCount }}
            </span>
          </RouterLink>
          <div class="app-topbar-meta">{{ dateLabel }}</div>
        </div>
      </header>
      <main class="app-main">
        <section class="app-main-content">
          <router-view />
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.app-shell {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
}

.app-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding: 16px 24px 14px;
  border-bottom: 1px solid var(--yb-border);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
}

.app-topbar-title h1 {
  margin: 0;
  font-size: 28px;
  color: var(--yb-title);
}

.app-topbar-title-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-topbar-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.app-topbar-title p {
  margin: 6px 0 0;
  color: var(--yb-text-secondary);
}

.app-topbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.app-search input {
  min-width: 260px;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid var(--yb-border-strong);
  border-radius: 8px;
  outline: none;
}

.app-search input:focus {
  border-color: var(--yb-primary);
  box-shadow: 0 0 0 3px rgba(45, 125, 247, 0.14);
}

.app-topbar-button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 600;
}

.app-topbar-button-primary {
  color: #fff;
  border-color: var(--yb-primary-strong);
  background: var(--yb-primary-gradient);
}

.app-topbar-button-primary:hover {
  background: var(--yb-primary-gradient-hover);
}

.app-topbar-button-ghost {
  color: #2f588c;
  border-color: #cbdbf1;
  background: #f2f8ff;
}

.app-topbar-button-ghost:hover {
  background: #e8f2ff;
}

.app-topbar-badge {
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--yb-warning);
  color: #fff;
  font-size: 12px;
  text-align: center;
}

.app-topbar-meta {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--yb-border);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: #4c6383;
  background: #f2f7ff;
  font-size: 13px;
  font-weight: 600;
}

.app-main {
  min-width: 0;
  padding: 22px 24px 28px;
}

.app-main-content {
  width: 100%;
  margin: 0 auto;
  max-width: 1480px;
}

@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-topbar {
    padding: 14px 16px;
    align-items: flex-start;
    flex-direction: column;
  }

  .app-main {
    padding: 16px;
  }
}

@media (max-width: 720px) {
  .app-search input {
    min-width: 220px;
  }

  .app-topbar-title h1 {
    font-size: 24px;
  }
}
</style>
