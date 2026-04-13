<template>
  <div class="project-list">
    <a-card :bordered="false" class="list-card" title="项目管理">
      <template #extra>
        <a-button type="primary" @click="showModal()">
          <PlusOutlined /> 新增项目
        </a-button>
      </template>

      <a-table :dataSource="projects" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'default'">{{ record.status === 1 ? '进行中' : '已结束' }}</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="$router.push(`/admin/projects/${record.id}/members`)">成员</a-button>
              <a-button type="link" size="small" @click="showModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalVisible" :title="editingProject ? '编辑项目' : '新增项目'" @ok="handleSave" :confirm-loading="saving">
      <a-form :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="项目名称" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="项目描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
        <a-form-item label="项目负责人">
          <a-select v-model:value="form.managerId" placeholder="请选择" allow-clear show-search :filter-option="filterOption" style="width: 100%">
            <a-select-option v-for="u in userOptions" :key="u.value" :value="u.value">{{ u.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">进行中</a-radio>
            <a-radio :value="0">已结束</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getProjects, createProject, updateProject, deleteProject } from '../../api/project'
import { getUsers } from '../../api/user'

const loading = ref(false)
const saving = ref(false)
const projects = ref<any[]>([])
const modalVisible = ref(false)
const editingProject = ref<any>(null)
const userOptions = ref<any[]>([])

const form = ref({
  name: '',
  description: '',
  managerId: undefined as number | undefined,
  status: 1,
})

const columns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '负责人', dataIndex: 'managerName', key: 'managerName', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', key: 'createdAt', width: 160 },
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
  loadUsers()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getProjects({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    projects.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function loadUsers() {
  try {
    const res = await getUsers({ page: 1, pageSize: 100 })
    userOptions.value = (res.data?.list || []).map((u: any) => ({ label: `${u.name} (${u.username})`, value: u.id }))
  } catch { /* ignore */ }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function filterOption(input: string, option: any) {
  return option.label?.toLowerCase().includes(input.toLowerCase())
}

function showModal(project?: any) {
  editingProject.value = project || null
  if (project) {
    form.value = { name: project.name, description: project.description || '', managerId: project.managerId, status: project.status }
  } else {
    form.value = { name: '', description: '', managerId: undefined, status: 1 }
  }
  modalVisible.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) {
    message.warning('请输入项目名称')
    return
  }
  saving.value = true
  try {
    if (editingProject.value) {
      await updateProject(editingProject.value.id, form.value)
      message.success('更新成功')
    } else {
      await createProject(form.value)
      message.success('创建成功')
    }
    modalVisible.value = false
    loadData()
  } catch { message.error('操作失败') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    await deleteProject(id)
    message.success('删除成功')
    loadData()
  } catch { message.error('删除失败') }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.project-list { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
