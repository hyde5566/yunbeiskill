<template>
  <div class="my-downloads">
    <a-card :bordered="false" class="list-card" title="我的下载记录">
      <a-table
        :dataSource="downloads"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'source'">
            {{ record.skillSource === 'internal' ? '内部自研' : '外部平台' }}
          </template>
          <template v-if="column.key === 'hasNewVersion'">
            <a-tag v-if="record.hasNewVersion" color="warning">有新版本</a-tag>
            <span v-else style="color: #8c8c8c">-</span>
          </template>
          <template v-if="column.key === 'downloadedAt'">
            {{ formatDate(record.downloadedAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="goDetail(record.skillId)">查看</a-button>
              <a-button type="link" size="small" @click="handleRedownload(record)">重新下载</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getMyDownloads, downloadSkill } from '../../api/download'

const router = useRouter()
const loading = ref(false)
const downloads = ref<any[]>([])

const columns = [
  { title: 'Skill名称', dataIndex: 'skillName', key: 'skillName', ellipsis: true },
  { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
  { title: '来源', key: 'source', width: 100 },
  { title: '下载版本', dataIndex: 'version', key: 'version', width: 100 },
  { title: '新版本提示', key: 'hasNewVersion', width: 110 },
  { title: '下载时间', key: 'downloadedAt', width: 160 },
  { title: '操作', key: 'action', width: 140 },
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
    const res = await getMyDownloads({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    downloads.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function goDetail(skillId: number) {
  router.push(`/skill/detail/${skillId}`)
}

async function handleRedownload(record: any) {
  try {
    await downloadSkill(record.skillId, record.latestVersionId)
    message.success('下载成功')
  } catch {
    message.error('下载失败')
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.my-downloads {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-card {
  border-radius: 12px;
}
</style>
