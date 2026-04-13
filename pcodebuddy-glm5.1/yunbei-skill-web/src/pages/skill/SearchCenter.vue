<template>
  <div class="search-center">
    <a-card :bordered="false" class="search-bar">
      <a-row :gutter="16" align="middle">
        <a-col :span="10">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索Skill名称、作者、描述..."
            size="large"
            allow-clear
            @search="loadSkills"
          />
        </a-col>
        <a-col :span="5">
          <a-select
            v-model:value="searchCategory"
            placeholder="全部分类"
            allow-clear
            size="large"
            style="width: 100%"
            @change="loadSkills"
          >
            <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select
            v-model:value="searchSource"
            placeholder="全部来源"
            allow-clear
            size="large"
            style="width: 100%"
            @change="loadSkills"
          >
            <a-select-option value="internal">内部自研</a-select-option>
            <a-select-option value="external">外部平台</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" size="large" block @click="loadSkills">搜索</a-button>
        </a-col>
      </a-row>
    </a-card>

    <div class="skill-list">
      <a-spin :spinning="loading">
        <a-empty v-if="!loading && skills.length === 0" description="暂无Skill" />
        <div v-else class="skill-cards">
          <a-card
            v-for="skill in skills"
            :key="skill.id"
            class="skill-card"
            hoverable
            @click="goDetail(skill.id)"
          >
            <div class="skill-card-body">
              <div class="skill-header">
                <h3 class="skill-name">{{ skill.name }}</h3>
                <a-tag :color="skill.source === 'internal' ? 'blue' : 'green'">
                  {{ skill.source === 'internal' ? '内部自研' : '外部平台' }}
                </a-tag>
              </div>
              <p class="skill-summary">{{ skill.summary || '暂无简介' }}</p>
              <div class="skill-meta">
                <span class="meta-item">
                  <UserOutlined /> {{ skill.author || '未知' }}
                </span>
                <span class="meta-item">
                  <a-tag color="processing" size="small">{{ skill.categoryName }}</a-tag>
                </span>
                <span class="meta-item">
                  <StarFilled style="color: #faad14" /> {{ skill.avgRating?.toFixed(1) || '-' }}
                </span>
                <span class="meta-item">
                  <DownloadOutlined /> {{ skill.downloadCount || 0 }}
                </span>
                <span class="meta-item version">
                  v{{ skill.latestVersion || '1.0.0' }}
                </span>
              </div>
            </div>
          </a-card>
        </div>
        <div class="pagination-wrap">
          <a-pagination
            v-model:current="pagination.page"
            v-model:pageSize="pagination.pageSize"
            :total="pagination.total"
            show-size-changer
            show-quick-jumper
            :show-total="(total: number) => `共 ${total} 条`"
            @change="loadSkills"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, StarFilled, DownloadOutlined } from '@ant-design/icons-vue'
import { searchSkills } from '../../api/skill'
import { getSkillCategories } from '../../api/skill-category'

const router = useRouter()
const loading = ref(false)
const skills = ref<any[]>([])
const categories = ref<any[]>([])
const searchKeyword = ref('')
const searchCategory = ref<number | undefined>(undefined)
const searchSource = ref<string | undefined>(undefined)

const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
})

onMounted(async () => {
  await loadCategories()
  await loadSkills()
})

async function loadCategories() {
  try {
    const res = await getSkillCategories()
    categories.value = res.data || []
  } catch { /* ignore */ }
}

async function loadSkills() {
  loading.value = true
  try {
    const res = await searchSkills({
      keyword: searchKeyword.value || undefined,
      category_id: searchCategory.value,
      source_type: searchSource.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    skills.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch { /* ignore */ }
  finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  router.push(`/skill/detail/${id}`)
}
</script>

<style scoped>
.search-center {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-bar {
  border-radius: 12px;
  margin-bottom: 16px;
}

.skill-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skill-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.skill-card-body {
  padding: 4px 0;
}

.skill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.skill-summary {
  color: #595959;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skill-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.version {
  margin-left: auto;
  color: #1890ff;
  font-weight: 500;
}

.pagination-wrap {
  margin-top: 24px;
  text-align: center;
}
</style>
