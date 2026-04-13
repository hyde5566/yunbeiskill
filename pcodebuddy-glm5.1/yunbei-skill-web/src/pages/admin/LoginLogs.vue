<template>
  <div class="login-logs">
    <a-card :bordered="false" class="list-card" title="登录日志">
      <template #extra>
        <a-space>
          <a-range-picker v-model:value="dateRange" @change="loadData" />
          <a-input-search v-model:value="searchKeyword" placeholder="搜索用户名" style="width: 200px" @search="loadData" />
        </a-space>
      </template>

      <a-table :dataSource="logs" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">{{ record.status === 1 ? '成功' : '失败' }}</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLoginLogs } from '../../api/log'

const loading = ref(false)
const logs = ref<any[]>([])
const dateRange = ref<any[]>([])
const searchKeyword = ref('')

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '登录状态', key: 'status', width: 100 },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130 },
  { title: '浏览器', dataIndex: 'browser', key: 'browser', ellipsis: true },
  { title: '操作系统', dataIndex: 'os', key: 'os', width: 120 },
  { title: '登录时间', key: 'createdAt', width: 160 },
]

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0]?.format('YYYY-MM-DD')
      params.endDate = dateRange.value[1]?.format('YYYY-MM-DD')
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    const res = await getLoginLogs(params)
    logs.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.login-logs { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
