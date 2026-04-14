<template>
  <div class="project-members">
    <a-card :bordered="false" class="list-card" :title="`项目成员 - ${projectName}`">
      <template #extra>
        <a-space>
          <a-button @click="$router.back()">返回项目列表</a-button>
          <a-button type="primary" @click="showAddMember">添加成员</a-button>
        </a-space>
      </template>

      <a-table :dataSource="members" :columns="columns" :loading="loading" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确定移除该成员？" @confirm="handleRemoveMember(record.userId)">
              <a-button type="link" size="small" danger>移除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 关联Skill -->
    <a-card :bordered="false" class="list-card" style="margin-top: 16px" title="关联Skill">
      <template #extra>
        <a-button type="primary" @click="showAddSkill">关联Skill</a-button>
      </template>

      <a-table :dataSource="skills" :columns="skillColumns" :loading="skillLoading" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确定取消关联？" @confirm="handleRemoveSkill(record.skillId)">
              <a-button type="link" size="small" danger>取消关联</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加成员弹窗 -->
    <a-modal v-model:open="memberModalVisible" title="添加成员" @ok="handleAddMember" :confirm-loading="addingMember">
      <a-select v-model:value="selectedUserIds" mode="multiple" placeholder="请选择用户" style="width: 100%" show-search :filter-option="filterOption" :options="userOptions" />
    </a-modal>

    <!-- 关联Skill弹窗 -->
    <a-modal v-model:open="skillModalVisible" title="关联Skill" @ok="handleAddSkill" :confirm-loading="addingSkill">
      <a-select v-model:value="selectedSkillIds" mode="multiple" placeholder="请选择Skill" style="width: 100%" show-search :filter-option="skillFilterOption" :options="skillOptions" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { getProjectDetail, getProjectMembers, addProjectMembers, removeProjectMember, getProjectSkills, addProjectSkills, removeProjectSkill } from '../../api/project'
import { getUsers } from '../../api/user'
import { searchSkills } from '../../api/skill'

const route = useRoute()
const projectId = Number(route.params.id)
const projectName = ref('')
const loading = ref(false)
const skillLoading = ref(false)
const members = ref<any[]>([])
const skills = ref<any[]>([])
const memberModalVisible = ref(false)
const skillModalVisible = ref(false)
const addingMember = ref(false)
const addingSkill = ref(false)
const selectedUserIds = ref<number[]>([])
const selectedSkillIds = ref<number[]>([])
const userOptions = ref<any[]>([])
const skillOptions = ref<any[]>([])

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
  { title: '操作', key: 'action', width: 80 },
]

const skillColumns = [
  { title: 'Skill名称', dataIndex: 'skillName', key: 'skillName' },
  { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
  { title: '来源', dataIndex: 'skillSource', key: 'skillSource' },
  { title: '操作', key: 'action', width: 100 },
]

onMounted(() => {
  loadProject()
  loadMembers()
  loadSkills()
})

async function loadProject() {
  try {
    const res = await getProjectDetail(projectId)
    projectName.value = res.data?.name || ''
  } catch { /* ignore */ }
}

async function loadMembers() {
  loading.value = true
  try {
    const res = await getProjectMembers(projectId)
    members.value = res.data || []
  } catch { /* ignore */ }
  finally { loading.value = false }
}

async function loadSkills() {
  skillLoading.value = true
  try {
    const res = await getProjectSkills(projectId)
    skills.value = res.data || []
  } catch { /* ignore */ }
  finally { skillLoading.value = false }
}

function showAddMember() {
  selectedUserIds.value = []
  loadUserOptions()
  memberModalVisible.value = true
}

async function loadUserOptions() {
  try {
    const res = await getUsers({ page: 1, pageSize: 100 })
    userOptions.value = (res.data?.list || []).map((u: any) => ({ label: `${u.name} (${u.username})`, value: u.id }))
  } catch { /* ignore */ }
}

function showAddSkill() {
  selectedSkillIds.value = []
  loadSkillOptions()
  skillModalVisible.value = true
}

async function loadSkillOptions() {
  try {
    const res = await searchSkills({ page: 1, pageSize: 100 })
    skillOptions.value = (res.data?.list || []).map((s: any) => ({ label: s.name, value: s.id }))
  } catch { /* ignore */ }
}

async function handleAddMember() {
  if (selectedUserIds.value.length === 0) { message.warning('请选择用户'); return }
  addingMember.value = true
  try {
    await addProjectMembers(projectId, { user_ids: selectedUserIds.value })
    message.success('添加成功')
    memberModalVisible.value = false
    loadMembers()
  } catch { message.error('添加失败') }
  finally { addingMember.value = false }
}

async function handleRemoveMember(userId: number) {
  try {
    await removeProjectMember(projectId, userId)
    message.success('移除成功')
    loadMembers()
  } catch { message.error('移除失败') }
}

async function handleAddSkill() {
  if (selectedSkillIds.value.length === 0) { message.warning('请选择Skill'); return }
  addingSkill.value = true
  try {
    await addProjectSkills(projectId, { skill_ids: selectedSkillIds.value })
    message.success('关联成功')
    skillModalVisible.value = false
    loadSkills()
  } catch { message.error('关联失败') }
  finally { addingSkill.value = false }
}

async function handleRemoveSkill(skillId: number) {
  try {
    await removeProjectSkill(projectId, skillId)
    message.success('取消关联成功')
    loadSkills()
  } catch { message.error('取消关联失败') }
}

function filterOption(input: string, option: any) {
  return option.label?.toLowerCase().includes(input.toLowerCase())
}

function skillFilterOption(input: string, option: any) {
  return option.label?.toLowerCase().includes(input.toLowerCase())
}
</script>

<style scoped>
.project-members { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.list-card { border-radius: 12px; }
</style>
