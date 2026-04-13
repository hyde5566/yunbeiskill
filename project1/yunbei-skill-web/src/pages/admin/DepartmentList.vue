<template>
  <div class="dept-list">
    <a-card title="部门管理">
      <div class="toolbar">
        <a-button type="primary" @click="handleCreate(null)">新增顶级部门</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="flatData"
        :loading="loading"
        rowKey="id"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span :style="{ paddingLeft: (record.level - 1) * 20 + 'px' }">
              {{ record.name }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleCreate(record)">新增子部门</a-button>
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
      :title="isEdit ? '编辑部门' : '新增部门'"
      @ok="handleSubmit"
      :confirmLoading="submitLoading"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="部门名称">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sortOrder" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getDeptTree, createDept, updateDept, deleteDept } from '@/api/department'
import type { DeptTreeResult } from '@/api/department'

const columns = [
  { title: '部门名称', dataIndex: 'name', key: 'name' },
  { title: '层级', dataIndex: 'level', key: 'level', width: 80 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '操作', key: 'action', width: 200 }
]

const treeData = ref<DeptTreeResult[]>([])
const loading = ref(false)

const flatData = computed(() => {
  const result: DeptTreeResult[] = []
  function flatten(items: DeptTreeResult[]) {
    items.forEach(item => {
      result.push(item)
      if (item.children && item.children.length > 0) {
        flatten(item.children)
      }
    })
  }
  flatten(treeData.value)
  return result
})

const modalVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)
const parentId = ref<number | null>(null)

const form = ref({
  name: '',
  sortOrder: 0
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    treeData.value = await getDeptTree()
  } finally {
    loading.value = false
  }
}

function handleCreate(record: DeptTreeResult | null) {
  isEdit.value = false
  editingId.value = null
  parentId.value = record ? record.id : null
  form.value = {
    name: '',
    sortOrder: 0
  }
  modalVisible.value = true
}

function handleEdit(record: DeptTreeResult) {
  isEdit.value = true
  editingId.value = record.id
  parentId.value = record.parentId
  form.value = {
    name: record.name,
    sortOrder: record.sortOrder
  }
  modalVisible.value = true
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    if (isEdit.value && editingId.value) {
      await updateDept(editingId.value, {
        name: form.value.name,
        sortOrder: form.value.sortOrder
      })
      message.success('更新成功')
    } else {
      await createDept({
        name: form.value.name,
        parentId: parentId.value,
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

function handleDelete(record: DeptTreeResult) {
  if (record.children && record.children.length > 0) {
    message.warning('存在子部门，无法删除')
    return
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除部门 "${record.name}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteDept(record.id)
      message.success('删除成功')
      loadData()
    }
  })
}
</script>

<style scoped>
.dept-list {
  background: #fff;
}
.toolbar {
  margin-bottom: 16px;
}
</style>