<template>
  <div class="role-list">
    <n-card title="角色管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增角色</n-button>
      </template>
      <n-space vertical>
        <n-space>
          <n-input v-model:value="keyword" placeholder="搜索角色名称/编码" clearable style="width: 200px" />
          <n-button @click="handleSearch">搜索</n-button>
        </n-space>
        <n-data-table :columns="columns" :data="tableData" :loading="loading" :pagination="pagination" />
      </n-space>
    </n-card>

    <!-- 角色表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="角色信息" style="width: 500px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="roleName" label="角色名称">
          <n-input v-model:value="formData.roleName" />
        </n-form-item>
        <n-form-item path="roleCode" label="角色编码">
          <n-input v-model:value="formData.roleCode" :disabled="isEdit" />
        </n-form-item>
        <n-form-item path="description" label="描述">
          <n-input v-model:value="formData.description" />
        </n-form-item>
        <n-form-item path="status" label="状态">
          <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 权限分配弹窗 -->
    <n-modal v-model:show="showPermModal" preset="card" title="分配权限" style="width: 500px">
      <n-tree
        block-line
        cascade
        checkable
        :data="permissionTree"
        :checked-keys="checkedPermissionIds"
        @update:checked-keys="handlePermissionCheck"
        label-field="permissionName"
        key-field="id"
      />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPermModal = false">取消</n-button>
          <n-button type="primary" :loading="permSubmitting" @click="handlePermissionSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue'
import { NCard, NButton, NInput, NDataTable, NSpace, NModal, NForm, NFormItem, NSwitch, NTag, NTree, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getRoleList, createRole, updateRole, deleteRole, getRolePermissions, assignRolePermissions, type Role, type RoleDTO } from '../../api/role'
import { getPermissionList, type Permission } from '../../api/permission'

const message = useMessage()
const dialog = useDialog()

const keyword = ref('')
const tableData = ref<Role[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const showPermModal = ref(false)
const permSubmitting = ref(false)
const currentRoleId = ref<number | null>(null)
const permissionList = ref<Permission[]>([])
const checkedPermissionIds = ref<number[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  onChange: (page: number) => {
    pagination.page = page
    loadData()
  }
})

const formData = reactive<RoleDTO>({
  id: undefined,
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

const rules = {
  roleName: { required: true, message: '请输入角色名称', trigger: 'blur' },
  roleCode: { required: true, message: '请输入角色编码', trigger: 'blur' }
}

const permissionTree = computed(() => {
  const buildTree = (items: Permission[], parentId: number): any[] => {
    return items.filter(item => item.parentId === parentId).map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }))
  }
  return buildTree(permissionList.value, 0)
})

const columns: DataTableColumns<Role> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '角色名称', key: 'roleName' },
  { title: '角色编码', key: 'roleCode' },
  { title: '描述', key: 'description' },
  { title: '状态', key: 'status', render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error' }, () => row.status === 1 ? '启用' : '禁用') },
  { title: '操作', key: 'actions', width: 200, render: (row) => h(NSpace, () => [
    h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑'),
    h(NButton, { size: 'small', type: 'warning', onClick: () => openPermModal(row) }, () => '权限'),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除')
  ])}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getRoleList({ page: pagination.page, pageSize: pagination.pageSize, keyword: keyword.value })
    tableData.value = res.data.records
    pagination.itemCount = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadPermissions() {
  const res = await getPermissionList()
  permissionList.value = res.data
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, roleName: '', roleCode: '', description: '', status: 1 })
  showModal.value = true
}

function openEditModal(row: Role) {
  isEdit.value = true
  Object.assign(formData, row)
  showModal.value = true
}

async function openPermModal(row: Role) {
  currentRoleId.value = row.id
  const res = await getRolePermissions(row.id)
  checkedPermissionIds.value = res.data
  showPermModal.value = true
}

function handlePermissionCheck(keys: Array<string | number>) {
  checkedPermissionIds.value = keys as number[]
}

async function handlePermissionSubmit() {
  if (!currentRoleId.value) return
  permSubmitting.value = true
  try {
    await assignRolePermissions(currentRoleId.value, checkedPermissionIds.value)
    message.success('权限分配成功')
    showPermModal.value = false
  } finally {
    permSubmitting.value = false
  }
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateRole(formData)
    } else {
      await createRole(formData)
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
    content: '确定要删除该角色吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteRole(id)
      message.success('删除成功')
      loadData()
    }
  })
}

onMounted(() => {
  loadData()
  loadPermissions()
})
</script>

<style scoped>
.role-list {
  padding: 20px;
}
</style>