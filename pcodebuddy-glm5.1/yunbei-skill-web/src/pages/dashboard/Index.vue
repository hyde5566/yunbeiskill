<template>
  <div class="dashboard-page">
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="item in statCards" :key="item.title">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-card-inner">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
            <div class="stat-icon" :style="{ background: item.color }">
              <component :is="item.icon" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :span="16">
        <a-card title="Skill分类分布" :bordered="false">
          <v-chart :option="categoryChartOption" style="height: 360px" autoresize />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="最近动态" :bordered="false">
          <a-list :data-source="recentActivities" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>{{ item.title }}</template>
                  <template #description>{{ item.time }}</template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="下载趋势（近7天）" :bordered="false">
          <v-chart :option="downloadTrendOption" style="height: 300px" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="热门Skill Top5" :bordered="false">
          <a-table
            :data-source="topSkills"
            :columns="topSkillColumns"
            :pagination="false"
            size="small"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppstoreOutlined, DownloadOutlined, UserOutlined, StarOutlined } from '@ant-design/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { getDashboardStats } from '../../api/statistics'

use([CanvasRenderer, BarChart, PieChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const statCards = ref([
  { title: 'Skill总数', value: 0, icon: AppstoreOutlined, color: 'linear-gradient(135deg, #1890ff, #096dd9)' },
  { title: '总下载量', value: 0, icon: DownloadOutlined, color: 'linear-gradient(135deg, #52c41a, #389e0d)' },
  { title: '用户总数', value: 0, icon: UserOutlined, color: 'linear-gradient(135deg, #722ed1, #531dab)' },
  { title: '评分总数', value: 0, icon: StarOutlined, color: 'linear-gradient(135deg, #faad14, #d48806)' },
])

const categoryChartOption = ref({})
const downloadTrendOption = ref({})
const recentActivities = ref<any[]>([])
const topSkills = ref<any[]>([])

const topSkillColumns = [
  { title: '排名', dataIndex: 'rank', width: 60 },
  { title: 'Skill名称', dataIndex: 'name' },
  { title: '下载量', dataIndex: 'downloadCount', width: 100 },
  { title: '评分', dataIndex: 'avgRating', width: 80 },
]

onMounted(async () => {
  try {
    const res = await getDashboardStats()
    const data = res.data
    statCards.value[0].value = data.totalSkills || 0
    statCards.value[1].value = data.totalDownloads || 0
    statCards.value[2].value = data.totalUsers || 0
    statCards.value[3].value = data.totalRatings || 0

    // 分类分布饼图
    categoryChartOption.value = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%' },
        data: data.categoryDistribution || [],
      }],
    }

    // 下载趋势
    downloadTrendOption.value = {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, bottom: 30, top: 20 },
      xAxis: { type: 'category', data: data.downloadTrend?.dates || [] },
      yAxis: { type: 'value' },
      series: [{
        type: 'line',
        data: data.downloadTrend?.counts || [],
        smooth: true,
        areaStyle: { opacity: 0.15 },
        lineStyle: { color: '#1890ff', width: 3 },
        itemStyle: { color: '#1890ff' },
      }],
    }

    recentActivities.value = data.recentActivities || []
    topSkills.value = (data.topSkills || []).map((s: any, i: number) => ({ ...s, rank: i + 1 }))
  } catch {
    // 静默处理
  }
})
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-title {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
</style>
