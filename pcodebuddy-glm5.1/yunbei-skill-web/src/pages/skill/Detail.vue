<template>
  <div class="skill-detail">
    <a-spin :spinning="loading">
      <!-- 顶部信息区 -->
      <a-card v-if="skill" :bordered="false" class="detail-header">
        <a-row :gutter="24">
          <a-col :span="18">
            <div class="header-top">
              <h2 class="skill-title">{{ skill.name }}</h2>
              <a-tag :color="skill.source_type === 'internal' ? 'blue' : 'green'" size="large">
                {{ skill.source_type === 'internal' ? '内部自研' : '外部平台' }}
              </a-tag>
              <a-tag v-if="skill.status === 'published'" color="success">已发布</a-tag>
              <a-tag v-else-if="skill.status === 'reviewing'" color="processing">审核中</a-tag>
              <a-tag v-else-if="skill.status === 'approved'" color="cyan">已入库</a-tag>
              <a-tag v-else-if="skill.status === 'rejected'" color="error">已驳回</a-tag>
              <a-tag v-else-if="skill.status === 'pending_review'" color="default">待审核</a-tag>
              <a-tag v-else-if="skill.status === 'offline'" color="warning">已下架</a-tag>
              <a-tag v-else color="default">未知</a-tag>
            </div>
            <p class="skill-summary">{{ skill.summary || '暂无简介' }}</p>
            <div class="skill-meta">
              <span class="meta-item"><UserOutlined /> {{ skill.author || '未知' }}</span>
              <span class="meta-item"><ApartmentOutlined /> {{ skill.submitter?.department?.name || '-' }}</span>
              <span class="meta-item"><TagOutlined /> {{ skill.category?.name || '-' }}</span>
              <span class="meta-item" v-if="skill.source_url_name">
                <LinkOutlined /> <a :href="skill.source_url" target="_blank">{{ skill.source_url_name }}</a>
              </span>
            </div>
          </a-col>
          <a-col :span="6" class="header-right-col">
            <div class="rating-box">
              <div class="rating-score">{{ skill.avg_rating?.toFixed(1) || '-' }}</div>
              <a-rate :value="skill.avg_rating" disabled allow-half :count="5" />
              <div class="rating-count">{{ skill.rating_count || 0 }} 人评分</div>
            </div>
            <div class="download-box">
              <a-select v-model:value="selectedVersion" style="width: 100%; margin-bottom: 12px" placeholder="选择版本">
                <a-select-option v-for="v in versions" :key="v.id" :value="v.id">
                  v{{ v.version_number }}
                </a-select-option>
              </a-select>
              <a-button type="primary" size="large" block :disabled="!selectedVersion" @click="handleDownload">
                <DownloadOutlined /> 下载 Zip
              </a-button>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Tab 切换区 -->
      <a-card v-if="skill" :bordered="false" class="detail-content" style="margin-top: 16px">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="detail" tab="详细说明">
            <div class="detail-text" v-if="skill.detail" v-html="sanitizeHtml(skill.detail)" />
            <p v-else style="color: #8c8c8c">暂无详细说明</p>
          </a-tab-pane>

          <a-tab-pane key="versions" tab="版本历史">
            <a-table :dataSource="versions" :columns="versionColumns" :pagination="false" row-key="id" size="middle">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'version'">
                  <a-tag color="blue">v{{ record.version_number }}</a-tag>
                </template>
                <template v-if="column.key === 'createdAt'">
                  {{ formatDate(record.created_at) }}
                </template>
                <template v-if="column.key === 'action'">
                  <a-button type="link" size="small" @click="downloadVersion(record)">下载</a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="ratings" tab="评分反馈">
            <!-- 评分提交 -->
            <a-card size="small" title="我的评分" style="margin-bottom: 16px">
              <div class="my-rating">
                <a-rate v-model:value="myRating" :count="5" />
                <span style="margin-left: 8px; color: #8c8c8c">{{ myRating }} 分</span>
                <a-button type="primary" size="small" :disabled="!myRating" @click="submitRating" style="margin-left: 16px">
                  提交评分
                </a-button>
              </div>
            </a-card>

            <!-- 反馈提交 -->
            <a-card size="small" title="提交反馈" style="margin-bottom: 16px">
              <a-textarea v-model:value="myFeedback" :rows="3" placeholder="请输入您的使用反馈..." />
              <a-button type="primary" size="small" :disabled="!myFeedback.trim()" @click="submitFeedback" style="margin-top: 8px">
                提交反馈
              </a-button>
            </a-card>

            <!-- 反馈列表 -->
            <a-list :dataSource="feedbacks" item-layout="horizontal" :pagination="{ pageSize: 5 }">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #title>
                      <span>{{ item.user?.real_name || item.user?.username || '-' }}</span>
                      <a-rate :value="item.rating" disabled :count="5" style="margin-left: 8px; font-size: 12px" />
                      <a-tag v-if="item.is_invalid" color="red" style="margin-left: 8px">无效反馈</a-tag>
                    </template>
                    <template #description>
                      <div>{{ item.content }}</div>
                      <div style="color: #8c8c8c; font-size: 12px; margin-top: 4px">{{ formatDate(item.created_at) }}</div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-tab-pane>

          <a-tab-pane key="projects" tab="关联项目">
            <a-table :dataSource="relatedProjects" :columns="projectColumns" :pagination="false" row-key="id" size="middle">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'ownerName'">
                  {{ record.owner?.real_name || '-' }}
                </template>
                <template v-if="column.key === 'action'">
                  <a-button type="link" size="small" @click="$router.push(`/admin/projects/${record.id}/members`)">查看</a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined, ApartmentOutlined, TagOutlined, LinkOutlined, DownloadOutlined,
} from '@ant-design/icons-vue'
import { getSkillDetail, downloadSkill } from '../../api/skill'
import { submitRating as submitRatingApi, getSkillRatings } from '../../api/rating'
import { submitFeedback as submitFeedbackApi, getSkillFeedbacks } from '../../api/feedback'
import { sanitizeHtml } from '../../utils/sanitize'

