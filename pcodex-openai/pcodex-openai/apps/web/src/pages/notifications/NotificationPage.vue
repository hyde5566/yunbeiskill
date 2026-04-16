<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiRequest } from "../../api/client";
import {
  buildNotificationPreview,
  buildNotificationQuery,
  buildNotificationSkillTarget,
  formatNotificationTime,
  getNotificationTypeLabel,
  type NotificationFilter,
  type NotificationRow,
} from "./notification-page.helpers";
import { loadPersistedFilters, savePersistedFilters } from "../../utils/persisted-filters";

const NOTIFICATION_FILTER_STORAGE_KEY = "yunbei:notifications:filter";

const loading = ref(false);
const detailLoading = ref(false);
const readSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const filter = ref<NotificationFilter>("ALL");
const notifications = ref<NotificationRow[]>([]);
const selectedNotificationId = ref("");
const selectedNotification = ref<NotificationRow | null>(null);

const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length);

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function notifyNotificationStateChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notifications:changed"));
  }
}

function updateNotificationRow(notification: NotificationRow) {
  const index = notifications.value.findIndex((item) => item.id === notification.id);
  if (index >= 0) {
    notifications.value.splice(index, 1, notification);
    return;
  }

  notifications.value.unshift(notification);
}

function isNotificationFilterValue(value: unknown): value is { filter: NotificationFilter } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const filterValue = (value as { filter?: unknown }).filter;
  return filterValue === "ALL" || filterValue === "UNREAD" || filterValue === "READ";
}

function persistNotificationFilter() {
  savePersistedFilters(
    NOTIFICATION_FILTER_STORAGE_KEY,
    { filter: filter.value },
    (value) => value.filter === "ALL",
  );
}

async function loadNotifications() {
  notifications.value = await apiRequest<NotificationRow[]>(
    `/notifications${buildNotificationQuery(filter.value)}`,
  );

  if (
    selectedNotificationId.value &&
    notifications.value.some((item) => item.id === selectedNotificationId.value)
  ) {
    return;
  }

  selectedNotificationId.value = notifications.value[0]?.id ?? "";
  selectedNotification.value = null;
}

async function loadNotificationDetail(id: string) {
  selectedNotificationId.value = id;
  detailLoading.value = true;
  resetMessages();

  try {
    selectedNotification.value = await apiRequest<NotificationRow>(`/notifications/${id}`);
    updateNotificationRow(selectedNotification.value);
  } catch (error) {
    selectedNotification.value = null;
    errorMessage.value = error instanceof Error ? error.message : "通知详情加载失败";
  } finally {
    detailLoading.value = false;
  }
}

