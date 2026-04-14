<template>
  <div class="review-detail">
    <a-spin :spinning="loading">
      <template v-if="review">
        <!-- Skill 信息 -->
        <a-card :bordered="false" class="info-card" title="Skill信息">
          <a-descriptions :column="2" bordered size="middle">
            <a-descriptions-item label="名称">{{ review.skill?.name || '-' }}</a-descriptions-item>
            <a-descriptions-item label="作者">{{ review.skill?.author || '-' }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ review.skill?.category?.name || '-' }}</a-descriptions-item>
            <a-descriptions-item label="来源">{{ review.skill?.source_type === 'internal' ? '内部自研' : '外部平台' }}</a-descriptions-item>
            <a-descriptions-item label="简介" :span="2">{{ review.skill?.summary || '-' }}</a-descriptions-item>
            <a-descriptions-item label="详细说明" :span="2">
              <div v-html="review.skill?.detail || '无'"></div>
            </a-descriptions-item>
            <a-descriptions-item label="版本号">{{ review.version?.version_number || '-' }}</a-descriptions-item>
            <a-descriptions-item label="提交人">{{ review.skill?.submitter?.real_name || '-' }}</a-descriptions-item>
            <a-descriptions-item label="提交时间">{{ formatDate(review.created_at) }}</a-descriptions-item>
            <a-descriptions-item label="更新说明">{{ review.version?.change_log || '无' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 审核操作 -->
        <a-card
          v-if="review.status === 'pending' || review.status === 'reviewing'"
          :bordered="false"
          class="action-card"
          style="margin-top: 16px"
          title="审核操作"
        >
          <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="审核意见">
              <a-textarea v-model:value="comment" :rows="4" placeholder="请输入审核意见" />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 3, span: 18 }">
              <a-space>
                <a-button type="primary" @click="handleReview('approved')" :loading="submitting">
                  <CheckOutlined /> 通过
                </a-button>
                <a-button danger @click="handleReview('rejected')" :loading="submitting">
                  <CloseOutlined /> 驳回
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 审核记录 -->
        <a-card :bordered="false" class="history-card" style="margin-top: 16px" title="审核记录">
          <a-timeline>
            <a-timeline-item v-for="item in reviewHistory" :key="item.id" :color="getStatusColor(item.status)">
              <div class="timeline-item">
                <div class="timeline-header">
                  <span class="reviewer">{{ item.reviewer?.real_name || '待分配' }}</span>
                  <a-tag :color="getStatusColor(item.status)" size="small">{{ getStatusText(item.status) }}</a-tag>
                  <span class="time">{{ formatDate(item.created_at) }}</span>
                </div>
                <div v-if="item.comment" class="timeline-comment">{{ item.comment }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <a-empty v-if="reviewHistory.length === 0" description="暂无审核记录" />
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { getReviewDetail, approveReview, rejectReview } from '../../api/review'
import { sanitizeHtml } from '../../utils/sanitize'

const route = useRoute()
const router = useRouter()
const reviewId = Number(route.params.id)
const loading = ref(true)
const submitting = ref(false)
const review = ref<any>(null)
const reviewHistory = ref<any[]>([])
const comment = ref('')

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getReviewDetail(reviewId)
    review.value = res.data
    reviewHistory.value = res.data?.history || []
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
}

async function handleReview(status: string) {
  submitting.value = true
  try {
    if (status === 'approved') {
      await approveReview(reviewId, { comment: comment.value })
      message.success('审核通过')
    } else {
      if (!comment.value.trim()) {
        message.warning('驳回时请填写审核意见')
        return
      }
      await rejectReview(reviewId, { comment: comment.value })
      message.success('已驳回')
    }
    router.push('/review/pending')
  } catch {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'default',
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error',
  }
  return map[status] || 'default'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '通过',
    rejected: '驳回',
  }
  return map[status] || status
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.review-detail {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-card,
.action-card,
.history-card {
  border-radius: 12px;
}

.timeline-item {
  padding: 4px 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer {
  font-weight: 500;
  color: #262626;
}

.time {
  color: #8c8c8c;
  font-size: 12px;
}

.timeline-comment {
  margin-top: 4px;
  color: #595959;
  font-size: 13px;
  line-height: 1.6;
  padding: 8px 12px;
  background: #f6f8fa;
  border-radius: 6px;
}
</style>
