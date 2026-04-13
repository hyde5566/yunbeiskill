<template>
  <div class="my-submissions">
    <a-card title="我的提交记录">
      <a-table
        :columns="columns"
        :data-source="submissions"
        :loading="loading"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="handleDetail(record.id)">{{ record.name }}</a>
          </template>
          <template v-if="column.key === 'category'">
            <span>{{ record.category?.name || '-' }}</span>
          </template>
          <template v-if="column.key === 'sourceType'">
            <a-tag :color="record.sourceType === 'internal' ? 'blue' : 'orange'">
              {{ record.sourceType === 'internal' ? '内部自研' : '外部平台' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'versions'">
            <span>{{ record.versions?.length || 0 }} 个版本</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" @click="handleDetail(record.id)">查看详情</a-button>
              <a-button size="small" @click="handleResubmit(record)" v-if="canResubmit(record)">修改重提</a-button>
              <a-button size="small" @click="handleAddVersion(record)" v-if="canAddVersion(record)">添加版本</a-button>
              <a-button danger size="small" @click="handleDelete(record)" v-if="canDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { getMySkills, deleteSkill } from '@/api/skill'
import type { Skill } from '@/api/skill'

const router = useRouter()

const columns = [
  { title: 'Skill名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '简介', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '分类', key: 'category', width: 120 },
  { title: '来源', key: 'sourceType', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '版本数', key: 'versions', width: 80 },
  { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 200 }
]

const submissions = ref<Skill[]>([])
const loading = ref(false)

onMounted(() => {
  loadSubmissions()
})

async function loadSubmissions() {
  loading.value = true
  try {
    const res = await getMySkills()
    submissions.value = res.list || res
  } finally {
    loading.value = false
  }
}

function handleDetail(id: number) {
  router.push(`/skill/${id}`)
}

function handleResubmit(record: Skill) {
  // 跳转到修改重新提交页面
  router.push(`/skill/submit?editId=${record.id}&mode=resubmit`)
}

function handleAddVersion(record: Skill) {
  // 跳转到添加版本页面
  router.push(`/skill/submit?editId=${record.id}&mode=addVersion`)
}

function canResubmit(record: Skill): boolean {
  // 只有已驳回状态可以修改重新提交
  return record.status === 'rejected'
}

function canAddVersion(record: Skill): boolean {
  // 已发布、已通过、待审核状态都可以添加新版本
  return record.status === 'published' || record.status === 'approved' || record.status === 'pending_review'
}

function canDelete(record: Skill): boolean {
  // 只有待审核或已驳回状态可以删除
  return record.status === 'pending_review' || record.status === 'rejected'
}

async function handleDelete(record: Skill) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 Skill "${record.name}" 吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        await deleteSkill(record.id)
        message.success('删除成功')
        loadSubmissions()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_review: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布',
    unpublished: '已下架'
  }
  return texts[status] || status
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_review: 'orange',
    reviewing: 'blue',
    approved: 'green',
    rejected: 'red',
    published: 'cyan',
    unpublished: 'default'
  }
  return colors[status] || 'default'
}
</script>

<style scoped>
.my-submissions {
  background: #fff;
}
</style>