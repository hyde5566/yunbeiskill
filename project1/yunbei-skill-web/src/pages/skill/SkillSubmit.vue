<template>
  <div class="skill-submit">
    <a-card :title="pageTitle">
      <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <!-- 创建新Skill时显示的字段 -->
        <template v-if="!editId">
          <a-form-item label="Skill名称" required>
            <a-input v-model:value="form.name" placeholder="请输入Skill名称" />
          </a-form-item>

          <a-form-item label="简介">
            <a-textarea v-model:value="form.description" :rows="2" placeholder="简短描述" />
          </a-form-item>

          <a-form-item label="详细说明">
            <a-textarea v-model:value="form.detailDescription" :rows="4" placeholder="完整说明（可选）" />
          </a-form-item>

          <a-form-item label="作者">
            <a-input v-model:value="form.author" placeholder="作者名称" />
          </a-form-item>

          <a-form-item label="分类" required>
            <a-select v-model:value="form.categoryId" placeholder="选择分类" :options="categoryOptions" />
          </a-form-item>

          <a-form-item label="来源类型" required>
            <a-radio-group v-model:value="form.sourceType">
              <a-radio value="internal">内部自研</a-radio>
              <a-radio value="external">外部平台</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="来源网址" v-if="form.sourceType === 'external'" required>
            <a-input v-model:value="form.sourceName" placeholder="如 clawhub.ai" />
          </a-form-item>

          <a-form-item label="关联项目">
            <a-select v-model:value="form.projectId" placeholder="选择关联项目（可选）" allowClear :options="projectOptions" />
          </a-form-item>

          <a-form-item label="可见范围" required>
            <a-radio-group v-model:value="form.visibilityType">
              <a-radio value="all">全部可见</a-radio>
              <a-radio value="project">按项目成员可见</a-radio>
              <a-radio value="account">指定账号可见</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="选择项目" v-if="form.visibilityType === 'project'">
            <a-select v-model:value="form.visibilityTargets" mode="multiple" placeholder="选择项目" :options="projectOptions" />
          </a-form-item>

          <a-form-item label="选择用户" v-if="form.visibilityType === 'account'">
            <a-select v-model:value="form.visibilityTargets" mode="multiple" placeholder="选择用户" :options="userOptions" show-search :filter-option="filterOption" />
          </a-form-item>

          <!-- 版本信息（创建新Skill需要） -->
          <a-form-item label="版本号" required>
            <a-input v-model:value="form.versionNumber" placeholder="如 v1.0" />
          </a-form-item>

          <a-form-item label="更新说明">
            <a-textarea v-model:value="form.changeLog" :rows="3" placeholder="版本更新说明" />
          </a-form-item>

          <a-form-item label="Zip包">
            <a-upload
              :file-list="fileList"
              :before-upload="beforeUpload"
              @remove="handleRemove"
              accept=".zip"
            >
              <a-button>
                <upload-outlined />
                选择Zip包（最大50MB）
              </a-button>
            </a-upload>
            <div class="upload-tip" v-if="fileList.length > 0">
              已选择: {{ fileList[0].name }} ({{ formatSize(fileList[0].size || 0) }})
            </div>
          </a-form-item>
        </template>

        <!-- 添加版本时显示的Skill信息 -->
        <template v-if="isAddVersion && existingSkill">
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="Skill名称">{{ existingSkill.name }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ existingSkill.category?.name }}</a-descriptions-item>
            <a-descriptions-item label="来源">
              <a-tag :color="existingSkill.sourceType === 'internal' ? 'blue' : 'orange'">
                {{ existingSkill.sourceType === 'internal' ? '内部自研' : '外部平台' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(existingSkill.status)">{{ getStatusText(existingSkill.status) }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
          <a-divider />

          <!-- 添加版本的版本信息 -->
          <a-form-item label="版本号" required>
            <a-input v-model:value="form.versionNumber" placeholder="如 v1.1" />
          </a-form-item>

          <a-form-item label="更新说明">
            <a-textarea v-model:value="form.changeLog" :rows="3" placeholder="版本更新说明" />
          </a-form-item>

          <a-form-item label="Zip包">
            <a-upload
              :file-list="fileList"
              :before-upload="beforeUpload"
              @remove="handleRemove"
              accept=".zip"
            >
              <a-button>
                <upload-outlined />
                选择Zip包（最大50MB）
              </a-button>
            </a-upload>
            <div class="upload-tip" v-if="fileList.length > 0">
              已选择: {{ fileList[0].name }} ({{ formatSize(fileList[0].size || 0) }})
            </div>
          </a-form-item>
        </template>

        <!-- 修改重新提交时显示的字段 -->
        <template v-if="isResubmit && existingSkill">
          <a-alert type="warning" show-icon style="margin-bottom: 16px">
            <template #message>该Skill已被驳回，修改后将重新进入审核流程</template>
          </a-alert>

          <a-form-item label="Skill名称" required>
            <a-input v-model:value="form.name" placeholder="请输入Skill名称" />
          </a-form-item>

          <a-form-item label="简介">
            <a-textarea v-model:value="form.description" :rows="2" placeholder="简短描述" />
          </a-form-item>

          <a-form-item label="分类" required>
            <a-select v-model:value="form.categoryId" placeholder="选择分类" :options="categoryOptions" />
          </a-form-item>

          <a-form-item label="来源类型" required>
            <a-radio-group v-model:value="form.sourceType">
              <a-radio value="internal">内部自研</a-radio>
              <a-radio value="external">外部平台</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="来源网址" v-if="form.sourceType === 'external'" required>
            <a-input v-model:value="form.sourceName" placeholder="如 clawhub.ai" />
          </a-form-item>

          <a-form-item label="可见范围" required>
            <a-radio-group v-model:value="form.visibilityType">
              <a-radio value="all">全部可见</a-radio>
              <a-radio value="project">按项目成员可见</a-radio>
              <a-radio value="account">指定账号可见</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="选择项目" v-if="form.visibilityType === 'project'">
            <a-select v-model:value="form.visibilityTargets" mode="multiple" placeholder="选择项目" :options="projectOptions" />
          </a-form-item>

          <a-form-item label="选择用户" v-if="form.visibilityType === 'account'">
            <a-select v-model:value="form.visibilityTargets" mode="multiple" placeholder="选择用户" :options="userOptions" show-search :filter-option="filterOption" />
          </a-form-item>
        </template>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit" :loading="submitting">{{ isAddVersion ? '添加版本' : '提交' }}</a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { createSkill, addSkillVersion, getSkill, resubmitSkill } from '@/api/skill'
import { getCategoryList } from '@/api/skill-category'
import { getProjectList } from '@/api/project'
import { getUserList } from '@/api/user'
import type { SkillCategory } from '@/api/skill-category'
import type { Project } from '@/api/project'
import type { User } from '@/api/user'
import type { Skill } from '@/api/skill'

const router = useRouter()
const route = useRoute()

// 检查模式：editId参数，mode参数
const editId = route.query.editId as string
const mode = route.query.mode as string // 'addVersion' 或 'resubmit'

// 三种模式：create、addVersion、resubmit
const isAddVersion = computed(() => !!editId && mode === 'addVersion')
const isResubmit = computed(() => !!editId && mode === 'resubmit')
const pageTitle = computed(() => {
  if (isAddVersion.value) return '添加新版本'
  if (isResubmit.value) return '修改并重新提交'
  return '提交新Skill'
})

const existingSkill = ref<Skill | null>(null)

const form = ref({
  name: '',
  description: '',
  detailDescription: '',
  author: '',
  categoryId: undefined as number | undefined,
  sourceType: 'internal' as 'internal' | 'external',
  sourceName: '',
  projectId: undefined as number | undefined,
  visibilityType: 'all' as 'all' | 'project' | 'account',
  visibilityTargets: [] as number[],
  versionNumber: '',
  changeLog: ''
})

const fileList = ref<any[]>([])
const submitting = ref(false)

const categories = ref<SkillCategory[]>([])
const projects = ref<Project[]>([])
const users = ref<User[]>([])

const categoryOptions = computed(() =>
  categories.value.map(c => ({ value: c.id, label: c.name }))
)

const projectOptions = computed(() =>
  projects.value.map(p => ({ value: p.id, label: p.name }))
)

const userOptions = computed(() =>
  users.value.map(u => ({ value: u.id, label: `${u.realName} (${u.department?.name || '无部门'})` }))
)

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

onMounted(() => {
  loadCategories()
  loadProjects()
  loadUsers()
  if (editId) {
    loadExistingSkill()
  }
})

async function loadCategories() {
  categories.value = await getCategoryList()
}

async function loadProjects() {
  projects.value = await getProjectList()
}

async function loadUsers() {
  const res = await getUserList({ pageSize: 1000 })
  users.value = res.list
}

async function loadExistingSkill() {
  try {
    existingSkill.value = await getSkill(Number(editId))
    // 如果是修改重新提交模式，填充表单数据
    if (isResubmit.value && existingSkill.value) {
      form.value.name = existingSkill.value.name
      form.value.description = existingSkill.value.description || ''
      form.value.categoryId = existingSkill.value.categoryId
      form.value.sourceType = existingSkill.value.sourceType
      form.value.sourceName = existingSkill.value.sourceName || ''
      form.value.visibilityType = existingSkill.value.visibilityType
      if (existingSkill.value.visibilitySettings && existingSkill.value.visibilitySettings.length > 0) {
        form.value.visibilityTargets = existingSkill.value.visibilitySettings.map(v => v.targetId)
      }
    }
  } catch (error: any) {
    message.error(error.message || '加载Skill信息失败')
    router.push('/my-submissions')
  }
}

function beforeUpload(file: File) {
  const isZip = file.name.endsWith('.zip')
  if (!isZip) {
    message.error('只能上传Zip文件')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB')
    return false
  }
  fileList.value = [file]
  return false // 阻止自动上传
}

function handleRemove() {
  fileList.value = []
}

function formatSize(size: number) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (isResubmit.value) {
      // 修改重新提交
      if (!form.value.name) {
        message.error('Skill名称不能为空')
        return
      }
      if (!form.value.categoryId) {
        message.error('分类不能为空')
        return
      }
      if (form.value.sourceType === 'external' && !form.value.sourceName) {
        message.error('来源网址不能为空')
        return
      }

      await resubmitSkill(Number(editId), {
        name: form.value.name,
        description: form.value.description,
        categoryId: form.value.categoryId,
        sourceType: form.value.sourceType,
        sourceName: form.value.sourceName,
        visibilityType: form.value.visibilityType,
        visibilityTargets: form.value.visibilityTargets
      })
      message.success('修改提交成功，等待审核')
      router.push('/my-submissions')
    } else if (isAddVersion.value) {
      // 添加新版本
      if (!form.value.versionNumber) {
        message.error('版本号不能为空')
        return
      }
      if (fileList.value.length === 0) {
        message.error('请上传Zip包')
        return
      }
      const file = fileList.value[0]
      await addSkillVersion(Number(editId), {
        versionNumber: form.value.versionNumber,
        zipPath: `local/${file.name}`,
        zipSize: file.size,
        changeLog: form.value.changeLog
      })
      message.success('版本添加成功，等待审核')
      router.push('/my-submissions')
    } else {
      // 创建新Skill
      if (!form.value.name) {
        message.error('Skill名称不能为空')
        return
      }
      if (!form.value.categoryId) {
        message.error('分类不能为空')
        return
      }
      if (form.value.sourceType === 'external' && !form.value.sourceName) {
        message.error('来源网址不能为空')
        return
      }
      if (!form.value.versionNumber) {
        message.error('版本号不能为空')
        return
      }
      if (fileList.value.length === 0) {
        message.error('请上传Zip包')
        return
      }

      const file = fileList.value[0]
      // 1. 创建Skill
      const skill = await createSkill({
        name: form.value.name,
        description: form.value.description,
        categoryId: form.value.categoryId,
        sourceType: form.value.sourceType,
        sourceName: form.value.sourceName,
        visibilityType: form.value.visibilityType,
        visibilityTargets: form.value.visibilityTargets
      })

      // 2. 添加版本
      await addSkillVersion(skill.id, {
        versionNumber: form.value.versionNumber,
        zipPath: `local/${file.name}`,
        zipSize: file.size,
        changeLog: form.value.changeLog
      })

      message.success('提交成功，等待审核')
      router.push('/skill')
    }
  } catch (error: any) {
    message.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  if (isAddVersion.value) {
    router.push('/my-submissions')
  } else {
    router.push('/skill')
  }
}

// 切换可见范围类型时清空已选择的targets
watch(() => form.value.visibilityType, () => {
  form.value.visibilityTargets = []
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_review: 'orange',
    reviewing: 'blue',
    approved: 'green',
    rejected: 'red',
    published: 'cyan',
    unpublished: 'default'
  }
  return colors[status] || 'default'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_review: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布',
    unpublished: '已下架'
  }
  return texts[status] || status
}
</script>

<style scoped>
.skill-submit {
  background: #fff;
  max-width: 800px;
  margin: 0 auto;
}
.upload-tip {
  color: #1890ff;
  margin-top: 8px;
}
</style>