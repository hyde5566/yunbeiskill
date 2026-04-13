<template>
  <div class="feedback-manage">
    <a-card :bordered="false" class="list-card" title="反馈管理">
      <template #extra>
        <a-space>
          <a-select v-model:value="filterSkill" placeholder="筛选Skill" allow-clear style="width: 200px" @change="loadData">
            <a-select-option v-for="s in skillOptions" :key="s.value" :value="s.value">{{ s.label }}</a-select-option>
          </a-select>
        </a-space>
      </template>

      <a-table :dataSource="feedbacks" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isInvalid'">
            <a-tag :color="record.isInvalid ? 'red' : 'green'">{{ record.isInvalid ? '无效' : '有效' }}</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button v-if="!record.isInvalid" type="link" size="small" danger @click="handleMarkInvalid(record.id)">标记无效</a-button>
            <a-button v-else type="link" size="small" @click="handleMarkValid(record.id)">恢复有效</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getAllFeedbacks, markFeedbackInvalid } from '../../api/feedback'
import { searchSkills } from '../../api/skill'

const loading = ref(false)
const feedbacks = ref<any[]>([])
const filterSkill = ref<number | undefined>(undefined)
const skillOptions = ref<any[]>([])

const columns = [
  { title: 'Skill名称', dataIndex: 'skillName', key: 'skillName', ellipsis: true },
  { title: '反馈人', dataIndex: 'userName', key: 'userName', width: 100 },
  { title: '反馈内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '评分', dataIndex: 'rating', key: 'rating', width: 80 },
  { title: '状态', key: 'isInvalid', width: 80 },
  { title: '时间', key: 'createdAt', width: 160 },
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
  loadSkillOptions()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getAllFeedbacks({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      skillId: filterSkill.value,
    })
    feedbacks.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function loadSkillOptions() {
  try {
    const res = await searchSkills({ page: 1, pageSize: 100 })
    skillOptions.value = (res.data?.list || []).map((s: any) => ({ label: s.name, value: s.id }))
  } catch { /* ignore */ }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

async function handleMarkInvalid(id: number) {
  try {
    await markFeedbackInvalid(id)
    message.success('已标记为无效')
    loadData()
  } catch { message.error('操作失败') }
}

async function handleMarkValid(id: number) {
  try {
    await markFeedbackInvalid(id, { is_invalid: 0 })
    message.success('已恢复为有效')
    loadData()
  } catch { message.error('操作失败') }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.feedback-manage { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
