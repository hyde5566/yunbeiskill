<template>
  <div class="operation-logs">
    <a-card :bordered="false" class="list-card" title="操作日志">
      <template #extra>
        <a-space>
          <a-range-picker v-model:value="dateRange" @change="loadData" />
          <a-input-search v-model:value="searchKeyword" placeholder="搜索操作内容" style="width: 200px" @search="loadData" />
        </a-space>
      </template>

      <a-table :dataSource="logs" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
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
import { getOperationLogs } from '../../api/log'

const loading = ref(false)
const logs = ref<any[]>([])
const dateRange = ref<any[]>([])
const searchKeyword = ref('')

const columns = [
  { title: '操作人', dataIndex: 'userName', key: 'userName', width: 100 },
  { title: '操作类型', dataIndex: 'operationType', key: 'operationType', width: 120 },
  { title: '操作模块', dataIndex: 'module', key: 'module', width: 120 },
  { title: '操作内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 120 },
  { title: '操作时间', key: 'createdAt', width: 160 },
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
    const res = await getOperationLogs(params)
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
.operation-logs { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
