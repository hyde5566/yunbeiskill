<template>
  <a-dropdown v-model:open="dropdownOpen" trigger="click" placement="bottomRight">
    <a-badge :count="unreadCount" :overflow-count="99">
      <a-button type="text" @click="loadNotifications">
        <BellOutlined />
      </a-button>
    </a-badge>
    <template #overlay>
      <div class="notification-dropdown">
        <div class="notification-header">
          <span>通知中心</span>
          <a-button type="link" size="small" @click="handleMarkAllRead" v-if="unreadCount > 0">
            全部已读
          </a-button>
        </div>
        <a-list
          :data-source="notifications"
          :loading="loading"
          class="notification-list"
        >
          <template #renderItem="{ item }">
            <a-list-item :class="{ unread: !item.isRead }">
              <a-list-item-meta :description="item.content">
                <template #title>
                  <a-space>
                    <a-tag :color="getTypeColor(item.type)" size="small">{{ getTypeText(item.type) }}</a-tag>
                    <span class="notification-title">{{ item.title }}</span>
                  </a-space>
                </template>
              </a-list-item-meta>
              <template #actions>
                <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
              </template>
            </a-list-item>
          </template>
        </a-list>
        <div class="notification-footer" v-if="notifications.length > 0">
          <a-button type="link" block @click="handleViewAll">查看全部</a-button>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { getNotifications, getUnreadCount, markAllAsRead } from '@/api/notification'
import type { Notification } from '@/api/notification'

const router = useRouter()

const dropdownOpen = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)

onMounted(() => {
  loadUnreadCount()
  // 每5分钟刷新未读数量
  setInterval(loadUnreadCount, 5 * 60 * 1000)
})

async function loadUnreadCount() {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.count
  } catch (e) {
    // 忽略
  }
}

async function loadNotifications() {
  if (notifications.value.length > 0) return // 已加载过则不重复加载

  loading.value = true
  try {
    const res = await getNotifications(1, 10)
    notifications.value = res.list
  } catch (e) {
    // 忽略
  } finally {
    loading.value = false
  }
}

async function handleMarkAllRead() {
  try {
    await markAllAsRead()
    unreadCount.value = 0
    notifications.value.forEach(n => n.isRead = true)
    message.success('已全部标记已读')
  } catch (e: any) {
    message.error(e.message || '操作失败')
  }
}

function handleViewAll() {
  dropdownOpen.value = false
  // 可以跳转到通知列表页面，这里暂时不做跳转
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    skill_approved: 'green',
    skill_rejected: 'red',
    skill_published: 'cyan',
    new_version: 'blue',
    feedback_received: 'orange'
  }
  return colors[type] || 'default'
}

function getTypeText(type: string) {
  const texts: Record<string, string> = {
    skill_approved: '审核通过',
    skill_rejected: '审核驳回',
    skill_published: '已发布',
    new_version: '版本更新',
    feedback_received: '收到反馈'
  }
  return texts[type] || type
}

function formatTime(time: string) {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60 / 1000)}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 60 / 60 / 1000)}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 24 / 60 / 60 / 1000)}天前`

  return date.toLocaleDateString()
}
</script>

<style scoped>
.notification-dropdown {
  width: 320px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: bold;
}
.notification-list {
  max-height: 300px;
  overflow-y: auto;
}
.notification-list .unread {
  background: #e6f7ff;
}
.notification-title {
  font-weight: normal;
}
.notification-time {
  color: #999;
  font-size: 12px;
}
.notification-footer {
  border-top: 1px solid #f0f0f0;
  padding: 8px 0;
}
</style>