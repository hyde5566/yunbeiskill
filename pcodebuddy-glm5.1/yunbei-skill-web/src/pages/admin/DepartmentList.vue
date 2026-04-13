<template>
  <div class="department-list">
    <a-card :bordered="false" class="list-card" title="部门管理">
      <template #extra>
        <a-button type="primary" @click="showModal()">
          <PlusOutlined /> 新增部门
        </a-button>
      </template>

      <a-table
        :dataSource="departments"
        :columns="columns"
        :loading="loading"
        :pagination="false"
        row-key="id"
        default-expand-all-rows
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showModal(record)">编辑</a-button>
              <a-button type="link" size="small" @click="showModal(undefined, record.id)">新增子部门</a-button>
              <a-popconfirm title="确定删除？删除后不可恢复" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalVisible" :title="editingDept ? '编辑部门' : '新增部门'" @ok="handleSave" :confirm-loading="saving">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="部门名称" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="上级部门">
          <a-tree-select v-model:value="form.parent_id" :tree-data="deptTree" placeholder="无（顶级部门）" tree-default-expand-all allow-clear />
        </a-form-item>
        <a-form-item label="排序号">
          <a-input-number v-model:value="form.sort_order" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getDepartments, getDepartmentTree, createDepartment, updateDepartment, deleteDepartment } from '../../api/department'

const loading = ref(false)
const saving = ref(false)
const departments = ref<any[]>([])
const modalVisible = ref(false)
const editingDept = ref<any>(null)

const form = ref({
  name: '',
  parent_id: undefined as number | undefined,
  sort_order: 0,
})

const columns = [
  { title: '部门名称', dataIndex: 'name', key: 'name' },
  { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
  { title: '操作', key: 'action', width: 220 },
]

const deptTree = computed(() => buildTree(departments.value))

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getDepartmentTree()
    departments.value = res.data || []
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function buildTree(list: any[]): any[] {
  return list.map(item => ({
    value: item.id,
    title: item.name,
    children: item.children?.length ? buildTree(item.children) : undefined,
  }))
}

function showModal(dept?: any, parentId?: number) {
  editingDept.value = dept || null
  if (dept) {
    form.value = { name: dept.name, parent_id: dept.parent_id, sort_order: dept.sort_order }
  } else {
    form.value = { name: '', parent_id: parentId, sort_order: 0 }
  }
  modalVisible.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) {
    message.warning('请输入部门名称')
    return
  }
  saving.value = true
  try {
    if (editingDept.value) {
      await updateDepartment(editingDept.value.id, form.value)
      message.success('更新成功')
    } else {
      await createDepartment(form.value)
      message.success('创建成功')
    }
    modalVisible.value = false
    loadData()
  } catch { message.error('操作失败') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    await deleteDepartment(id)
    message.success('删除成功')
    loadData()
  } catch { message.error('删除失败') }
}
</script>

<style scoped>
.department-list { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
