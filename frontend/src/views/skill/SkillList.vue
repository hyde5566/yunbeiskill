<template>
  <div class="skill-list">
    <n-card title="Skill管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增Skill</n-button>
      </template>
      <n-space vertical>
        <n-space>
          <n-input v-model:value="keyword" placeholder="搜索名称/编码/描述" clearable style="width: 200px" />
          <n-select v-model:value="filterCategoryId" :options="categoryOptions" placeholder="分类" clearable style="width: 120px" />
          <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="状态" clearable style="width: 120px" />
          <n-select v-model:value="filterType" :options="typeOptions" placeholder="类型" clearable style="width: 120px" />
          <n-button @click="handleSearch">搜索</n-button>
        </n-space>
        <n-data-table :columns="columns" :data="tableData" :loading="loading" :pagination="pagination" />
      </n-space>
    </n-card>

    <!-- Skill表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="Skill信息" style="width: 700px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="90px">
        <n-grid :cols="2" :x-gap="20">
          <n-grid-item>
            <n-form-item path="skillName" label="名称">
              <n-input v-model:value="formData.skillName" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="skillCode" label="编码">
              <n-input v-model:value="formData.skillCode" :disabled="isEdit" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="categoryId" label="分类">
              <n-select v-model:value="formData.categoryId" :options="categoryOptions" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="type" label="类型">
              <n-select v-model:value="formData.type" :options="typeOptions" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="author" label="作者">
              <n-input v-model:value="formData.author" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="version" label="版本">
              <n-input v-model:value="formData.version" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
        <n-form-item path="description" label="描述">
          <n-input v-model:value="formData.description" type="textarea" :rows="3" />
        </n-form-item>
        <n-form-item path="tutorialUrl" label="教程链接">
          <n-input v-model:value="formData.tutorialUrl" />
        </n-form-item>
        <n-divider>来源信息</n-divider>
        <n-grid :cols="2" :x-gap="20">
          <n-grid-item>
            <n-form-item path="sourceType" label="来源类型">
              <n-select v-model:value="formData.sourceType" :options="sourceTypeOptions" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item path="sourceLink" label="来源链接">
              <n-input v-model:value="formData.sourceLink" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
        <n-form-item path="sourceDesc" label="来源说明">
          <n-input v-model:value="formData.sourceDesc" />
        </n-form-item>
        <n-divider>示例</n-divider>
        <n-form-item path="inputExample" label="输入示例">
          <n-input v-model:value="formData.inputExample" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item path="outputExample" label="输出示例">
          <n-input v-model:value="formData.outputExample" type="textarea" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showRejectModal" preset="card" title="拒绝原因" style="width: 400px">
      <n-input v-model:value="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRejectModal = false">取消</n-button>
          <n-button type="error" @click="handleReject">确认拒绝</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NButton, NInput, NSelect, NDataTable, NSpace, NModal, NForm, NFormItem, NGrid, NGridItem, NDivider, NTag, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getSkillList, createSkill, updateSkill, deleteSkill, approveSkill, rejectSkill, offlineSkill, type Skill, type SkillDTO } from '../../api/skill'
import { getCategoryList, type Category } from '../../api/category'

const message = useMessage()
const dialog = useDialog()
const router = useRouter()

const keyword = ref('')
const filterCategoryId = ref<number | null>(null)
const filterStatus = ref<number | null>(null)
const filterType = ref<number | null>(null)
const tableData = ref<Skill[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const categoryList = ref<Category[]>([])

const showRejectModal = ref(false)
const rejectReason = ref('')
const currentRejectId = ref<number | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: (page: number) => {
    pagination.page = page
    loadData()
  }
})

const formData = reactive<SkillDTO>({
  id: undefined,
  skillName: '',
  skillCode: '',
  categoryId: 0,
  description: '',
  inputExample: '',
  outputExample: '',
  author: '',
  version: '1.0.0',
  status: 0,
  type: 1,
  sourceType: 1,
  sourceDesc: '',
  sourceLink: '',
  tutorialUrl: ''
})

