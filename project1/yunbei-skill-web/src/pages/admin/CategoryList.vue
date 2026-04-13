<template>
  <div class="category-list">
    <a-card title="Skill分类管理">
      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" @click="handleCreate">新增分类</a-button>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
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
      :title="isEdit ? '编辑分类' : '新增分类'"
      @ok="handleSubmit"
      :confirmLoading="submitLoading"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="分类名称">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="分类描述">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sortOrder" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/skill-category'
import type { SkillCategory } from '@/api/skill-category'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '分类名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 120 }
]

const data = ref<SkillCategory[]>([])
const loading = ref(false)

const modalVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  sortOrder: 0
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    data.value = await getCategoryList()
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    sortOrder: 0
  }
  modalVisible.value = true
}

function handleEdit(record: SkillCategory) {
  isEdit.value = true
  editingId.value = record.id
  form.value = {
    name: record.name,
    description: record.description || '',
    sortOrder: record.sortOrder
  }
  modalVisible.value = true
}

async function handleSubmit() {
  if (!form.value.name) {
    message.error('分类名称不能为空')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value && editingId.value) {
      await updateCategory(editingId.value, {
        name: form.value.name,
        description: form.value.description || null,
        sortOrder: form.value.sortOrder
      })
      message.success('更新成功')
    } else {
      await createCategory({
        name: form.value.name,
        description: form.value.description || null,
        sortOrder: form.value.sortOrder
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

function handleDelete(record: SkillCategory) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分类 "${record.name}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteCategory(record.id)
      message.success('删除成功')
      loadData()
    }
  })
}
</script>

<style scoped>
.category-list {
  background: #fff;
}
.action-bar {
  margin-bottom: 16px;
}
</style>