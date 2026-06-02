<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getDashboardOverview, getPlanProgress, getRecaptureTrend, getWaterWarnings } from '@/api/dashboard'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

interface OverviewData {
  todayRelease: number
  monthRecapture: number
  activeAreas: number
  warningCount: number
}

interface PlanItem {
  planName: string
  progress: number
}

interface TrendSeries {
  name: string
  data: number[]
}

interface TrendData {
  months: string[]
  series: TrendSeries[]
}

interface WaterWarning {
  areaName: string
  salinity: number
  temperature: number
  dissolvedOxygen: number
  warningLevel: 'normal' | 'caution' | 'warning'
}

const overview = ref<OverviewData>({
  todayRelease: 0,
  monthRecapture: 0,
  activeAreas: 0,
  warningCount: 0,
})

const planList = ref<PlanItem[]>([])
const trendData = ref<TrendData>({ months: [], series: [] })
const warnings = ref<WaterWarning[]>([])

const overviewCards = computed(() => [
  {
    key: 'todayRelease',
    label: '今日投放量',
    value: overview.value.todayRelease,
    unit: '尾',
    icon: 'Odometer',
    gradient: 'linear-gradient(135deg, #0A2647 0%, #144272 100%)',
  },
  {
    key: 'monthRecapture',
    label: '本月回捕量',
    value: overview.value.monthRecapture,
    unit: 'kg',
    icon: 'Fish',
    gradient: 'linear-gradient(135deg, #2C7865 0%, #3DA589 100%)',
  },
  {
    key: 'activeAreas',
    label: '活跃海域',
    value: overview.value.activeAreas,
    unit: '个',
    icon: 'MapLocation',
    gradient: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
  },
  {
    key: 'warningCount',
    label: '预警数',
    value: overview.value.warningCount,
    unit: '条',
    icon: 'Warning',
    gradient: 'linear-gradient(135deg, #E76F51 0%, #F4A261 100%)',
  },
])

const progressColor = (progress: number) => {
  if (progress > 80) return '#2C7865'
  if (progress >= 50) return '#144272'
  return '#E76F51'
}