const route = useRoute()
const skillId = Number(route.params.id)
const loading = ref(true)
const skill = ref<any>(null)
const versions = ref<any[]>([])
const feedbacks = ref<any[]>([])
const relatedProjects = ref<any[]>([])
const activeTab = ref('detail')
const selectedVersion = ref<number | undefined>(undefined)
const myRating = ref(0)
const myFeedback = ref('')

const versionColumns = [
  { title: '版本号', key: 'version', dataIndex: 'version_number' },
  { title: '更新说明', key: 'changeLog', dataIndex: 'change_log' },
  { title: '提交时间', key: 'createdAt' },
  { title: '操作', key: 'action', width: 80 },
]

const projectColumns = [
  { title: '项目名称', key: 'name', dataIndex: 'name' },
  { title: '项目负责人', key: 'ownerName' },
  { title: '操作', key: 'action', width: 80 },
]

onMounted(async () => {
  await loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    const res = await getSkillDetail(skillId)
    skill.value = res.data
    versions.value = res.data?.versions || []
    feedbacks.value = res.data?.feedbacks || []
    relatedProjects.value = res.data?.projects || []
    if (versions.value.length > 0) {
      selectedVersion.value = versions.value[0].id
    }
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
}

async function handleDownload() {
  if (!selectedVersion.value) return
  try {
    await downloadSkill(skillId, selectedVersion.value)
    message.success('下载成功')
    loadDetail()
  } catch {
    message.error('下载失败')
  }
}

async function downloadVersion(record: any) {
  try {
    await downloadSkill(skillId, record.id)
    message.success('下载成功')
  } catch {
    message.error('下载失败')
  }
}

async function submitRating() {
  if (!myRating.value) return
  try {
    await submitRatingApi({ skill_id: skillId, version_id: selectedVersion.value, score: myRating.value })
    message.success('评分成功')
    myRating.value = 0
    loadDetail()
  } catch {
    message.error('评分失败')
  }
}

async function submitFeedback() {
  if (!myFeedback.value.trim()) return
  try {
    await submitFeedbackApi({ skill_id: skillId, content: myFeedback.value })
    message.success('反馈提交成功')
    myFeedback.value = ''
    loadDetail()
  } catch {
    message.error('反馈提交失败')
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.skill-detail {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-header {
  border-radius: 12px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.skill-title {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin: 0;
}

.skill-summary {
  color: #595959;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.skill-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #8c8c8c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-box {
  text-align: center;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 12px;
}

.rating-score {
  font-size: 36px;
  font-weight: 700;
  color: #faad14;
  line-height: 1;
  margin-bottom: 8px;
}

.rating-count {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.download-box {
  padding: 16px;
  background: #f6f8fa;
  border-radius: 12px;
}

.detail-content {
  border-radius: 12px;
}

.detail-text {
  font-size: 14px;
  line-height: 1.8;
  color: #262626;
}

.my-rating {
  display: flex;
  align-items: center;
}
</style>