const rules = {
  skillName: { required: true, message: '请输入Skill名称', trigger: 'blur' },
  skillCode: { required: true, message: '请输入Skill编码', trigger: 'blur' },
  categoryId: { required: true, type: 'number', message: '请选择分类', trigger: 'change' }
}

const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已下架', value: 3 }
]

const typeOptions = [
  { label: '工作流辅助', value: 1 },
  { label: '代码模板', value: 2 },
  { label: '规范文档', value: 3 },
  { label: '外部集成', value: 4 }
]

const sourceTypeOptions = [
  { label: '个人原创', value: 1 },
  { label: '同事贡献', value: 2 },
  { label: '第三方渠道', value: 3 }
]

const categoryOptions = computed(() =>
  categoryList.value.map(c => ({ label: c.categoryName, value: c.id }))
)

const columns: DataTableColumns<Skill> = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '名称', key: 'skillName', ellipsis: { tooltip: true } },
  { title: '分类', key: 'categoryName', width: 80 },
  { title: '类型', key: 'type', width: 100, render: (row) => h(NTag, { size: 'small' }, () => typeOptions.find(t => t.value === row.type)?.label) },
  { title: '版本', key: 'version', width: 70 },
  { title: '下载', key: 'downloadCount', width: 60 },
  { title: '评分', key: 'avgRating', width: 60 },
  { title: '状态', key: 'status', width: 80, render: (row) => {
    const status = statusOptions.find(s => s.value === row.status)
    const type = row.status === 1 ? 'success' : row.status === 0 ? 'warning' : row.status === 2 ? 'error' : 'default'
    return h(NTag, { type, size: 'small' }, () => status?.label)
  }},
  { title: '操作', key: 'actions', width: 250, render: (row) => {
    const buttons = [
      h(NButton, { size: 'small', onClick: () => router.push(`/skill/${row.id}`) }, () => '查看'),
      h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑')
    ]
    if (row.status === 0) {
      buttons.push(h(NButton, { size: 'small', type: 'success', onClick: () => handleApprove(row.id) }, () => '通过'))
      buttons.push(h(NButton, { size: 'small', type: 'warning', onClick: () => openRejectModal(row.id) }, () => '拒绝'))
    }
    if (row.status === 1) {
      buttons.push(h(NButton, { size: 'small', type: 'error', onClick: () => handleOffline(row.id) }, () => '下架'))
    }
    buttons.push(h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除'))
    return h(NSpace, { size: 'small' }, () => buttons)
  }}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getSkillList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: keyword.value,
      categoryId: filterCategoryId.value || undefined,
      status: filterStatus.value,
      type: filterType.value
    })
    tableData.value = res.data.records
    pagination.itemCount = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const res = await getCategoryList()
  categoryList.value = res.data
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined, skillName: '', skillCode: '', categoryId: null,
    description: '', inputExample: '', outputExample: '', author: '',
    version: '1.0.0', status: 0, type: 1, sourceType: 1, sourceDesc: '',
    sourceLink: '', tutorialUrl: ''
  })
  showModal.value = true
}

function openEditModal(row: Skill) {
  isEdit.value = true
  Object.assign(formData, row)
  showModal.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateSkill(formData)
    } else {
      await createSkill(formData)
    }
    message.success('操作成功')
    showModal.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

async function handleApprove(id: number) {
  await approveSkill(id)
  message.success('审核通过')
  loadData()
}

function openRejectModal(id: number) {
  currentRejectId.value = id
  rejectReason.value = ''
  showRejectModal.value = true
}

async function handleReject() {
  if (!rejectReason.value) {
    message.warning('请输入拒绝原因')
    return
  }
  await rejectSkill(currentRejectId.value!, rejectReason.value)
  message.success('已拒绝')
  showRejectModal.value = false
  loadData()
}

async function handleOffline(id: number) {
  dialog.warning({
    title: '确认下架',
    content: '确定要下架该Skill吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await offlineSkill(id, '管理员下架')
      message.success('已下架')
      loadData()
    }
  })
}

function handleDelete(id: number) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除该Skill吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteSkill(id)
      message.success('删除成功')
      loadData()
    }
  })
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style scoped>
.skill-list {
  padding: 20px;
}
</style>