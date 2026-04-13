<template>
  <div class="skill-detail">
    <a-card>
      <template #title>
        <a-space>
          <a-button @click="$router.back()">返回</a-button>
          <span>{{ skill?.name }}</span>
          <a-button type="primary" size="small" v-if="isAdmin && skill" @click="showEditModal">编辑</a-button>
        </a-space>
      </template>
      <a-descriptions :column="2" bordered v-if="skill">
        <a-descriptions-item label="Skill名称">{{ skill.name }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(skill.status)">{{ getStatusText(skill.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分类">{{ skill.category?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="来源">
          <a-tag :color="skill.sourceType === 'internal' ? 'blue' : 'orange'">
            {{ skill.sourceType === 'internal' ? '内部自研' : '外部平台' }}
          </a-tag>
          <span v-if="skill.sourceName">: {{ skill.sourceName }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="作者">{{ skill.author || '-' }}</a-descriptions-item>
        <a-descriptions-item label="提交人">{{ skill.submitter?.realName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="提交时间">{{ skill.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="可见范围">
          <span v-if="skill.visibilityType === 'all'">全部可见</span>
          <span v-else-if="skill.visibilityType === 'project'">按项目成员可见</span>
          <span v-else-if="skill.visibilityType === 'account'">指定账号可见</span>
        </a-descriptions-item>
        <a-descriptions-item label="简介" :span="2">{{ skill.description || '-' }}</a-descriptions-item>
        <a-descriptions-item label="详细说明" :span="2">
          <div v-if="skill.detailDescription" class="detail-content">{{ skill.detailDescription }}</div>
          <span v-else>-</span>
        </a-descriptions-item>
        <a-descriptions-item label="下载统计">{{ downloadStats.total }} 次（近7天 {{ downloadStats.recentWeek }} 次）</a-descriptions-item>
        <a-descriptions-item label="评分">
          <a-space>
            <span>{{ ratingStats.average.toFixed(1) }} 分</span>
            <span>({{ ratingStats.total }} 人评分)</span>
          </a-space>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 我的评分 -->
      <div class="rating-section" v-if="skill?.status === 'published'">
        <a-divider>我的评分</a-divider>
        <a-space>
          <span>评分：</span>
          <a-rate v-model:value="myRating" :count="5" @change="handleRatingChange" />
          <span v-if="myRating">{{ myRating }} 分</span>
        </a-space>
      </div>

      <a-divider>版本列表</a-divider>

      <a-table
        :columns="versionColumns"
        :data-source="versions"
        :loading="loadingVersions"
        rowKey="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getVersionStatusColor(record.status)">{{ getVersionStatusText(record.status) }}</a-tag>
          </template>
          <template v-if="column.key === 'zipSize'">
            {{ formatSize(record.zipSize) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="primary" size="small" v-if="record.status === 'published'" @click="handleDownload(record)">
              下载
            </a-button>
          </template>
        </template>
      </a-table>

      <!-- 反馈区域 -->
      <a-divider>用户反馈</a-divider>

      <div class="feedback-section">
        <a-list
          :data-source="feedbacks"
          :loading="loadingFeedbacks"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="item.content">
                <template #title>
                  <a-space>
                    <span>{{ item.user?.realName || '匿名' }}</span>
                    <span class="feedback-time">{{ item.createdAt }}</span>
                  </a-space>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>

        <div class="feedback-form" v-if="skill?.status === 'published'">
          <a-textarea v-model:value="feedbackContent" :rows="3" placeholder="提交反馈..." />
          <a-button type="primary" @click="handleFeedbackSubmit" :loading="submittingFeedback" style="margin-top: 8px">
            提交反馈
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑Skill"
      width="600px"
      @ok="handleEditSubmit"
      :confirm-loading="editSubmitting"
    >
      <a-form :model="editForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="Skill名称" required>
          <a-input v-model:value="editForm.name" />
        </a-form-item>
        <a-form-item label="简介">
          <a-textarea v-model:value="editForm.description" :rows="2" />
        </a-form-item>
        <a-form-item label="详细说明">
          <a-textarea v-model:value="editForm.detailDescription" :rows="4" />
        </a-form-item>
        <a-form-item label="作者">
          <a-input v-model:value="editForm.author" />
        </a-form-item>
        <a-form-item label="分类" required>
          <a-select v-model:value="editForm.categoryId" :options="categoryOptions" />
        </a-form-item>
        <a-form-item label="来源类型" required>
          <a-radio-group v-model:value="editForm.sourceType">
            <a-radio value="internal">内部自研</a-radio>
            <a-radio value="external">外部平台</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="来源网址" v-if="editForm.sourceType === 'external'">
          <a-input v-model:value="editForm.sourceName" />
        </a-form-item>
        <a-form-item label="可见范围" required>
          <a-radio-group v-model:value="editForm.visibilityType">
            <a-radio value="all">全部可见</a-radio>
            <a-radio value="project">按项目成员可见</a-radio>
            <a-radio value="account">指定账号可见</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="选择项目" v-if="editForm.visibilityType === 'project'">
          <a-select v-model:value="editForm.visibilityTargets" mode="multiple" :options="projectOptions" />
        </a-form-item>
        <a-form-item label="选择用户" v-if="editForm.visibilityType === 'account'">
          <a-select v-model:value="editForm.visibilityTargets" mode="multiple" :options="userOptions" show-search :filter-option="filterOption" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { getSkill, getSkillVersions, updateSkill } from '@/api/skill'
import { createDownload, getDownloadStats } from '@/api/download'
import { createRating, getMyRating, getRatingStats } from '@/api/rating'
import { createFeedback, getSkillFeedbacks } from '@/api/feedback'
import { getCategoryList } from '@/api/skill-category'
import { getProjectList } from '@/api/project'
import { getUserList } from '@/api/user'
import { storage } from '@/utils/storage'
import type { Skill, SkillVersion } from '@/api/skill'
import type { Feedback } from '@/api/feedback'
import type { SkillCategory } from '@/api/skill-category'
import type { Project } from '@/api/project'
import type { User } from '@/api/user'

const route = useRoute()
const skillId = Number(route.params.id)

const skill = ref<Skill | null>(null)
const versions = ref<SkillVersion[]>([])
const loading = ref(false)
const loadingVersions = ref(false)

const downloadStats = ref({ total: 0, recentWeek: 0 })
const ratingStats = ref({ average: 0, total: 0, distribution: {} as Record<number, number> })
const myRating = ref(0)

const feedbacks = ref<Feedback[]>([])
const loadingFeedbacks = ref(false)
const feedbackContent = ref('')
const submittingFeedback = ref(false)

const isAdmin = ref(false)

const versionColumns = [
  { title: '版本号', dataIndex: 'versionNumber', key: 'versionNumber' },
  { title: '文件大小', key: 'zipSize', width: 120 },
  { title: '更新说明', dataIndex: 'changeLog', key: 'changeLog', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

// 编辑相关
const editModalVisible = ref(false)
const editSubmitting = ref(false)
const editForm = ref({
  name: '',
  description: '',
  detailDescription: '',
  author: '',
  categoryId: undefined as number | undefined,
  sourceType: 'internal' as 'internal' | 'external',
  sourceName: '',
  visibilityType: 'all' as 'all' | 'project' | 'account',
  visibilityTargets: [] as number[]
})

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
  loadUserInfo()
  loadSkill()
  loadVersions()
  loadStats()
  loadMyRating()
  loadFeedbacks()
  loadCategories()
  loadProjects()
  loadUsers()
})

function loadUserInfo() {
  const userInfoStr = storage.get('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      isAdmin.value = userInfo?.permissions?.includes('admin') || false
    } catch (e) {
      isAdmin.value = false
    }
  }
}

async function loadSkill() {
  loading.value = true
  try {
    skill.value = await getSkill(skillId)
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadVersions() {
  loadingVersions.value = true
  try {
    versions.value = await getSkillVersions(skillId)
  } catch (error: any) {
    message.error(error.message || '加载版本失败')
  } finally {
    loadingVersions.value = false
  }
}

async function loadStats() {
  try {
    downloadStats.value = await getDownloadStats(skillId)
    ratingStats.value = await getRatingStats(skillId)
  } catch (error: any) {
    // 忽略统计加载失败
  }
}

async function loadMyRating() {
  try {
    const rating = await getMyRating(skillId)
    myRating.value = rating?.score || 0
  } catch (error: any) {
    // 忽略
  }
}

async function loadFeedbacks() {
  loadingFeedbacks.value = true
  try {
    const res = await getSkillFeedbacks(skillId, 1, 20)
    feedbacks.value = res.list
  } catch (error: any) {
    // 忽略
  } finally {
    loadingFeedbacks.value = false
  }
}

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

function showEditModal() {
  if (!skill.value) return
  editForm.value = {
    name: skill.value.name,
    description: skill.value.description || '',
    detailDescription: skill.value.detailDescription || '',
    author: skill.value.author || '',
    categoryId: skill.value.categoryId,
    sourceType: skill.value.sourceType,
    sourceName: skill.value.sourceName || '',
    visibilityType: skill.value.visibilityType,
    visibilityTargets: skill.value.visibilitySettings?.map(v => v.targetId) || []
  }
  editModalVisible.value = true
}

async function handleEditSubmit() {
  if (!editForm.value.name) {
    message.error('Skill名称不能为空')
    return
  }
  if (!editForm.value.categoryId) {
    message.error('分类不能为空')
    return
  }

  editSubmitting.value = true
  try {
    await updateSkill(skillId, {
      name: editForm.value.name,
      description: editForm.value.description,
      detailDescription: editForm.value.detailDescription,
      author: editForm.value.author,
      categoryId: editForm.value.categoryId,
      sourceType: editForm.value.sourceType,
      sourceName: editForm.value.sourceName,
      visibilityType: editForm.value.visibilityType,
      visibilityTargets: editForm.value.visibilityTargets
    })
    message.success('更新成功')
    editModalVisible.value = false
    loadSkill()
  } catch (error: any) {
    message.error(error.message || '更新失败')
  } finally {
    editSubmitting.value = false
  }
}

async function handleRatingChange(value: number) {
  try {
    await createRating(skillId, value)
    message.success('评分成功')
    loadStats()
  } catch (error: any) {
    message.error(error.message || '评分失败')
  }
}

async function handleDownload(version: SkillVersion) {
  try {
    const result = await createDownload(skillId, version.id)
    message.success('下载记录已保存')
    loadStats()
  } catch (error: any) {
    message.error(error.message || '下载失败')
  }
}

async function handleFeedbackSubmit() {
  if (!feedbackContent.value) {
    message.error('请输入反馈内容')
    return
  }

  submittingFeedback.value = true
  try {
    await createFeedback(skillId, feedbackContent.value)
    message.success('反馈提交成功')
    feedbackContent.value = ''
    loadFeedbacks()
  } catch (error: any) {
    message.error(error.message || '提交失败')
  } finally {
    submittingFeedback.value = false
  }
}

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

function getVersionStatusColor(status: string) {
  return getStatusColor(status)
}

function getVersionStatusText(status: string) {
  return getStatusText(status)
}

function formatSize(size: number) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

// 切换可见范围类型时清空已选择的targets
watch(() => editForm.value.visibilityType, () => {
  editForm.value.visibilityTargets = []
})
</script>

<style scoped>
.skill-detail {
  background: #fff;
}
.rating-section {
  padding: 0 16px;
}
.feedback-section {
  padding: 0 16px;
}
.feedback-form {
  margin-top: 16px;
}
.feedback-time {
  color: #999;
  font-size: 12px;
}
.detail-content {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>