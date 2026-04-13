<template>
  <div class="user-list">
    <a-card title="用户管理">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索用户名/姓名"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-select
          v-model:value="departmentId"
          placeholder="选择部门"
          allowClear
          style="width: 150px"
          :options="deptOptions"
        />
        <a-select
          v-model:value="status"
          placeholder="状态"
          allowClear
          style="width: 100px"
          :options="statusOptions"
        />
        <a-button type="primary" @click="handleCreate">新增用户</a-button>
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
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      @ok="handleSubmit"
      :confirmLoading="submitLoading"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="账号" v-if="!isEdit">
          <a-input v-model:value="form.username" />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model:value="form.realName" />
        </a-form-item>
        <a-form-item label="部门">
          <a-tree-select
            v-model:value="form.departmentId"
            :tree-data="deptTreeData"
            placeholder="选择部门"
            treeDefaultExpandAll
            :fieldNames="{ label: 'title', value: 'value', children: 'children' }"
          />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="form.phone" />
        </a-form-item>
        <a-form-item label="密码" v-if="!isEdit">
          <a-input-password v-model:value="form.password" placeholder="初始密码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { getDeptTree } from '@/api/department'
import type { User, Department } from '@/api/user'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '账号', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'realName', key: 'realName' },
  { title: '部门', dataIndex: ['department', 'name'], key: 'department' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]

const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '禁用' }
]

const data = ref<User[]>([])
const loading = ref(false)
const keyword = ref('')
const departmentId = ref<number | undefined>()
const status = ref<number | undefined>()

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const deptTree = ref<any[]>([])
const deptTreeData = computed(() => {
  function transform(items: any[]): any[] {
    return items.map(item => ({
      value: item.id,
      title: item.name,
      children: item.children ? transform(item.children) : []
    }))
  }
  return transform(deptTree.value)
})
const deptOptions = computed(() => {
  const options: any[] = []
  function flatten(items: any[]) {
    items.forEach(item => {
      options.push({ value: item.id, label: item.name })
      if (item.children) flatten(item.children)
    })
  }
  flatten(deptTree.value)
  return options
})

const modalVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  username: '',
  realName: '',
  departmentId: undefined as number | undefined,
  email: '',
  phone: '',
  password: '',
  status: 1
})

onMounted(() => {
  loadData()
  loadDeptTree()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: keyword.value,
      departmentId: departmentId.value,
      status: status.value
    })
    data.value = res.list
    pagination.value.total = res.total
  } finally {
    loading.value = false
  }
}

async function loadDeptTree() {
  deptTree.value = await getDeptTree()
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
  isEdit.value = false
  editingId.value = null
  form.value = {
    username: '',
    realName: '',
    departmentId: undefined,
    email: '',
    phone: '',
    password: '',
    status: 1
  }
  modalVisible.value = true
}

function handleEdit(record: User) {
  isEdit.value = true
  editingId.value = record.id
  form.value = {
    username: record.username,
    realName: record.realName,
    departmentId: record.departmentId,
    email: record.email || '',
    phone: record.phone || '',
    password: '',
    status: record.status
  }
  modalVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    // 确保departmentId是数字类型
    const deptId = typeof form.value.departmentId === 'string'
      ? parseInt(form.value.departmentId, 10)
      : form.value.departmentId

    if (isEdit.value && editingId.value) {
      await updateUser(editingId.value, {
        realName: form.value.realName,
        departmentId: deptId,
        email: form.value.email,
        phone: form.value.phone,
        status: form.value.status
      })
      message.success('更新成功')
    } else {
      await createUser({
        username: form.value.username,
        realName: form.value.realName,
        departmentId: deptId!,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password
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

function handleDelete(record: User) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.realName}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteUser(record.id)
      message.success('删除成功')
      loadData()
    }
  })
}
</script>

<style scoped>
.user-list {
  background: #fff;
}
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>