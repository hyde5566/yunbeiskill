<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiRequest } from "../api/client";
import { useAuthStore } from "../stores/auth";
import { buildVisibleNavigation } from "../stores/permission";

interface SidebarNotificationRow {
  id: string;
}

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const unreadNotificationCount = ref(0);

const navigation = computed(() =>
  buildVisibleNavigation(authStore.currentUser?.permissions ?? []),
);

async function loadUnreadNotificationCount() {
  if (!authStore.currentUser?.permissions.includes("notification.view")) {
    unreadNotificationCount.value = 0;
    return;
  }

  try {
    const notifications = await apiRequest<SidebarNotificationRow[]>("/notifications?isRead=false");
    unreadNotificationCount.value = notifications.length;
  } catch {
    unreadNotificationCount.value = 0;
  }
}

function handleNotificationChange() {
  void loadUnreadNotificationCount();
}

function logout() {
  authStore.logout();
  void router.push("/login");
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
  <aside class="sidebar">
    <div class="sidebar-brand">
      <img class="sidebar-brand-logo" src="/brand/logo-long.png" alt="云贝 Logo" />
    </div>

    <div v-if="authStore.currentUser" class="sidebar-user">
      <div class="sidebar-user-avatar">{{ authStore.currentUser.name.slice(0, 1) }}</div>
      <div class="sidebar-user-meta">
        <strong>{{ authStore.currentUser.name }}</strong>
        <span>{{ authStore.currentUser.department }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link v-for="item in navigation" :key="item.key" :to="item.path" class="sidebar-link">
        <span>{{ item.label }}</span>
        <span
          v-if="item.path === '/notifications' && unreadNotificationCount > 0"
          class="sidebar-badge"
        >
          {{ unreadNotificationCount }}
        </span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-logout" @click="logout">退出登录</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 12px;
  background:
    radial-gradient(circle at -8% -10%, rgba(119, 186, 255, 0.3), transparent 42%),
    linear-gradient(180deg, #11386a 0%, #0d2d55 100%);
  color: #fff;
  border-right: 1px solid rgba(158, 180, 210, 0.2);
}

.sidebar-brand {
  display: grid;
  justify-items: start;
  padding: 2px 2px 0;
}

.sidebar-brand-logo {
  width: 100%;
  max-width: 178px;
  height: auto;
  display: block;
  filter: drop-shadow(0 6px 14px rgba(10, 27, 55, 0.32));
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(162, 184, 216, 0.24);
  border-radius: 14px;
  background: rgba(10, 25, 47, 0.4);
}

.sidebar-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f2a4a;
  font-weight: 700;
  background: linear-gradient(135deg, #dbe8f8 0%, #b7cdea 100%);
}

.sidebar-user-meta {
  display: grid;
  gap: 4px;
}

.sidebar-user span {
  color: #d4deea;
  font-size: 13px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(9, 24, 44, 0.24);
}

.sidebar-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  color: #d7e2ef;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 120ms ease, color 120ms ease;
}

.sidebar-link:hover {
  color: #fff;
  background: rgba(130, 165, 214, 0.2);
}

.sidebar-link.router-link-active {
  color: #fff;
  background: linear-gradient(135deg, rgba(104, 181, 255, 0.34), rgba(53, 131, 232, 0.42));
}

.sidebar-badge {
  min-width: 22px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #d2633a;
  color: #fff;
  font-size: 12px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding: 4px;
}

.sidebar-logout {
  width: 100%;
  min-height: 38px;
  border: 1px solid rgba(172, 192, 220, 0.36);
  border-radius: 10px;
  background: rgba(17, 36, 63, 0.6);
  color: #e8eef7;
  font-weight: 600;
  cursor: pointer;
}

.sidebar-logout:hover {
  background: rgba(31, 56, 91, 0.75);
}

@media (max-width: 1024px) {
  .sidebar {
    height: auto;
    padding: 12px 14px;
    border-right: none;
    border-bottom: 1px solid rgba(158, 180, 210, 0.25);
  }

  .sidebar-brand-logo {
    max-width: 162px;
  }
}
</style>
