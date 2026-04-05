<template>
  <div class="org-list">
    <n-card title="组织管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增组织</n-button>
      </template>
      <n-data-table :columns="columns" :data="tableData" :loading="loading" />
    </n-card>

    <!-- 组织表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="组织信息" style="width: 500px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="orgName" label="组织名称">
          <n-input v-model:value="formData.orgName" />
        </n-form-item>
        <n-form-item path="orgCode" label="组织编码">
          <n-input v-model:value="formData.orgCode" :disabled="isEdit" />
        </n-form-item>
        <n-form-item path="parentId" label="上级组织">
          <n-tree-select v-model:value="formData.parentId" :options="treeOptions" clearable />
        </n-form-item>
        <n-form-item path="orgType" label="组织类型">
          <n-select v-model:value="formData.orgType" :options="typeOptions" />
        </n-form-item>
        <n-form-item path="leader" label="负责人">
          <n-input v-model:value="formData.leader" />
        </n-form-item>
        <n-form-item path="phone" label="联系电话">
          <n-input v-model:value="formData.phone" />
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
import { getOrgList, createOrg, updateOrg, deleteOrg, type Organization, type OrganizationDTO } from '../../api/organization'

const message = useMessage()
const dialog = useDialog()

const tableData = ref<Organization[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const typeOptions = [
  { label: '公司', value: 1 },
  { label: '部门', value: 2 },
  { label: '小组', value: 3 }
]

const formData = reactive<OrganizationDTO>({
  id: undefined,
  orgName: '',
  orgCode: '',
  parentId: 0,
  orgType: 1,
  leader: '',
  phone: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  orgName: { required: true, message: '请输入组织名称', trigger: 'blur' },
  orgCode: { required: true, message: '请输入组织编码', trigger: 'blur' }
}

const treeOptions = computed(() => {
  const buildTree = (items: Organization[], parentId: number): any[] => {
    return items.filter(item => item.parentId === parentId).map(item => ({
      label: item.orgName,
      key: item.id,
      children: buildTree(items, item.id)
    }))
  }
  return buildTree(tableData.value, 0)
})

const columns: DataTableColumns<Organization> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '组织名称', key: 'orgName' },
  { title: '组织编码', key: 'orgCode' },
  { title: '类型', key: 'orgType', render: (row) => h(NTag, { type: row.orgType === 1 ? 'success' : row.orgType === 2 ? 'info' : 'warning' }, () => typeOptions.find(o => o.value === row.orgType)?.label || '-') },
  { title: '负责人', key: 'leader' },
  { title: '电话', key: 'phone' },
  { title: '操作', key: 'actions', width: 150, render: (row) => h(NSpace, () => [
    h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑'),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除')
  ])}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getOrgList()
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, orgName: '', orgCode: '', parentId: 0, orgType: 1, leader: '', phone: '', sortOrder: 0, status: 1 })
  showModal.value = true
}

function openEditModal(row: Organization) {
  isEdit.value = true
  Object.assign(formData, row)
  showModal.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateOrg(formData)
    } else {
      await createOrg(formData)
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
    content: '删除该组织会同时删除子组织，确定要删除吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteOrg(id)
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
.org-list {
  padding: 20px;
}
</style>