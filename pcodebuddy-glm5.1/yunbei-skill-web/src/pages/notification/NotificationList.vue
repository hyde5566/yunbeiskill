<template>
  <div class="notification-list">
    <a-card :bordered="false" class="list-card">
      <template #title>
        <span>站内通知</span>
      </template>
      <template #extra>
        <a-button type="link" @click="markAllRead" :disabled="!hasUnread">全部标为已读</a-button>
      </template>

      <a-list :dataSource="notifications" :loading="loading" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item class="notification-item" :class="{ unread: !item.isRead }" @click="handleRead(item)">
            <a-list-item-meta>
              <template #title>
                <span :class="{ 'unread-title': !item.isRead }">{{ item.title }}</span>
                <a-tag v-if="!item.isRead" color="blue" size="small" style="margin-left: 8px">新</a-tag>
              </template>
              <template #description>
                <div>{{ item.content }}</div>
                <div style="color: #8c8c8c; font-size: 12px; margin-top: 4px">{{ formatDate(item.createdAt) }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
        <template #loadMore>
          <div style="text-align: center; margin-top: 12px; height: 32px; line-height: 32px">
            <a-spin v-if="loadingMore" />
            <a-button v-else-if="hasMore" type="link" @click="loadMore">加载更多</a-button>
          </div>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notification'
import { useNotificationStore } from '../../stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()
const loading = ref(false)
const loadingMore = ref(false)
const notifications = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)
const hasUnread = computed(() => notifications.value.some(n => !n.isRead))

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getNotifications({ page: 1, pageSize: 20 })
    notifications.value = res.data?.list || []
    page.value = 1
    hasMore.value = notifications.value.length >= 20
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    page.value++
    const res = await getNotifications({ page: page.value, pageSize: 20 })
    const list = res.data?.list || []
    notifications.value.push(...list)
    hasMore.value = list.length >= 20
  } catch { /* ignore */ }
  finally {
    loadingMore.value = false
  }
}

async function handleRead(item: any) {
  if (!item.isRead) {
    try {
      await markAsRead(item.id)
      item.isRead = true
      notificationStore.fetchUnreadCount()
    } catch { /* ignore */ }
  }
  if (item.relatedUrl) {
    router.push(item.relatedUrl)
  }
}

async function markAllRead() {
  try {
    await markAllAsRead()
    notifications.value.forEach(n => { n.isRead = true })
    notificationStore.fetchUnreadCount()
    message.success('已全部标为已读')
  } catch {
    message.error('操作失败')
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.notification-list {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-card {
  border-radius: 12px;
}

.notification-item {
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f6f8fa;
}

.notification-item.unread {
  background: #e6f7ff;
}

.notification-item.unread:hover {
  background: #d6efff;
}

.unread-title {
  font-weight: 600;
}
</style>
