<template>
  <div class="project-list">
    <a-card title="项目管理">
      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" @click="handleCreate">新增项目</a-button>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'members'">
            <span>{{ record.members?.length || 0 }} 人</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
              {{ record.status === 'active' ? '活跃' : '归档' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleMembers(record)">成员管理</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑项目' : '新增项目'"
      @ok="handleSubmit"
      :confirmLoading="submitLoading"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="项目名称">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="项目描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 成员管理弹窗 -->
    <a-modal
      v-model:open="memberModalVisible"
      title="成员管理"
      width="600px"
      :footer="null"
    >
      <div class="member-panel">
        <div class="member-add">
          <a-select
            v-model:value="newMemberIds"
            mode="multiple"
            placeholder="选择用户添加"
            style="width: 400px"
            :options="userOptions"
            show-search
            :filter-option="filterOption"
          />
          <a-button type="primary" @click="handleAddMembers" :loading="addMemberLoading">添加</a-button>
        </div>
        <a-table
          :columns="memberColumns"
          :data-source="memberList"
          :loading="memberLoading"
          rowKey="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" danger @click="handleRemoveMember(record)">移除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getProjectList, createProject, updateProject, deleteProject, getProjectMembers, addProjectMembers, removeProjectMember } from '@/api/project'
import { getUserList } from '@/api/user'
import type { Project } from '@/api/project'
import type { User } from '@/api/user'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '成员数', key: 'members', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 200 }
]

const memberColumns = [
  { title: '账号', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'realName', key: 'realName' },
  { title: '操作', key: 'action', width: 80 }
]

const data = ref<Project[]>([])
const loading = ref(false)

const modalVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  description: ''
})

// 成员管理
const memberModalVisible = ref(false)
const memberList = ref<User[]>([])
const memberLoading = ref(false)
const addMemberLoading = ref(false)
const currentProjectId = ref<number | null>(null)
const newMemberIds = ref<number[]>([])
const allUsers = ref<User[]>([])

const userOptions = computed(() =>
  allUsers.value.map(u => ({
    value: u.id,
    label: `${u.realName} (${u.department?.name || '无部门'})`
  }))
)

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

onMounted(() => {
  loadData()
  loadUsers()
})

async function loadData() {
  loading.value = true
  try {
    data.value = await getProjectList()
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  const res = await getUserList({ pageSize: 1000 })
  allUsers.value = res.list
}

function handleCreate() {
  isEdit.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: ''
  }
  modalVisible.value = true
}

function handleEdit(record: Project) {
  isEdit.value = true
  editingId.value = record.id
  form.value = {
    name: record.name,
    description: record.description || ''
  }
  modalVisible.value = true
}

async function handleSubmit() {
  if (!form.value.name) {
    message.error('项目名称不能为空')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value && editingId.value) {
      await updateProject(editingId.value, {
        name: form.value.name,
        description: form.value.description || null
      })
      message.success('更新成功')
    } else {
      await createProject({
        name: form.value.name,
        description: form.value.description || null
      })
      message.success('创建成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(record: Project) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目 "${record.name}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteProject(record.id)
      message.success('删除成功')
      loadData()
    }
  })
}

async function handleMembers(record: Project) {
  currentProjectId.value = record.id
  memberModalVisible.value = true
  loadMembers()
}

async function loadMembers() {
  if (!currentProjectId.value) return
  memberLoading.value = true
  try {
    memberList.value = await getProjectMembers(currentProjectId.value)
  } finally {
    memberLoading.value = false
  }
}

async function handleAddMembers() {
  if (!currentProjectId.value || newMemberIds.value.length === 0) {
    message.warning('请选择要添加的成员')
    return
  }
  addMemberLoading.value = true
  try {
    await addProjectMembers(currentProjectId.value, newMemberIds.value)
    message.success('添加成功')
    newMemberIds.value = []
    loadMembers()
    loadData()
  } catch (error: any) {
    message.error(error.message || '添加失败')
  } finally {
    addMemberLoading.value = false
  }
}

function handleRemoveMember(record: User) {
  Modal.confirm({
    title: '确认移除',
    content: `确定要将 "${record.realName}" 从项目中移除吗？`,
    okText: '移除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      if (!currentProjectId.value) return
      await removeProjectMember(currentProjectId.value, record.id)
      message.success('移除成功')
      loadMembers()
      loadData()
    }
  })
}
</script>

<style scoped>
.project-list {
  background: #fff;
}
.action-bar {
  margin-bottom: 16px;
}
.member-panel {
  padding: 16px 0;
}
.member-add {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>