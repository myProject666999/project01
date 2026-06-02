<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRecaptureAnalysis, getRecaptureTrend } from '@/api/recapture'
import { getSeaAreas } from '@/api/sea-area'
import { listAllSpecies } from '@/api/species'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

interface AnalysisItem {
  speciesName: string
  areaName: string
  planQuantity: number
  totalCatchWeight: number
  recaptureRate: number
  timeCoefficient: number
  adjustedRate: number
}

interface TrendSpecies {
  speciesName: string
  recaptureRate: number
}

interface TrendItem {
  month: string
  species: TrendSpecies[]
}

const filterYear = ref<number | string>('')
const filterAreaId = ref('')
const filterSpeciesId = ref('')

const analysisData = ref<AnalysisItem[]>([])
const trendData = ref<TrendItem[]>([])
const loading = ref(false)

const areaOptions = ref<any[]>([])
const speciesOptions = ref<any[]>([])

const fetchAreas = async () => {
  try {
    const res = await getSeaAreas({ page: 1, size: 1000 })
    if (res.data) areaOptions.value = res.data.records || []
  } catch {}
}

const fetchSpecies = async () => {
  try {
    const res = await listAllSpecies()
    if (res.data) speciesOptions.value = Array.isArray(res.data) ? res.data : res.data.records || []
  } catch {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (filterYear.value) params.year = filterYear.value
    if (filterAreaId.value) params.areaId = filterAreaId.value
    if (filterSpeciesId.value) params.speciesId = filterSpeciesId.value

    const [analysisRes, trendRes] = await Promise.all([
      getRecaptureAnalysis(params),
      getRecaptureTrend(params),
    ])

    if (analysisRes.data) {
      analysisData.value = Array.isArray(analysisRes.data) ? analysisRes.data : analysisRes.data.records || []
    }
    if (trendRes.data) {
      trendData.value = Array.isArray(trendRes.data) ? trendRes.data : []
    }
  } catch {
    ElMessage.error('获取回捕率分析数据失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  fetchData()
}

const recaptureRateColor = (rate: number) => {
  if (rate < 5) return '#E76F51'
  if (rate <= 15) return '#F4A261'
  return '#2C7865'
}

const chartOption = computed(() => {
  const speciesNames = analysisData.value.map((item) => item.speciesName)
  const planQuantities = analysisData.value.map((item) => item.planQuantity)
  const recaptureRates = analysisData.value.map((item) => item.recaptureRate)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) => {
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          const unit = p.seriesName === '投放量' ? '尾' : '%'
          html += `<div style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>${p.seriesName}: ${p.value}${unit}</div>`
        })
        return html
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B' },
    },
    grid: {
      top: 30,
      right: 60,
      bottom: 50,
      left: 60,
    },
    xAxis: {
      type: 'category' as const,
      data: speciesNames,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '投放量(尾)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#F0F4F8' } },
      },
      {
        type: 'value' as const,
        name: '回捕率(%)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B', formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '投放量',
        type: 'bar' as const,
        barWidth: '40%',
        itemStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0A2647' },
              { offset: 1, color: '#144272' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        data: planQuantities,
      },
      {
        name: '回捕率',
        type: 'line' as const,
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 2, color: '#E76F51' },
        itemStyle: { color: '#E76F51' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(231, 111, 81, 0.25)' },
              { offset: 1, color: 'rgba(231, 111, 81, 0.02)' },
            ],
          },
        },
        data: recaptureRates,
      },
    ],
  }
})

onMounted(() => {
  fetchAreas()
  fetchSpecies()
  fetchData()
})
</script>

<template>
  <div class="recapture-analysis-page">
    <div class="page-card">
      <div class="filter-bar">
        <el-date-picker
          v-model="filterYear"
          type="year"
          placeholder="选择年份"
          value-format="YYYY"
          style="width: 140px"
        />
        <el-select v-model="filterAreaId" placeholder="选择海域" clearable style="width: 160px">
          <el-option
            v-for="area in areaOptions"
            :key="area.id"
            :label="area.areaName"
            :value="area.id"
          />
        </el-select>
        <el-select v-model="filterSpeciesId" placeholder="选择物种" clearable style="width: 160px">
          <el-option
            v-for="sp in speciesOptions"
            :key="sp.id"
            :label="sp.speciesName"
            :value="sp.id"
          />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </div>

    <div class="page-card" style="margin-top: 16px">
      <div class="section-card__header">
        <span class="section-card__title">回捕率分析</span>
      </div>
      <el-table :data="analysisData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="speciesName" label="物种名称" min-width="120" />
        <el-table-column prop="areaName" label="海域名称" min-width="120" />
        <el-table-column label="投放量(尾)" min-width="120" align="right">
          <template #default="{ row }">
            {{ row.planQuantity != null ? row.planQuantity.toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="回捕量(kg)" min-width="120" align="right">
          <template #default="{ row }">
            {{ row.totalCatchWeight != null ? row.totalCatchWeight.toFixed(2) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="回捕率(%)" min-width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: recaptureRateColor(row.recaptureRate), fontWeight: 600 }">
              {{ row.recaptureRate != null ? row.recaptureRate.toFixed(2) : '' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="时间系数" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.timeCoefficient != null ? row.timeCoefficient.toFixed(2) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="校正回捕率(%)" min-width="130" align="center">
          <template #default="{ row }">
            {{ row.adjustedRate != null ? row.adjustedRate.toFixed(2) : '' }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-card" style="margin-top: 16px">
      <div class="section-card__header">
        <span class="section-card__title">投放量与回捕率对比图</span>
      </div>
      <div class="chart-body">
        <VChart v-if="analysisData.length" :option="chartOption" autoresize class="analysis-chart" />
        <el-empty v-else description="暂无分析数据" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.recapture-analysis-page {
  padding: 4px;
}

.page-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.section-card__header {
  padding: 0 0 16px;
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

.chart-body {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.analysis-chart {
  width: 100%;
  height: 380px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #0A2647;
  --el-button-border-color: #0A2647;
  --el-button-hover-bg-color: #144272;
  --el-button-hover-border-color: #144272;
}
</style>
