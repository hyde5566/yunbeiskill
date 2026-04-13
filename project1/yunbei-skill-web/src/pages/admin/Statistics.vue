<template>
  <div class="statistics">
    <a-card title="数据统计">
      <!-- 导出按钮 -->
      <div class="export-buttons">
        <a-space>
          <a-button @click="handleExport('skills')">导出Skill统计</a-button>
          <a-button @click="handleExport('downloads')">导出下载记录</a-button>
          <a-button @click="handleExport('users')">导出用户统计</a-button>
          <a-button @click="handleExport('categories')">导出分类统计</a-button>
        </a-space>
      </div>

      <!-- 总览 -->
      <a-row :gutter="16" class="overview-row">
        <a-col :span="4">
          <a-statistic title="总Skill数" :value="overview.totalSkills" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="已发布" :value="overview.publishedSkills" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="待审核" :value="overview.pendingSkills" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="总下载量" :value="overview.totalDownloads" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="总用户数" :value="overview.totalUsers" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="本周新增" :value="overview.weeklyNewSkills" suffix="个" />
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <!-- Skill状态分布 -->
        <a-col :span="8">
          <a-card title="Skill状态分布" size="small">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item v-for="item in skillStats.statusCounts" :key="item.status">
                <template #label>
                  <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                </template>
                {{ item.count }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <!-- 来源类型分布 -->
        <a-col :span="8">
          <a-card title="来源类型分布" size="small">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item v-for="item in skillStats.sourceCounts" :key="item.sourceType">
                <template #label>
                  <a-tag :color="item.sourceType === 'internal' ? 'blue' : 'orange'">
                    {{ item.sourceType === 'internal' ? '内部自研' : '外部平台' }}
                  </a-tag>
                </template>
                {{ item.count }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <!-- 分类统计 -->
        <a-col :span="8">
          <a-card title="分类统计" size="small">
            <a-table
              :columns="categoryColumns"
              :data-source="categoryStats"
              size="small"
              :pagination="false"
              rowKey="categoryId"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'avgRating'">
                  {{ record.avgRating ? record.avgRating.toFixed(1) : '-' }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-row :gutter="16">
        <!-- 下载趋势 -->
        <a-col :span="12">
          <a-card title="近7天下载趋势" size="small">
            <a-table
              :columns="downloadColumns"
              :data-source="downloadStats.dailyDownloads"
              size="small"
              :pagination="false"
              rowKey="date"
            />
          </a-card>
        </a-col>

        <!-- 热门下载TOP10 -->
        <a-col :span="12">
          <a-card title="热门下载TOP10" size="small">
            <a-table
              :columns="topDownloadColumns"
              :data-source="downloadStats.topDownloads"
              size="small"
              :pagination="false"
              rowKey="skillId"
            />
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <!-- 项目维度统计 -->
      <a-card title="项目维度统计" size="small">
        <a-table
          :columns="projectColumns"
          :data-source="projectStats"
          size="small"
          :pagination="false"
          rowKey="projectId"
          :loading="loadingProject"
        />
      </a-card>

      <a-divider />

      <!-- 用户维度统计 -->
      <a-card title="用户维度统计" size="small">
        <a-table
          :columns="userColumns"
          :data-source="userStats.list"
          size="small"
          :pagination="userPagination"
          @change="handleUserTableChange"
          rowKey="userId"
          :loading="loadingUser"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avgRating'">
              {{ record.avgRating ? record.avgRating.toFixed(1) : '-' }}
            </template>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getOverviewStats, getSkillStats, getDownloadStats, getCategoryStats, getProjectStats, getUserStats, getExportUrl } from '@/api/stats'
import type { OverviewStats, SkillStats, DownloadStats, CategoryStats, ProjectStats, UserStats, UserStatsResult } from '@/api/stats'
import { storage } from '@/utils/storage'

const overview = ref<OverviewStats>({
  totalSkills: 0,
  publishedSkills: 0,
  pendingSkills: 0,
  totalDownloads: 0,
  totalUsers: 0,
  totalRatings: 0,
  totalFeedbacks: 0,
  weeklyNewSkills: 0,
  weeklyDownloads: 0
})

const skillStats = ref<SkillStats>({
  statusCounts: [],
  sourceCounts: []
})

const downloadStats = ref<DownloadStats>({
  dailyDownloads: [],
  topDownloads: []
})

const categoryStats = ref<CategoryStats[]>([])
const projectStats = ref<ProjectStats[]>([])
const userStats = ref<UserStatsResult>({ list: [], total: 0, page: 1, pageSize: 20 })

const loadingProject = ref(false)
const loadingUser = ref(false)

const categoryColumns = [
  { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
  { title: 'Skill数', dataIndex: 'skillCount', key: 'skillCount', width: 80 },
  { title: '平均评分', key: 'avgRating', width: 80 }
]

const downloadColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '下载量', dataIndex: 'count', key: 'count' }
]

const topDownloadColumns = [
  { title: 'Skill', dataIndex: 'skillName', key: 'skillName' },
  { title: '下载量', dataIndex: 'downloadCount', key: 'downloadCount' }
]

const projectColumns = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName' },
  { title: '可见Skill数', dataIndex: 'visibleSkillCount', key: 'visibleSkillCount', width: 100 },
  { title: '下载次数', dataIndex: 'downloadCount', key: 'downloadCount', width: 100 },
  { title: '成员数', dataIndex: 'memberCount', key: 'memberCount', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 }
]

const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 100 },
  { title: '姓名', dataIndex: 'realName', key: 'realName', width: 100 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
  { title: '提交数', dataIndex: 'submittedCount', key: 'submittedCount', width: 80 },
  { title: '已发布', dataIndex: 'publishedCount', key: 'publishedCount', width: 80 },
  { title: '下载次数', dataIndex: 'downloadCount', key: 'downloadCount', width: 80 },
  { title: '平均评分', key: 'avgRating', width: 80 },
  { title: '反馈数', dataIndex: 'feedbackCount', key: 'feedbackCount', width: 80 }
]

const userPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    overview.value = await getOverviewStats()
    skillStats.value = await getSkillStats()
    downloadStats.value = await getDownloadStats()
    categoryStats.value = await getCategoryStats()
    loadProjectStats()
    loadUserStats()
  } catch (error: any) {
    message.error(error.message || '加载统计数据失败')
  }
}

async function loadProjectStats() {
  loadingProject.value = true
  try {
    projectStats.value = await getProjectStats()
  } finally {
    loadingProject.value = false
  }
}

async function loadUserStats() {
  loadingUser.value = true
  try {
    const res = await getUserStats(userPagination.value.current, userPagination.value.pageSize)
    userStats.value = res
    userPagination.value.total = res.total
  } finally {
    loadingUser.value = false
  }
}

function handleUserTableChange(pag: any) {
  userPagination.value.current = pag.current
  userPagination.value.pageSize = pag.pageSize
  loadUserStats()
}

function handleExport(type: 'skills' | 'downloads' | 'users' | 'categories') {
  const token = storage.getToken()
  const url = `${getExportUrl(type)}?token=${token}`
  window.open(url, '_blank')
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_review: 'orange',
    reviewing: 'blue',
    approved: 'green',
    rejected: 'red',
    published: 'cyan'
  }
  return colors[status] || 'default'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending_review: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布'
  }
  return texts[status] || status
}
</script>

<style scoped>
.statistics {
  background: #fff;
}
.overview-row {
  margin-bottom: 16px;
}
.export-buttons {
  margin-bottom: 16px;
}
</style>