async function applyFilter(nextFilter: NotificationFilter) {
  filter.value = nextFilter;
  persistNotificationFilter();
  loading.value = true;
  selectedNotification.value = null;
  resetMessages();

  try {
    await loadNotifications();
    if (selectedNotificationId.value) {
      await loadNotificationDetail(selectedNotificationId.value);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "通知列表加载失败";
  } finally {
    loading.value = false;
  }
}

async function markSelectedAsRead() {
  if (!selectedNotification.value || selectedNotification.value.isRead) {
    return;
  }

  readSubmitting.value = true;
  resetMessages();

  try {
    const updated = await apiRequest<NotificationRow>(
      `/notifications/${selectedNotification.value.id}/read`,
      {
        method: "PATCH",
      },
    );

    selectedNotification.value = updated;
    updateNotificationRow(updated);
    successMessage.value = "通知已标记为已读";
    notifyNotificationStateChanged();

    if (filter.value === "UNREAD") {
      notifications.value = notifications.value.filter((item) => item.id !== updated.id);
      selectedNotification.value = null;
      selectedNotificationId.value = notifications.value[0]?.id ?? "";

      if (selectedNotificationId.value) {
        await loadNotificationDetail(selectedNotificationId.value);
      }
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "通知已读状态更新失败";
  } finally {
    readSubmitting.value = false;
  }
}

onMounted(async () => {
  const persisted = loadPersistedFilters(
    NOTIFICATION_FILTER_STORAGE_KEY,
    { filter: "ALL" as NotificationFilter },
    isNotificationFilterValue,
  );
  filter.value = persisted.filter;
  loading.value = true;
  resetMessages();

  try {
    await loadNotifications();
    if (selectedNotificationId.value) {
      await loadNotificationDetail(selectedNotificationId.value);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "通知中心加载失败";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h2>通知中心</h2>
        <p>当前已接入 Skill 新版本发布提醒，可查看通知详情并手动标记已读。</p>
      </div>
    </header>

    <article class="admin-card">
      <div class="admin-table-actions" style="justify-content: space-between; margin-bottom: 16px">
        <div class="admin-tag-list">
          <button
            class="admin-button"
            :class="filter === 'ALL' ? 'admin-button-primary' : 'admin-button-secondary'"
            :disabled="loading"
            @click="applyFilter('ALL')"
          >
            全部通知
          </button>
          <button
            class="admin-button"
            :class="filter === 'UNREAD' ? 'admin-button-primary' : 'admin-button-secondary'"
            :disabled="loading"
            @click="applyFilter('UNREAD')"
          >
            未读通知
          </button>
          <button
            class="admin-button"
            :class="filter === 'READ' ? 'admin-button-primary' : 'admin-button-secondary'"
            :disabled="loading"
            @click="applyFilter('READ')"
          >
            已读通知
          </button>
        </div>
        <strong style="color: var(--yb-text-secondary)">当前列表未读 {{ unreadCount }} 条</strong>
      </div>

      <div class="admin-split-2">
        <div class="admin-card">
          <strong>通知列表</strong>
          <p v-if="loading" class="admin-empty" style="margin-top: 12px">正在加载通知...</p>
          <p v-else-if="notifications.length === 0" class="admin-empty" style="margin-top: 12px">
            当前筛选条件下还没有通知。
          </p>
          <div v-else class="admin-list-stack" style="margin-top: 12px">
            <button
              v-for="item in notifications"
              :key="item.id"
              class="admin-card admin-clickable-card"
              :class="{
                'is-selected': item.id === selectedNotificationId,
                'is-unread': !item.isRead,
              }"
              style="text-align: left"
              @click="loadNotificationDetail(item.id)"
            >
              <div class="admin-table-actions" style="justify-content: space-between; align-items: flex-start; margin-bottom: 8px">
                <div>
                  <strong>{{ item.title }}</strong>
                  <div class="admin-empty" style="margin-top: 6px">
                    {{ getNotificationTypeLabel(item.type) }}
                  </div>
                </div>
                <span
                  class="admin-tag"
                  :class="item.isRead ? 'admin-tag-neutral' : 'admin-tag-warning'"
                >
                  {{ item.isRead ? "已读" : "未读" }}
                </span>
              </div>
              <p class="admin-empty" style="line-height: 1.6">{{ buildNotificationPreview(item.content) }}</p>
              <div style="margin-top: 10px; color: var(--yb-text-secondary); font-size: 13px">
                {{ formatNotificationTime(item.createdAt) }}
              </div>
            </button>
          </div>
        </div>

        <div class="admin-card">
          <div class="admin-table-actions" style="justify-content: space-between; margin-bottom: 12px">
            <strong>通知详情</strong>
            <button
              v-if="selectedNotification && !selectedNotification.isRead"
              class="admin-button admin-button-secondary"
              :disabled="readSubmitting"
              @click="markSelectedAsRead"
            >
              {{ readSubmitting ? "处理中..." : "标记已读" }}
            </button>
          </div>

          <p v-if="detailLoading" class="admin-empty">正在加载通知详情...</p>
          <p v-else-if="!selectedNotification" class="admin-empty">请先从左侧选择一条通知。</p>
          <div v-else class="admin-form-grid">
            <div class="admin-field">
              <label>通知标题</label>
              <input :value="selectedNotification.title" disabled />
            </div>
            <div class="admin-field">
              <label>通知类型</label>
              <input :value="getNotificationTypeLabel(selectedNotification.type)" disabled />
            </div>
            <div class="admin-field">
              <label>通知状态</label>
              <input :value="selectedNotification.isRead ? '已读' : '未读'" disabled />
            </div>
            <div class="admin-field">
              <label>创建时间</label>
              <input :value="formatNotificationTime(selectedNotification.createdAt)" disabled />
            </div>
            <div class="admin-field">
              <label>版本号</label>
              <input :value="selectedNotification.versionLabel || '-'" disabled />
            </div>
            <div class="admin-field">
              <label>已读时间</label>
              <input :value="formatNotificationTime(selectedNotification.readAt)" disabled />
            </div>
            <div class="admin-field" style="grid-column: 1 / -1">
              <label>通知内容</label>
              <textarea :value="selectedNotification.content" disabled />
            </div>
          </div>

          <div v-if="selectedNotification" class="admin-actions">
            <RouterLink
              v-if="buildNotificationSkillTarget(selectedNotification)"
              :to="buildNotificationSkillTarget(selectedNotification)!"
              class="admin-button admin-button-primary"
              style="text-decoration: none; display: inline-flex; align-items: center"
            >
              查看对应 Skill
            </RouterLink>
          </div>
        </div>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>
  </section>
</template>
