<template>
  <div class="permission-config">
    <a-card title="权限配置">
      <div class="search-bar">
        <a-select
          v-model:value="selectedUserId"
          placeholder="选择用户"
          style="width: 300px"
          show-search
          :filter-option="filterOption"
          :options="userOptions"
          @change="handleUserChange"
        />
      </div>

      <div v-if="selectedUserId" class="permission-panel">
        <a-card title="用户权限" size="small">
          <a-checkbox-group v-model:value="selectedPerms" :options="permOptions" />
          <div style="margin-top: 16px">
            <a-button type="primary" @click="handleSave" :loading="saving">保存权限</a-button>
          </div>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getUserList } from '@/api/user'
import { getPermissionList, getUserPermissions, assignPermissions } from '@/api/permission'
import type { User } from '@/api/user'
import type { Permission } from '@/api/permission'

const allPerms = ref<Permission[]>([])
const selectedUserId = ref<number | null>(null)
const selectedPerms = ref<number[]>([])
const saving = ref(false)

const users = ref<User[]>([])
const userOptions = computed(() =>
  users.value.map(u => ({
    value: u.id,
    label: `${u.realName} (${u.department?.name || '无部门'})`
  }))
)

const permOptions = computed(() =>
  allPerms.value.map(p => ({
    value: p.id,
    label: `${p.name} (${p.code})`
  }))
)

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

onMounted(async () => {
  // 加载权限列表
  allPerms.value = await getPermissionList()
  // 加载用户列表
  const res = await getUserList({ pageSize: 100 })
  users.value = res.list
})

async function handleUserChange(userId: number) {
  if (!userId) return
  selectedUserId.value = userId
  // 加载用户当前权限
  const userPerms = await getUserPermissions(userId)
  selectedPerms.value = userPerms.map(p => p.id)
}

async function handleSave() {
  if (!selectedUserId.value) return
  saving.value = true
  try {
    await assignPermissions({
      userId: selectedUserId.value,
      permissionIds: selectedPerms.value
    })
    message.success('权限保存成功')
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.permission-config {
  background: #fff;
}
.search-bar {
  margin-bottom: 16px;
}
.permission-panel {
  margin-top: 16px;
}
</style>