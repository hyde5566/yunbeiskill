<template>
  <div class="user-list">
    <n-card title="用户管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增用户</n-button>
      </template>
      <n-space vertical>
        <n-space>
          <n-input v-model:value="keyword" placeholder="搜索用户名/姓名" clearable style="width: 200px" />
          <n-button @click="handleSearch">搜索</n-button>
        </n-space>
        <n-data-table :columns="columns" :data="tableData" :loading="loading" :pagination="pagination" />
      </n-space>
    </n-card>

    <!-- 用户表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="用户信息" style="width: 500px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="formData.username" :disabled="isEdit" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input v-model:value="formData.password" type="password" :placeholder="isEdit ? '不修改请留空' : '请输入密码'" />
        </n-form-item>
        <n-form-item path="realName" label="姓名">
          <n-input v-model:value="formData.realName" />
        </n-form-item>
        <n-form-item path="phone" label="手机号">
          <n-input v-model:value="formData.phone" />
        </n-form-item>
        <n-form-item path="email" label="邮箱">
          <n-input v-model:value="formData.email" />
        </n-form-item>
        <n-form-item path="status" label="状态">
          <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0" />
        </n-form-item>
        <n-form-item path="roleIds" label="角色">
          <n-checkbox-group v-model:value="formData.roleIds">
            <n-space>
              <n-checkbox v-for="role in roleList" :key="role.id" :value="role.id" :label="role.roleName" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { NCard, NButton, NInput, NDataTable, NSpace, NModal, NForm, NFormItem, NSwitch, NCheckboxGroup, NCheckbox, NTag, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getUserList, createUser, updateUser, deleteUser, getUserRoles, assignUserRoles, type User, type UserDTO } from '../../api/user'
import { getAllRoles, type Role } from '../../api/role'

const message = useMessage()
const dialog = useDialog()

const keyword = ref('')
const tableData = ref<User[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const roleList = ref<Role[]>([])
const formRef = ref()

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: (page: number) => {
    pagination.page = page
    loadData()
  }
})

const formData = reactive<UserDTO>({
  id: undefined,
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  status: 1,
  roleIds: []
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  realName: { required: true, message: '请输入姓名', trigger: 'blur' }
}

const columns: DataTableColumns<User> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '用户名', key: 'username' },
  { title: '姓名', key: 'realName' },
  { title: '角色', key: 'roleNames', render: (row) => h(NSpace, { size: 'small' }, () => (row.roleNames || []).map(name => h(NTag, { type: 'info', size: 'small' }, () => name))) },
  { title: '手机号', key: 'phone' },
  { title: '邮箱', key: 'email' },
  { title: '状态', key: 'status', render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error' }, () => row.status === 1 ? '启用' : '禁用') },
  { title: '操作', key: 'actions', width: 150, render: (row) => h(NSpace, () => [
    h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑'),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除')
  ])}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getUserList({ page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value })
    tableData.value = res.data.records
    pagination.itemCount = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  const res = await getAllRoles()
  roleList.value = res.data
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, username: '', password: '', realName: '', phone: '', email: '', status: 1, roleIds: [] })
  showModal.value = true
}

async function openEditModal(row: User) {
  isEdit.value = true
  const res = await getUserRoles(row.id)
  Object.assign(formData, { ...row, password: '', roleIds: res.data })
  showModal.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(formData)
      await assignUserRoles(formData.id!, formData.roleIds || [])
    } else {
      await createUser(formData)
      if (formData.roleIds?.length) {
        const res = await getUserList({ page: 1, pageSize: 1, keyword: formData.username })
        if (res.data.records.length) {
          await assignUserRoles(res.data.records[0].id, formData.roleIds)
        }
      }
    }
    message.success('操作成功')
    showModal.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

function handleDelete(id: number) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除该用户吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteUser(id)
      message.success('删除成功')
      loadData()
    }
  })
}

onMounted(() => {
  loadData()
  loadRoles()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>