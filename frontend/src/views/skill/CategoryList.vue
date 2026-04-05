<template>
  <div class="category-list">
    <n-card title="Skill分类管理">
      <template #header-extra>
        <n-button type="primary" @click="openCreateModal">新增分类</n-button>
      </template>
      <n-data-table :columns="columns" :data="tableData" :loading="loading" />
    </n-card>

    <!-- 分类表单弹窗 -->
    <n-modal v-model:show="showModal" preset="card" title="分类信息" style="width: 500px">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="categoryName" label="分类名称">
          <n-input v-model:value="formData.categoryName" />
        </n-form-item>
        <n-form-item path="categoryCode" label="分类编码">
          <n-input v-model:value="formData.categoryCode" :disabled="isEdit" />
        </n-form-item>
        <n-form-item path="description" label="描述">
          <n-input v-model:value="formData.description" />
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
import { ref, reactive, h, onMounted } from 'vue'
import { NCard, NButton, NDataTable, NSpace, NModal, NForm, NFormItem, NInput, NInputNumber, NSwitch, NTag, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getCategoryList, createCategory, updateCategory, deleteCategory, type Category, type CategoryDTO } from '../../api/category'

const message = useMessage()
const dialog = useDialog()

const tableData = ref<Category[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const formData = reactive<CategoryDTO>({
  id: undefined,
  categoryName: '',
  categoryCode: '',
  parentId: 0,
  description: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  categoryName: { required: true, message: '请输入分类名称', trigger: 'blur' },
  categoryCode: { required: true, message: '请输入分类编码', trigger: 'blur' }
}

const columns: DataTableColumns<Category> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '分类名称', key: 'categoryName' },
  { title: '分类编码', key: 'categoryCode' },
  { title: '描述', key: 'description' },
  { title: '排序', key: 'sortOrder', width: 80 },
  { title: '状态', key: 'status', render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error' }, () => row.status === 1 ? '启用' : '禁用') },
  { title: '操作', key: 'actions', width: 150, render: (row) => h(NSpace, () => [
    h(NButton, { size: 'small', onClick: () => openEditModal(row) }, () => '编辑'),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, () => '删除')
  ])}
]

async function loadData() {
  loading.value = true
  try {
    const res = await getCategoryList()
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEdit.value = false
  Object.assign(formData, { id: undefined, categoryName: '', categoryCode: '', parentId: 0, description: '', sortOrder: 0, status: 1 })
  showModal.value = true
}

function openEditModal(row: Category) {
  isEdit.value = true
  Object.assign(formData, row)
  showModal.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateCategory(formData)
    } else {
      await createCategory(formData)
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
    content: '确定要删除该分类吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteCategory(id)
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
.category-list {
  padding: 20px;
}
</style>