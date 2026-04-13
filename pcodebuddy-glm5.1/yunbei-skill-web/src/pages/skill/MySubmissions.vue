<template>
  <div class="my-submissions">
    <a-card :bordered="false" class="list-card">
      <template #title>
        <span>我的提交</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="$router.push('/skill/submit')">
          <PlusOutlined /> 提交新Skill
        </a-button>
      </template>

      <a-table
        :dataSource="skills"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag v-if="record.status === 'pending'" color="default">待审核</a-tag>
            <a-tag v-else-if="record.status === 'reviewing'" color="processing">审核中</a-tag>
            <a-tag v-else-if="record.status === 'approved'" color="cyan">已入库</a-tag>
            <a-tag v-else-if="record.status === 'published'" color="success">已发布</a-tag>
            <a-tag v-else-if="record.status === 'rejected'" color="error">已驳回</a-tag>
            <a-tag v-else-if="record.status === 'draft'" color="default">草稿</a-tag>
            <a-tag v-else-if="record.status === 'unpublished'" color="warning">已下架</a-tag>
          </template>
          <template v-if="column.key === 'source'">
            {{ record.source === 'internal' ? '内部自研' : '外部平台' }}
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="$router.push(`/skill/detail/${record.id}`)">查看</a-button>
              <a-button
                v-if="record.status === 'rejected' || record.status === 'draft'"
                type="link"
                size="small"
                @click="$router.push(`/skill/submit/${record.id}`)"
              >编辑</a-button>
              <a-button
                v-if="record.status === 'rejected'"
                type="link"
                size="small"
                @click="handleResubmit(record.id)"
              >重新提交</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getMySkills } from '../../api/skill'

const loading = ref(false)
const skills = ref<any[]>([])

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
  { title: '来源', key: 'source', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '提交时间', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 180 },
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
    const res = await getMySkills({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    skills.value = res.data?.list || []
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

async function handleResubmit(id: number) {
  try {
    await resubmitSkill(id)
    message.success('已重新提交审核')
    loadData()
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
.my-submissions {
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
