<template>
  <div class="skill-detail">
    <n-card v-if="skill">
      <template #header>
        <n-space justify="space-between">
          <n-space align="center">
            <n-h2 style="margin: 0">{{ skill.skillName }}</n-h2>
            <n-tag :type="statusType">{{ statusLabel }}</n-tag>
          </n-space>
          <n-space>
            <n-button v-if="skill.status === 1" type="primary" @click="handleDownload">下载</n-button>
            <n-button type="info" @click="showVersionModal = true">版本历史</n-button>
            <n-button @click="$router.back()">返回</n-button>
          </n-space>
        </n-space>
      </template>

      <n-descriptions label-placement="left" :column="3" bordered>
        <n-descriptions-item label="编码">{{ skill.skillCode }}</n-descriptions-item>
        <n-descriptions-item label="分类">{{ skill.categoryName }}</n-descriptions-item>
        <n-descriptions-item label="类型">{{ typeLabel }}</n-descriptions-item>
        <n-descriptions-item label="作者">{{ skill.author }}</n-descriptions-item>
        <n-descriptions-item label="版本">{{ skill.version }}</n-descriptions-item>
        <n-descriptions-item label="下载次数">{{ skill.downloadCount }}</n-descriptions-item>
        <n-descriptions-item label="评分">
          <n-rate :value="skill.avgRating" readonly allow-half />
          <span style="margin-left: 8px">{{ skill.avgRating }}</span>
        </n-descriptions-item>
      </n-descriptions>

      <n-divider>描述</n-divider>
      <n-p>{{ skill.description || '暂无描述' }}</n-p>

      <n-divider>使用教程</n-divider>
      <n-p v-if="skill.tutorialUrl">
        <a :href="skill.tutorialUrl" target="_blank">{{ skill.tutorialUrl }}</a>
      </n-p>
      <n-p v-else>暂无</n-p>

      <n-divider>来源信息</n-divider>
      <n-descriptions label-placement="left" :column="2">
        <n-descriptions-item label="来源类型">{{ sourceTypeLabel }}</n-descriptions-item>
        <n-descriptions-item label="来源说明">{{ skill.sourceDesc || '暂无' }}</n-descriptions-item>
        <n-descriptions-item label="来源链接" :span="2">
          <a v-if="skill.sourceLink" :href="skill.sourceLink" target="_blank">{{ skill.sourceLink }}</a>
          <span v-else>暂无</span>
        </n-descriptions-item>
      </n-descriptions>

      <n-divider>示例</n-divider>
      <n-grid :cols="2" :x-gap="20">
        <n-grid-item>
          <n-card title="输入示例" size="small">
            <n-code :code="skill.inputExample || '暂无'" language="text" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="输出示例" size="small">
            <n-code :code="skill.outputExample || '暂无'" language="text" />
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-divider>标签</n-divider>
      <n-space>
        <n-tag v-for="tag in skill.tags" :key="tag" type="info">{{ tag }}</n-tag>
        <span v-if="!skill.tags?.length">暂无标签</span>
      </n-space>
    </n-card>

    <!-- 版本历史弹窗 -->
    <n-modal v-model:show="showVersionModal" preset="card" title="版本历史" style="width: 700px">
      <template #header-extra>
        <n-button size="small" type="primary" @click="openNewVersionModal">发布新版本</n-button>
      </template>
      <n-data-table :columns="versionColumns" :data="versionList" :loading="versionLoading" />
    </n-modal>

    <!-- 新建版本弹窗 -->
    <n-modal v-model:show="showNewVersionModal" preset="card" title="发布新版本" style="width: 500px">
      <n-form ref="versionFormRef" :model="versionForm" :rules="versionRules" label-placement="left" label-width="80px">
        <n-form-item path="version" label="版本号">
          <n-input v-model:value="versionForm.version" placeholder="如: 1.1.0" />
        </n-form-item>
        <n-form-item path="changeLog" label="更新日志">
          <n-input v-model:value="versionForm.changeLog" type="textarea" :rows="4" placeholder="描述本次更新的内容" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showNewVersionModal = false">取消</n-button>
          <n-button type="primary" :loading="versionSubmitting" @click="handleCreateVersion">发布</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NSpace, NH2, NTag, NButton, NDescriptions, NDescriptionsItem, NDivider, NP, NGrid, NGridItem, NCode, NRate, NModal, NDataTable, NForm, NFormItem, NInput, useMessage, useDialog, type DataTableColumns } from 'naive-ui'
