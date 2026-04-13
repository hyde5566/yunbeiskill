<template>
  <div class="statistics-page">
    <!-- 概览卡片 -->
    <a-row :gutter="16" class="overview-cards">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-blue">
          <a-statistic title="Skill总数" :value="overview.totalSkills" />
          <div class="stat-icon"><AppstoreOutlined /></div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-green">
          <a-statistic title="总下载量" :value="overview.totalDownloads" />
          <div class="stat-icon"><DownloadOutlined /></div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-orange">
          <a-statistic title="用户数" :value="overview.totalUsers" />
          <div class="stat-icon"><UserOutlined /></div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card stat-purple">
          <a-statistic title="评分总数" :value="overview.totalRatings" />
          <div class="stat-icon"><StarOutlined /></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" class="chart-card" title="各分类Skill数量">
          <v-chart :option="categoryChartOption" style="height: 320px" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="chart-card" title="下载量Top10">
          <v-chart :option="downloadChartOption" style="height: 320px" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card :bordered="false" class="chart-card" title="评分分布">
          <v-chart :option="ratingChartOption" style="height: 320px" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="chart-card" title="月度下载趋势">
          <v-chart :option="trendChartOption" style="height: 320px" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <!-- 导出 -->
    <a-card :bordered="false" class="export-card" style="margin-top: 16px" title="数据导出">
      <a-space>
        <a-button @click="handleExport('skills')">导出Skill统计</a-button>
        <a-button @click="handleExport('downloads')">导出下载统计</a-button>
        <a-button @click="handleExport('ratings')">导出评分统计</a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined, DownloadOutlined, UserOutlined, StarOutlined,
} from '@ant-design/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
} from 'echarts/components'
import { getOverviewStats, getCategoryStats, getTopDownloads, getRatingDistribution, getDownloadTrend, exportStats } from '../../api/statistics'

use([CanvasRenderer, BarChart, PieChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const overview = ref({
  totalSkills: 0,
  totalDownloads: 0,
  totalUsers: 0,
  totalRatings: 0,
})

const categoryChartOption = ref<any>({})
const downloadChartOption = ref<any>({})
const ratingChartOption = ref<any>({})
const trendChartOption = ref<any>({})

onMounted(() => {
  loadOverview()
  loadCategoryChart()
  loadDownloadChart()
  loadRatingChart()
  loadTrendChart()
})

async function loadOverview() {
  try {
    const res = await getOverviewStats()
    overview.value = res.data || overview.value
  } catch { /* ignore */ }
}

async function loadCategoryChart() {
  try {
    const res = await getCategoryStats()
    const data = res.data || []
    categoryChartOption.value = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.map((d: any) => d.name), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: data.map((d: any) => d.count),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#69c0ff' }],
          },
          borderRadius: [4, 4, 0, 0],
        },
      }],
    }
  } catch { /* ignore */ }
}

async function loadDownloadChart() {
  try {
    const res = await getTopDownloads()
    const data = res.data || []
    downloadChartOption.value = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: data.map((d: any) => d.name).reverse(), axisLabel: { width: 100, overflow: 'truncate' } },
      series: [{
        type: 'bar',
        data: data.map((d: any) => d.count).reverse(),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: '#52c41a' }, { offset: 1, color: '#95de64' }],
          },
          borderRadius: [0, 4, 4, 0],
        },
      }],
    }
  } catch { /* ignore */ }
}

async function loadRatingChart() {
  try {
    const res = await getRatingDistribution()
    const data = res.data || []
    const colors = ['#ff4d4f', '#faad14', '#faad14', '#52c41a', '#1890ff']
    ratingChartOption.value = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.map((d: any, i: number) => ({
          name: `${d.rating}分`,
          value: d.count,
          itemStyle: { color: colors[i] || '#1890ff' },
        })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
      }],
    }
  } catch { /* ignore */ }
}

async function loadTrendChart() {
  try {
    const res = await getDownloadTrend()
    const data = res.data || []
    trendChartOption.value = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.map((d: any) => d.month), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{
        type: 'line',
        data: data.map((d: any) => d.count),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(24,144,255,0.3)' }, { offset: 1, color: 'rgba(24,144,255,0.05)' }],
          },
        },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' },
      }],
    }
  } catch { /* ignore */ }
}

async function handleExport(type: string) {
  try {
    await exportStats(type)
    message.success('导出成功')
  } catch {
    message.error('导出失败')
  }
}
</script>

<style scoped>
.statistics-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.stat-card :deep(.ant-statistic-title) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.stat-card :deep(.ant-statistic-content-value) {
  color: #fff;
  font-size: 28px;
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  color: rgba(255, 255, 255, 0.25);
}

.stat-blue { background: linear-gradient(135deg, #1890ff, #096dd9); }
.stat-green { background: linear-gradient(135deg, #52c41a, #389e0d); }
.stat-orange { background: linear-gradient(135deg, #faad14, #d48806); }
.stat-purple { background: linear-gradient(135deg, #722ed1, #531dab); }

.chart-card {
  border-radius: 12px;
}

.export-card {
  border-radius: 12px;
}
</style>
