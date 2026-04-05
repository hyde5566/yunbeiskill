<template>
  <div class="permission-list">
    <n-card title="权限管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增权限</n-button>
      </template>
      <n-data-table :columns="columns" :data="tableData" :loading="loading" />
    </n-card>

    <!-- 权限表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="权限信息" style="width: 500px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="permissionName" label="权限名称">
          <n-input v-model:value="formData.permissionName" />
        </n-form-item>
        <n-form-item path="permissionCode" label="权限编码">
          <n-input v-model:value="formData.permissionCode" />
        </n-form-item>
        <n-form-item path="description" label="权限描述">
          <n-input v-model:value="formData.description" />
        </n-form-item>
        <n-form-item path="resourceType" label="资源类型">
          <n-select v-model:value="formData.resourceType" :options="typeOptions" />
        </n-form-item>
        <n-form-item path="parentId" label="父级">
          <n-tree-select v-model:value="formData.parentId" :options="treeOptions" clearable />
        </n-form-item>
        <n-form-item path="resourcePath" label="资源路径">
          <n-input v-model:value="formData.resourcePath" />
        </n-form-item>
        <n-form-item path="sortOrder" label="排序">
          <n-input-number v-model:value="formData.sortOrder" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue'
import { NCard, NButton, NDataTable, NSpace, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NTreeSelect, NSwitch, NTag, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getPermissionList, createPermission, updatePermission, deletePermission, type Permission, type PermissionDTO } from '../../api/permission'

const message = useMessage()
const dialog = useDialog()

const tableData = ref<Permission[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const typeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' },
  { label: 'API', value: 'api' }
]

const formData = reactive<PermissionDTO>({
  id: undefined,
  permissionName: '',
  permissionCode: '',
  description: '',
  resourceType: 'menu',
  parentId: 0,
  resourcePath: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  permissionName: { required: true, message: '请输入权限名称', trigger: 'blur' },
  permissionCode: { required: true, message: '请输入权限编码', trigger: 'blur' },
  resourceType: { required: true, message: '请选择资源类型', trigger: 'change' }
}

const treeOptions = computed(() => {
  const buildTree = (items: Permission[], parentId: number): any[] => {
    return items.filter(item => item.parentId === parentId).map(item => ({
      label: item.permissionName,
      key: item.id,
      children: buildTree(items, item.id)
    }))
  }
  return buildTree(tableData.value, 0)
})

const columns: DataTableColumns<Permission> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '权限名称', key: 'permissionName' },
  { title: '权限编码', key: 'permissionCode' },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '类型', key: 'resourceType', width: 80, render: (row) => h(NTag, { type: row.resourceType === 'menu' ? 'info' : row.resourceType === 'button' ? 'warning' : 'default' }, () => row.resourceType) },
  { title: '路径', key: 'resourcePath' },
  { title: '排序', key: 'sortOrder', width: 80 },
  { title: '操作', key: 'actions', width: 150, render: (row) => h(NSpace, () => [
    h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑'),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除')
  ])}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getPermissionList()
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, permissionName: '', permissionCode: '', description: '', resourceType: 'menu', parentId: 0, resourcePath: '', sortOrder: 0, status: 1 })
  showModal.value = true
}

function openEditModal(row: Permission) {
  isEdit.value = true
  Object.assign(formData, row)
  showModal.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updatePermission(formData)
    } else {
      await createPermission(formData)
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
    content: '删除该权限会同时删除子权限，确定要删除吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deletePermission(id)
      message.success('删除成功')
      loadData()
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.permission-list {
  padding: 20px;
}
</style>