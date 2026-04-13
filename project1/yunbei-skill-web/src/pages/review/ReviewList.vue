<template>
  <div class="review-list">
    <a-card title="审核管理">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="pending" tab="待审核Skill">
          <a-table
            :columns="columns"
            :data-source="pendingList"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            rowKey="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a @click="handleDetail(record)">{{ record.name }}</a>
              </template>
              <template v-if="column.key === 'category'">
                <span>{{ record.category?.name || '-' }}</span>
              </template>
              <template v-if="column.key === 'sourceType'">
                <a-tag :color="record.sourceType === 'internal' ? 'blue' : 'orange'">
                  {{ record.sourceType === 'internal' ? '内部自研' : '外部平台' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-tag color="orange">{{ getStatusText(record.status) }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="primary" size="small" @click="handleApprove(record)">通过</a-button>
                  <a-button danger size="small" @click="showRejectModal(record)">驳回</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="pendingVersion" tab="待审核版本">
          <a-table
            :columns="versionColumns"
            :data-source="pendingVersionList"
            :loading="loadingVersion"
            :pagination="versionPagination"
            @change="handleVersionTableChange"
            rowKey="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'skillName'">
                <a @click="handleDetail(record.skill)">{{ record.skill?.name }}</a>
              </template>
              <template v-if="column.key === 'category'">
                <span>{{ record.skill?.category?.name || '-' }}</span>
              </template>
              <template v-if="column.key === 'version'">
                <span>{{ record.versionNumber }}</span>
              </template>
              <template v-if="column.key === 'uploader'">
                <span>{{ record.uploader?.realName || '-' }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="primary" size="small" @click="handleApproveVersion(record)">通过</a-button>
                  <a-button danger size="small" @click="showRejectVersionModal(record)">驳回</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="approved" tab="已通过（待发布）">
          <a-table
            :columns="approvedColumns"
            :data-source="approvedList"
            :loading="loadingApproved"
            rowKey="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a @click="handleDetail(record)">{{ record.name }}</a>
              </template>
              <template v-if="column.key === 'category'">
                <span>{{ record.category?.name || '-' }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="primary" size="small" @click="handlePublish(record)" v-if="isAdmin">发布</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="published" tab="已发布">
          <a-table
            :columns="publishedColumns"
            :data-source="publishedList"
            :loading="loadingPublished"
            rowKey="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a @click="handleDetail(record)">{{ record.name }}</a>
              </template>
              <template v-if="column.key === 'category'">
                <span>{{ record.category?.name || '-' }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button danger size="small" @click="handleUnpublish(record)" v-if="isAdmin">下架</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="rejected" tab="已驳回">
          <a-table
            :columns="columns"
            :data-source="rejectedList"
            :loading="loadingRejected"
            rowKey="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a @click="handleDetail(record)">{{ record.name }}</a>
              </template>
              <template v-if="column.key === 'category'">
                <span>{{ record.category?.name || '-' }}</span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 驳回原因弹窗 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="驳回原因"
      @ok="handleReject"
      @cancel="rejectModalVisible = false"
    >
      <a-input v-model:value="rejectReason" placeholder="请输入驳回原因" />
    </a-modal>

    <!-- 版本驳回原因弹窗 -->
    <a-modal
      v-model:open="rejectVersionModalVisible"
      title="驳回版本原因"
      @ok="handleRejectVersion"
      @cancel="rejectVersionModalVisible = false"
    >
      <a-input v-model:value="rejectVersionReason" placeholder="请输入驳回原因" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getSkillList, approveSkill, rejectSkill, publishSkill, unpublishSkill, getPendingVersions, approveVersion, rejectVersion } from '@/api/skill'
import type { Skill, SkillVersion } from '@/api/skill'
import { storage } from '@/utils/storage'

const router = useRouter()

const columns = [
  { title: 'Skill名称', dataIndex: 'name', key: 'name' },
  { title: '简介', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '分类', key: 'category', width: 120 },
  { title: '来源', key: 'sourceType', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '提交人', dataIndex: ['submitter', 'realName'], key: 'submitter', width: 100 },
  { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

const approvedColumns = [
  { title: 'Skill名称', dataIndex: 'name', key: 'name' },
  { title: '简介', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '分类', key: 'category', width: 120 },
  { title: '提交人', dataIndex: ['submitter', 'realName'], key: 'submitter', width: 100 },
  { title: '审核时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

const publishedColumns = [
  { title: 'Skill名称', dataIndex: 'name', key: 'name' },
  { title: '简介', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '分类', key: 'category', width: 120 },
  { title: '提交人', dataIndex: ['submitter', 'realName'], key: 'submitter', width: 100 },
  { title: '发布时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

const versionColumns = [
  { title: 'Skill名称', key: 'skillName', width: 200 },
  { title: '分类', key: 'category', width: 120 },
  { title: '版本号', key: 'version', width: 100 },
  { title: '更新说明', dataIndex: 'changeLog', key: 'changeLog', ellipsis: true },
  { title: '上传人', key: 'uploader', width: 100 },
  { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

const activeTab = ref('pending')
const pendingList = ref<Skill[]>([])
const approvedList = ref<Skill[]>([])
const publishedList = ref<Skill[]>([])
const rejectedList = ref<Skill[]>([])
const pendingVersionList = ref<SkillVersion[]>([])
const loading = ref(false)
const loadingApproved = ref(false)
const loadingPublished = ref(false)
const loadingRejected = ref(false)
const loadingVersion = ref(false)

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const versionPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const rejectModalVisible = ref(false)
const rejectReason = ref('')
const currentSkill = ref<Skill | null>(null)

const rejectVersionModalVisible = ref(false)
const rejectVersionReason = ref('')
const currentVersion = ref<SkillVersion | null>(null)

const isAdmin = ref(false)

onMounted(() => {
  loadUserInfo()
  loadData()
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

async function loadData() {
  if (activeTab.value === 'pending') {
    await loadPendingList()
  } else if (activeTab.value === 'pendingVersion') {
    await loadPendingVersionList()
  } else if (activeTab.value === 'approved') {
    await loadApprovedList()
  } else if (activeTab.value === 'published') {
    await loadPublishedList()
  } else if (activeTab.value === 'rejected') {
    await loadRejectedList()
  }
}

async function loadPendingList() {
  loading.value = true
  try {
    const res = await getSkillList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      status: 'pending_review'
    })
    pendingList.value = res.list
    pagination.value.total = res.total
  } finally {
    loading.value = false
  }
}

async function loadPendingVersionList() {
  loadingVersion.value = true
  try {
    const res = await getPendingVersions(versionPagination.value.current, versionPagination.value.pageSize)
    pendingVersionList.value = res.list
    versionPagination.value.total = res.total
  } finally {
    loadingVersion.value = false
  }
}

async function loadApprovedList() {
  loadingApproved.value = true
  try {
    const res = await getSkillList({
      page: 1,
      pageSize: 100,
      status: 'approved'
    })
    approvedList.value = res.list
  } finally {
    loadingApproved.value = false
  }
}

async function loadPublishedList() {
  loadingPublished.value = true
  try {
    const res = await getSkillList({
      page: 1,
      pageSize: 100,
      status: 'published'
    })
    publishedList.value = res.list
  } finally {
    loadingPublished.value = false
  }
}

async function loadRejectedList() {
  loadingRejected.value = true
  try {
    const res = await getSkillList({
      page: 1,
      pageSize: 100,
      status: 'rejected'
    })
    rejectedList.value = res.list
  } finally {
    loadingRejected.value = false
  }
}

watch(activeTab, () => {
  loadData()
})

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadPendingList()
}

function handleVersionTableChange(pag: any) {
  versionPagination.value.current = pag.current
  versionPagination.value.pageSize = pag.pageSize
  loadPendingVersionList()
}

function handleDetail(record: Skill) {
  router.push(`/skill/${record.id}`)
}

async function handleApprove(record: Skill) {
  try {
    await approveSkill(record.id)
    message.success('审核通过')
    loadPendingList()
    if (activeTab.value === 'approved') {
      loadApprovedList()
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

function showRejectModal(record: Skill) {
  currentSkill.value = record
  rejectReason.value = ''
  rejectModalVisible.value = true
}

async function handleReject() {
  if (!rejectReason.value) {
    message.error('请输入驳回原因')
    return
  }
  if (!currentSkill.value) return

  try {
    await rejectSkill(currentSkill.value.id, rejectReason.value)
    message.success('已驳回')
    rejectModalVisible.value = false
    loadPendingList()
    if (activeTab.value === 'rejected') {
      loadRejectedList()
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

async function handlePublish(record: Skill) {
  try {
    await publishSkill(record.id)
    message.success('已发布')
    loadApprovedList()
    if (activeTab.value === 'published') {
      loadPublishedList()
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

async function handleUnpublish(record: Skill) {
  try {
    await unpublishSkill(record.id)
    message.success('已下架')
    loadPublishedList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 版本审核相关
async function handleApproveVersion(record: SkillVersion) {
  try {
    await approveVersion(record.skillId, record.id)
    message.success('版本审核通过')
    loadPendingVersionList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

function showRejectVersionModal(record: SkillVersion) {
  currentVersion.value = record
  rejectVersionReason.value = ''
  rejectVersionModalVisible.value = true
}

async function handleRejectVersion() {
  if (!rejectVersionReason.value) {
    message.error('请输入驳回原因')
    return
  }
  if (!currentVersion.value) return

  try {
    await rejectVersion(currentVersion.value.skillId, currentVersion.value.id, rejectVersionReason.value)
    message.success('版本已驳回')
    rejectVersionModalVisible.value = false
    loadPendingVersionList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
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
.review-list {
  background: #fff;
}
</style>