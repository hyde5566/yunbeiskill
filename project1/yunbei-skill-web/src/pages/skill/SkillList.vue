<template>
  <div class="skill-list">
    <a-card title="Skill检索中心">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索Skill名称/描述"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-select
          v-model:value="categoryId"
          placeholder="分类"
          allowClear
          style="width: 150px"
          :options="categoryOptions"
        />
        <a-select
          v-model:value="sourceType"
          placeholder="来源"
          allowClear
          style="width: 120px"
          :options="sourceOptions"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button @click="handleCreate">提交新Skill</a-button>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="handleDetail(record)">{{ record.name }}</a>
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
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSkillList } from '@/api/skill'
import { getCategoryList } from '@/api/skill-category'
import type { Skill } from '@/api/skill'
import type { SkillCategory } from '@/api/skill-category'

const router = useRouter()

const columns = [
  { title: 'Skill名称', dataIndex: 'name', key: 'name' },
  { title: '简介', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '分类', key: 'category', width: 120 },
  { title: '来源', key: 'sourceType', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '提交人', dataIndex: ['submitter', 'realName'], key: 'submitter', width: 100 },
  { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 }
]

const sourceOptions = [
  { value: 'internal', label: '内部自研' },
  { value: 'external', label: '外部平台' }
]

const data = ref<Skill[]>([])
const loading = ref(false)
const keyword = ref('')
const categoryId = ref<number | undefined>()
const sourceType = ref<string | undefined>()

const categories = ref<SkillCategory[]>([])
const categoryOptions = computed(() =>
  categories.value.map(c => ({ value: c.id, label: c.name }))
)

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

onMounted(() => {
  loadData()
  loadCategories()
})

async function loadCategories() {
  categories.value = await getCategoryList()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getSkillList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: keyword.value,
      categoryId: categoryId.value,
      sourceType: sourceType.value
    })
    data.value = res.list
    pagination.value.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.value.current = 1
  loadData()
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function handleCreate() {
  router.push('/skill/submit')
}

function handleDetail(record: Skill) {
  router.push(`/skill/${record.id}`)
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_review: 'orange',
    reviewing: 'blue',
    approved: 'green',
    rejected: 'red',
    published: 'cyan'
  }
  return colors[status] || 'default'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_review: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布'
  }
  return texts[status] || status
}

// 监听筛选条件变化自动搜索
watch([categoryId, sourceType], () => {
  pagination.value.current = 1
  loadData()
})
</script>

<style scoped>
.skill-list {
  background: #fff;
}
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>