import { getSkillById, downloadSkill, type Skill } from '../../api/skill'
import { getVersionList, createVersion, rollbackVersion, type SkillVersion } from '../../api/version'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const skill = ref<Skill | null>(null)
const showVersionModal = ref(false)
const versionList = ref<SkillVersion[]>([])
const versionLoading = ref(false)

const showNewVersionModal = ref(false)
const versionSubmitting = ref(false)
const versionFormRef = ref()

const versionForm = ref({
  skillId: 0,
  version: '',
  changeLog: ''
})

const versionRules = {
  version: { required: true, message: '请输入版本号', trigger: 'blur' },
  changeLog: { required: true, message: '请输入更新日志', trigger: 'blur' }
}

const versionColumns: DataTableColumns<SkillVersion> = [
  { title: '版本', key: 'version', width: 100 },
  { title: '更新日志', key: 'changeLog', ellipsis: { tooltip: true } },
  { title: '发布时间', key: 'createTime', width: 180 },
  { title: '操作', key: 'actions', width: 120, render: (row) => {
    return NSpace ? h(NSpace, () => [
      h(NButton, { size: 'small', onClick: () => handleRollback(row) }, () => '回滚')
    ]) : null
  }}
]

const statusLabel = computed(() => {
  const labels = ['待审核', '已通过', '已拒绝', '已下架']
  return labels[skill.value?.status || 0]
})

const statusType = computed(() => {
  const types: any = { 1: 'success', 0: 'warning', 2: 'error', 3: 'default' }
  return types[skill.value?.status || 0]
})

const typeLabel = computed(() => {
  const labels = ['', '工作流辅助', '代码模板', '规范文档', '外部集成']
  return labels[skill.value?.type || 1]
})

const sourceTypeLabel = computed(() => {
  const labels = ['', '个人原创', '同事贡献', '第三方渠道']
  return labels[skill.value?.sourceType || 1]
})

async function loadData() {
  const id = Number(route.params.id)
  const res = await getSkillById(id)
  skill.value = res.data
  versionForm.value.skillId = id
}

async function loadVersionList() {
  if (!skill.value) return
  versionLoading.value = true
  try {
    const res = await getVersionList(skill.value.id)
    versionList.value = res.data
  } finally {
    versionLoading.value = false
  }
}

async function handleDownload() {
  if (!skill.value) return
  await downloadSkill(skill.value.id)
  message.success('下载成功')
  loadData()
}

function openNewVersionModal() {
  // 自动计算下一个版本号
  if (skill.value) {
    const currentVersion = skill.value.version || '1.0.0'
    const parts = currentVersion.split('.')
    const patch = parseInt(parts[parts.length - 1] || '0') + 1
    parts[parts.length - 1] = String(patch)
    versionForm.value.version = parts.join('.')
  }
  versionForm.value.changeLog = ''
  showNewVersionModal.value = true
}

async function handleCreateVersion() {
  await versionFormRef.value?.validate()
  versionSubmitting.value = true
  try {
    await createVersion(versionForm.value)
    message.success('版本发布成功')
    showNewVersionModal.value = false
    loadVersionList()
    loadData()
  } finally {
    versionSubmitting.value = false
  }
}

function handleRollback(row: SkillVersion) {
  if (!skill.value) return
  dialog.warning({
    title: '确认回滚',
    content: `确定要回滚到版本 ${row.version} 吗？将创建一个新版本。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await rollbackVersion(skill.value!.id, row.id)
      message.success('回滚成功')
      loadVersionList()
      loadData()
    }
  })
}

// 监听版本历史弹窗打开
import { h, watch } from 'vue'
watch(showVersionModal, (val) => {
  if (val) {
    loadVersionList()
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.skill-detail {
  padding: 20px;
}
</style>