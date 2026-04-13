<template>
  <div class="login-logs">
    <a-card title="登录日志">
      <div class="filters">
        <a-input v-model:value="usernameFilter" placeholder="账号" style="width: 150px" />
        <a-select v-model:value="loginTypeFilter" placeholder="类型" allowClear style="width: 100px">
          <a-select-option value="login">登录</a-select-option>
          <a-select-option value="logout">登出</a-select-option>
        </a-select>
        <a-select v-model:value="statusFilter" placeholder="状态" allowClear style="width: 100px">
          <a-select-option value="1">成功</a-select-option>
          <a-select-option value="0">失败</a-select-option>
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
          <template v-if="column.key === 'loginType'">
            <a-tag :color="record.loginType === 'login' ? 'blue' : 'default'">
              {{ record.loginType === 'login' ? '登录' : '登出' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLoginLogs } from '@/api/login-log'
import type { LoginLog } from '@/api/login-log'

const columns = [
  { title: '账号', dataIndex: 'username', key: 'username', width: 150 },
  { title: '类型', key: 'loginType', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: 'IP地址', dataIndex: 'ipAddress', key: 'ipAddress', width: 150 },
  { title: '设备', dataIndex: 'device', key: 'device', ellipsis: true },
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 }
]

const logs = ref<LoginLog[]>([])
const loading = ref(false)
const usernameFilter = ref<string | undefined>()
const loginTypeFilter = ref<string | undefined>()
const statusFilter = ref<string | undefined>()
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
    const res = await getLoginLogs({
      username: usernameFilter.value,
      loginType: loginTypeFilter.value,
      status: statusFilter.value ? Number(statusFilter.value) : undefined,
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
</script>

<style scoped>
.login-logs {
  background: #fff;
}
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>