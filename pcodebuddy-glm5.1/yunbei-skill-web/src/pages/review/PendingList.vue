<template>
  <div class="review-pending">
    <a-card :bordered="false" class="list-card">
      <template #title>
        <span>审核管理</span>
      </template>

      <a-table
        :dataSource="reviews"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'skillName'">
            {{ record.skill?.name || '-' }}
          </template>
          <template v-if="column.key === 'submitterName'">
            {{ record.skill?.submitter?.real_name || '-' }}
          </template>
          <template v-if="column.key === 'categoryName'">
            {{ record.skill?.category?.name || '-' }}
          </template>
          <template v-if="column.key === 'reviewerName'">
            {{ record.reviewer?.real_name || '待分配' }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag v-if="record.status === 'pending'" color="default">待审核</a-tag>
            <a-tag v-else-if="record.status === 'reviewing'" color="processing">审核中</a-tag>
            <a-tag v-else-if="record.status === 'approved'" color="success">通过</a-tag>
            <a-tag v-else-if="record.status === 'rejected'" color="error">驳回</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="$router.push(`/review/detail/${record.id}`)">
              {{ record.status === 'pending' || record.status === 'reviewing' ? '审核' : '查看' }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPendingReviews } from '../../api/review'

const loading = ref(false)
const reviews = ref<any[]>([])

const columns = [
  { title: 'Skill名称', key: 'skillName', ellipsis: true },
  { title: '提交人', key: 'submitterName', width: 100 },
  { title: '分类', key: 'categoryName', width: 100 },
  { title: '审核人', key: 'reviewerName', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '提交时间', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 100 },
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
    const res = await getPendingReviews({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    reviews.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
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
.review-pending {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-card {
  border-radius: 12px;
}
</style>
