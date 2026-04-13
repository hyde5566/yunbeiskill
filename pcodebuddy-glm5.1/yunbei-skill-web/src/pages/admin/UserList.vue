<template>
  <div class="user-list">
    <a-card :bordered="false" class="list-card" title="用户管理">
      <template #extra>
        <a-button type="primary" @click="showModal()">
          <PlusOutlined /> 新增用户
        </a-button>
      </template>

      <a-table :dataSource="users" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">{{ record.status === 1 ? '启用' : '禁用' }}</a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalVisible" :title="editingUser ? '编辑用户' : '新增用户'" @ok="handleSave" :confirm-loading="saving">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名" required>
          <a-input v-model:value="form.username" :disabled="!!editingUser" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="form.real_name" />
        </a-form-item>
        <a-form-item v-if="!editingUser" label="密码" required>
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-form-item label="部门">
          <a-tree-select v-model:value="form.department_id" :tree-data="deptTree" placeholder="请选择部门" tree-default-expand-all allow-clear />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="form.phone" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="form.status" :checked-value="1" :un-checked-value="0" checked-children="启用" un-checked-children="禁用" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user'
import { getDepartmentTree } from '../../api/department'

const loading = ref(false)
const saving = ref(false)
const users = ref<any[]>([])
const modalVisible = ref(false)
const editingUser = ref<any>(null)
const deptTree = ref<any[]>([])

const form = ref({
  username: '',
  real_name: '',
  password: '',
  department_id: undefined as number | undefined,
  phone: '',
  email: '',
  status: 1,
})

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'real_name', key: 'real_name' },
  { title: '部门', dataIndex: 'department_name', key: 'department_name' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 120 },
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
  loadDeptTree()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    users.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function loadDeptTree() {
  try {
    const res = await getDepartmentTree()
    deptTree.value = buildTree(res.data || [])
  } catch { /* ignore */ }
}

function buildTree(list: any[]): any[] {
  return list.map(item => ({
    value: item.id,
    title: item.name,
    children: item.children ? buildTree(item.children) : undefined,
  }))
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function showModal(user?: any) {
  editingUser.value = user || null
  if (user) {
    form.value = { username: user.username, real_name: user.real_name, password: '', department_id: user.department_id, phone: user.phone || '', email: user.email || '', status: user.status }
  } else {
    form.value = { username: '', real_name: '', password: '', department_id: undefined, phone: '', email: '', status: 1 }
  }
  modalVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, form.value)
      message.success('更新成功')
    } else {
      await createUser(form.value)
      message.success('创建成功')
    }
    modalVisible.value = false
    loadData()
  } catch { message.error('操作失败') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    await deleteUser(id)
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
.user-list { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
