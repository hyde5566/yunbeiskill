<template>
  <div class="operation-logs">
    <a-card title="操作日志">
      <div class="filters">
        <a-select v-model:value="moduleFilter" placeholder="模块" allowClear style="width: 120px">
          <a-select-option value="skill">Skill</a-select-option>
          <a-select-option value="user">用户</a-select-option>
          <a-select-option value="project">项目</a-select-option>
          <a-select-option value="auth">认证</a-select-option>
        </a-select>
        <a-select v-model:value="actionFilter" placeholder="动作" allowClear style="width: 120px">
          <a-select-option value="create">创建</a-select-option>
          <a-select-option value="update">更新</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <a-select-option value="approve">审核通过</a-select-option>
          <a-select-option value="reject">审核驳回</a-select-option>
          <a-select-option value="publish">发布</a-select-option>
          <a-select-option value="download">下载</a-select-option>
          <a-select-option value="login">登录</a-select-option>
          <a-select-option value="logout">登出</a-select-option>
        </a-select>
        <a-range-picker v-model:value="dateRange" style="width: 240px" />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="logs"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <span>{{ record.user?.realName || '-' }}</span>
          </template>
          <template v-if="column.key === 'module'">
            <a-tag color="blue">{{ record.module }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-tag :color="getActionColor(record.action)">{{ getActionText(record.action) }}</a-tag>
          </template>
          <template v-if="column.key === 'detail'">
            <a-tooltip v-if="record.detail" :title="record.detail">
              <span class="detail-text">{{ record.detail.substring(0, 50) }}...</span>
            </a-tooltip>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOperationLogs } from '@/api/operation-log'
import type { OperationLog } from '@/api/operation-log'

const columns = [
  { title: '操作人', key: 'user', width: 100 },
  { title: '模块', key: 'module', width: 100 },
  { title: '动作', key: 'action', width: 120 },
  { title: '目标类型', dataIndex: 'targetType', key: 'targetType', width: 100 },
  { title: '目标ID', dataIndex: 'targetId', key: 'targetId', width: 100 },
  { title: '详情', key: 'detail', ellipsis: true },
  { title: 'IP地址', dataIndex: 'ipAddress', key: 'ipAddress', width: 120 },
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 }
]

const logs = ref<OperationLog[]>([])
const loading = ref(false)
const moduleFilter = ref<string | undefined>()
const actionFilter = ref<string | undefined>()
const dateRange = ref<[string, string] | undefined>()

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

onMounted(() => {
  loadLogs()
})

async function loadLogs() {
  loading.value = true
  try {
    const res = await getOperationLogs({
      module: moduleFilter.value,
      action: actionFilter.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    })
    logs.value = res.list
    pagination.value.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.value.current = 1
  loadLogs()
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadLogs()
}

function getActionColor(action: string) {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    approve: 'green',
    reject: 'orange',
    publish: 'cyan',
    download: 'purple',
    login: 'blue',
    logout: 'default'
  }
  return colors[action] || 'default'
}

function getActionText(action: string) {
  const texts: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    approve: '审核通过',
    reject: '审核驳回',
    publish: '发布',
    download: '下载',
    login: '登录',
    logout: '登出'
  }
  return texts[action] || action
}
</script>

<style scoped>
.operation-logs {
  background: #fff;
}
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.detail-text {
  color: #666;
  cursor: pointer;
}
</style>