const trendChartOption = computed(() => {
  const colors = ['#0A2647', '#2C7865', '#E76F51', '#14A3A8', '#F4A261']
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>${p.seriesName}: ${p.value}%</div>`
        })
        return html
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B' },
    },
    grid: {
      top: 20,
      right: 20,
      bottom: 40,
      left: 50,
    },
    xAxis: {
      type: 'category' as const,
      data: trendData.value.months,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#64748B', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#F0F4F8' } },
    },
    series: trendData.value.series.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: colors[i % colors.length] },
      itemStyle: { color: colors[i % colors.length] },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: colors[i % colors.length] + '30' },
            { offset: 1, color: colors[i % colors.length] + '05' },
          ],
        },
      },
      data: s.data,
    })),
  }
})

const warningLevelConfig: Record<string, { label: string; bg: string; border: string; color: string }> = {
  normal: { label: '正常', bg: '#F0FFF4', border: '#C6F6D5', color: '#2C7865' },
  caution: { label: '注意', bg: '#FFFFF0', border: '#FEFCBF', color: '#D69E2E' },
  warning: { label: '预警', bg: '#FFF5F5', border: '#FED7D7', color: '#E76F51' },
}

onMounted(async () => {
  try {
    const [overviewRes, planRes, trendRes, warningsRes] = await Promise.all([
      getDashboardOverview(),
      getPlanProgress(),
      getRecaptureTrend(),
      getWaterWarnings(),
    ])
    if (overviewRes.data) overview.value = overviewRes.data
    if (planRes.data) planList.value = planRes.data
    if (trendRes.data) trendData.value = trendRes.data
    if (warningsRes.data) warnings.value = warningsRes.data
  } catch {}
})
</script>

<template>
  <div class="dashboard-page">
    <el-row :gutter="20" class="overview-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="card in overviewCards" :key="card.key">
        <div class="overview-card" :style="{ background: card.gradient }">
          <div class="overview-card__body">
            <div class="overview-card__info">
              <span class="overview-card__label">{{ card.label }}</span>
              <span class="overview-card__value">{{ card.value.toLocaleString() }}</span>
              <span class="overview-card__unit">{{ card.unit }}</span>
            </div>
            <el-icon class="overview-card__icon" :size="48">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="14">
        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">投放计划进度</span>
          </div>
          <div class="section-card__body">
            <div v-for="plan in planList" :key="plan.planName" class="plan-item">
              <div class="plan-item__top">
                <span class="plan-item__name">{{ plan.planName }}</span>
                <span class="plan-item__percent" :style="{ color: progressColor(plan.progress) }">
                  {{ plan.progress }}%
                </span>
              </div>
              <el-progress
                :percentage="plan.progress"
                :stroke-width="10"
                :color="progressColor(plan.progress)"
                :show-text="false"
              />
            </div>
            <el-empty v-if="planList.length === 0" description="暂无投放计划" :image-size="80" />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="10">
        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">回捕率趋势图</span>
          </div>
          <div class="section-card__body chart-body">
            <VChart v-if="trendData.series.length" :option="trendChartOption" autoresize class="trend-chart" />
            <el-empty v-else description="暂无趋势数据" :image-size="80" />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">水质预警</span>
          </div>
          <div class="section-card__body">
            <div class="warning-grid" v-if="warnings.length">
              <div
                v-for="w in warnings"
                :key="w.areaName"
                class="warning-card"
                :style="{
                  background: warningLevelConfig[w.warningLevel].bg,
                  borderColor: warningLevelConfig[w.warningLevel].border,
                }"
              >
                <div class="warning-card__header">
                  <span class="warning-card__area">{{ w.areaName }}</span>
                  <span
                    class="warning-card__badge"
                    :style="{
                      background: warningLevelConfig[w.warningLevel].color + '18',
                      color: warningLevelConfig[w.warningLevel].color,
                    }"
                  >
                    {{ warningLevelConfig[w.warningLevel].label }}
                  </span>
                </div>
                <div class="warning-card__metrics">
                  <div class="warning-card__metric">
                    <span class="warning-card__metric-label">盐度</span>
                    <span class="warning-card__metric-value">{{ w.salinity }}‰</span>
                  </div>
                  <div class="warning-card__metric">
                    <span class="warning-card__metric-label">水温</span>
                    <span class="warning-card__metric-value">{{ w.temperature }}℃</span>
                  </div>
                  <div class="warning-card__metric">
                    <span class="warning-card__metric-label">溶氧</span>
                    <span class="warning-card__metric-value">{{ w.dissolvedOxygen }}mg/L</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无水质预警" :image-size="80" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 4px;
}

.overview-row {
  margin-bottom: 20px;
}

.overview-card {
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: default;
  overflow: hidden;
  position: relative;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.overview-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.overview-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-card__label {
  font-size: 14px;
  opacity: 0.85;
  letter-spacing: 0.5px;
}

.overview-card__value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.overview-card__unit {
  font-size: 13px;
  opacity: 0.7;
}

.overview-card__icon {
  opacity: 0.3;
}

.content-row {
  margin-bottom: 20px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-card__header {
  padding: 16px 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #0A2647;
  position: relative;
  padding-left: 12px;
}

.section-card__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #0A2647, #2C7865);
}

.section-card__body {
  padding: 16px 20px 20px;
}

.chart-body {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-chart {
  width: 100%;
  height: 300px;
}

.plan-item {
  margin-bottom: 16px;
}

.plan-item:last-child {
  margin-bottom: 0;
}

.plan-item__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.plan-item__name {
  font-size: 14px;
  color: #1A202C;
}

.plan-item__percent {
  font-size: 14px;
  font-weight: 600;
}

.warning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.warning-card {
  border: 1px solid;
  border-radius: 10px;
  padding: 16px;
  transition: transform 0.2s ease;
}

.warning-card:hover {
  transform: translateY(-2px);
}

.warning-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.warning-card__area {
  font-size: 15px;
  font-weight: 600;
  color: #1A202C;
}

.warning-card__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
}

.warning-card__metrics {
  display: flex;
  gap: 12px;
}

.warning-card__metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.warning-card__metric-label {
  font-size: 12px;
  color: #64748B;
}

.warning-card__metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
}
</style>
