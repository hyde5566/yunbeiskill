<template>
  <div class="permission-config">
    <a-card :bordered="false" class="list-card" title="权限配置">
      <p style="color: #8c8c8c; margin-bottom: 16px">管理用户的权限，三种权限可自由组合：基础权限、审核权限、管理权限</p>

      <a-table :dataSource="users" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissions'">
            <a-checkbox-group v-model:value="record._permissions" @change="handlePermissionChange(record)">
              <a-checkbox value="basic">基础权限</a-checkbox>
              <a-checkbox value="review">审核权限</a-checkbox>
              <a-checkbox value="admin">管理权限</a-checkbox>
            </a-checkbox-group>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUsers } from '../../api/user'
import { getUserPermissions, assignPermissions } from '../../api/permission'

const loading = ref(false)
const users = ref<any[]>([])

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '权限配置', key: 'permissions', width: 300 },
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
})

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    users.value = (res.data?.list || []).map((u: any) => ({
      ...u,
      _permissions: u.permissions || [],
    }))
    pagination.value.total = res.data?.total || 0
    // load permissions for each user
    for (const user of users.value) {
      try {
        const permRes = await getUserPermissions(user.id)
        user._permissions = (permRes.data || []).map((p: any) => p.permissionName || p.name)
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

async function handlePermissionChange(record: any) {
  try {
    await assignPermissions({ user_id: record.id, permission_codes: record._permissions })
    message.success('权限更新成功')
  } catch {
    message.error('权限更新失败')
  }
}
</script>

<style scoped>
.permission-config { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
