<template>
  <div class="my-downloads">
    <a-card title="我的下载历史">
      <a-table
        :columns="columns"
        :data-source="downloads"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'skill'">
            <a @click="handleDetail(record.skillId)">{{ record.skill?.name }}</a>
          </template>
          <template v-if="column.key === 'category'">
            <span>{{ record.skill?.category?.name || '-' }}</span>
          </template>
          <template v-if="column.key === 'version'">
            <a-space>
              <span>{{ record.version?.versionNumber }}</span>
              <a-tag color="orange" v-if="hasNewVersion(record)">有新版本</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="primary" size="small" @click="handleDetail(record.skillId)">查看详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyDownloads } from '@/api/download'
import type { DownloadRecord } from '@/api/download'

const router = useRouter()

const columns = [
  { title: 'Skill名称', key: 'skill', width: 200 },
  { title: '作者', dataIndex: ['skill', 'author'], key: 'author', width: 120 },
  { title: '分类', key: 'category', width: 100 },
  { title: '下载版本', key: 'version', width: 120 },
  { title: '下载时间', dataIndex: 'downloadedAt', key: 'downloadedAt', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

const downloads = ref<DownloadRecord[]>([])
const loading = ref(false)
const latestVersions = ref<Map<number, string>>(new Map())

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

onMounted(() => {
  loadDownloads()
})

async function loadDownloads() {
  loading.value = true
  try {
    const res = await getMyDownloads(pagination.value.current, pagination.value.pageSize)
    downloads.value = res.list
    pagination.value.total = res.total

    // 获取每个skill的最新版本号（简化：这里暂时不做额外查询）
    // 实际应该调用getSkillVersions获取每个skill的最新版本
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadDownloads()
}

function handleDetail(skillId: number) {
  router.push(`/skill/${skillId}`)
}

// 检查是否有新版本（简化实现，实际需要对比最新版本号）
function hasNewVersion(record: DownloadRecord): boolean {
  // 这里暂时返回false，实际应该查询skill的最新版本号与下载版本号对比
  return false
}
</script>

<style scoped>
.my-downloads {
  background: #fff;
}
</style>