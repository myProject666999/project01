<template>
  <div class="temperature-chart">
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="对比批次1">
          <el-select v-model="filterForm.batch1" placeholder="选择批次" style="width: 200px">
            <el-option v-for="b in batchList" :key="b.id" :label="b.batchNo + ' - ' + b.batchName" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比批次2">
          <el-select v-model="filterForm.batch2" placeholder="选择批次" style="width: 200px">
            <el-option v-for="b in batchList" :key="b.id" :label="b.batchNo + ' - ' + b.batchName" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>批次温度曲线对比</span>
              <el-tag v-if="filterForm.batch1" type="success">批次1: {{ getBatchNo(filterForm.batch1) }}</el-tag>
              <el-tag v-if="filterForm.batch2" type="danger">批次2: {{ getBatchNo(filterForm.batch2) }}</el-tag>
            </div>
          </template>
          <div ref="compareChartRef" class="chart-container"></div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: #67c23a"></span>
              <span>批次1（平稳）</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #f56c6c"></span>
              <span>批次2（波动）</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background: #909399"></span>
              <span>标准温度范围</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>温度波动分析</span>
          </template>
          <div ref="analysisChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-icon :size="22" color="#67c23a"><Odometer /></el-icon>
            <span>批次1平均温度</span>
          </div>
          <div class="stat-value">20.0<span class="stat-unit">°C</span></div>
          <div class="stat-footer">
            <span class="text-success">
              <el-icon><ArrowDown /></el-icon> 波动平稳
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-icon :size="22" color="#f56c6c"><Odometer /></el-icon>
            <span>批次2平均温度</span>
          </div>
          <div class="stat-value">20.5<span class="stat-unit">°C</span></div>
          <div class="stat-footer">
            <span class="text-danger">
              <el-icon><Warning /></el-icon> 波动较大
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-icon :size="22" color="#e6a23c"><Sort /></el-icon>
            <span>批次1温度标准差</span>
          </div>
          <div class="stat-value">0.21<span class="stat-unit">°C</span></div>
          <div class="stat-footer">
            <span class="text-success">控制优秀</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-header">
            <el-icon :size="22" color="#e6a23c"><Sort /></el-icon>
            <span>批次2温度标准差</span>
          </div>
          <div class="stat-value">1.35<span class="stat-unit">°C</span></div>
          <div class="stat-footer">
            <span class="text-danger">需要改进</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="data-card">
      <template #header>
        <span>温度数据记录</span>
      </template>
      <el-table :data="temperatureData" stripe max-height="400">
        <el-table-column prop="recordTime" label="记录时间" width="180" />
        <el-table-column label="批次1温度" width="150">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: 500">{{ row.temp1 }}°C</span>
          </template>
        </el-table-column>
        <el-table-column label="批次2温度" width="150">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 500">{{ row.temp2 }}°C</span>
          </template>
        </el-table-column>
        <el-table-column prop="diff" label="温差" width="100">
          <template #default="{ row }">
            <span :class="row.diff > 1 ? 'text-danger' : 'text-success'">{{ row.diff.toFixed(2) }}°C</span>
          </template>
        </el-table-column>
        <el-table-column prop="standardMin" label="标准下限" width="100">
          <template #default="{ row }">{{ row.standardMin }}°C</template>
        </el-table-column>
        <el-table-column prop="standardMax" label="标准上限" width="100">
          <template #default="{ row }">{{ row.standardMax }}°C</template>
        </el-table-column>
        <el-table-column label="批次2状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.temp2 > row.standardMax" type="danger">超高温</el-tag>
            <el-tag v-else-if="row.temp2 < row.standardMin" type="warning">超低温</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getTemperatureCurve } from '@/api/temperature'
import { getAllBatches } from '@/api/batch'

const compareChartRef = ref(null)
const analysisChartRef = ref(null)
const batchList = ref([])
const temperatureData = ref([])

const filterForm = reactive({
  batch1: 1,
  batch2: 4,
  dateRange: []
})

const loadBatches = async () => {
  try {
    batchList.value = await getAllBatches()
  } catch (e) {
    batchList.value = [
      { id: 1, batchNo: 'B2024001', batchName: '美式IPA第一批次' },
      { id: 2, batchNo: 'B2024002', batchName: '牛奶世涛' },
      { id: 3, batchNo: 'B2024003', batchName: '比利时小麦' },
      { id: 4, batchNo: 'B2024004', batchName: '德式皮尔森' }
    ]
  }
}

const loadData = async () => {
  try {
    const [data1, data2] = await Promise.all([
      getTemperatureCurve(filterForm.batch1),
      getTemperatureCurve(filterForm.batch2)
    ])
    temperatureData.value = mockTemperatureData
  } catch (e) {
    temperatureData.value = mockTemperatureData
  }
  nextTick(() => {
    initCompareChart()
    initAnalysisChart()
  })
}

const resetFilter = () => {
  filterForm.batch1 = 1
  filterForm.batch2 = 4
  filterForm.dateRange = []
  loadData()
}

const getBatchNo = (id) => {
  const batch = batchList.value.find(b => b.id === id)
  return batch ? batch.batchNo : ''
}

const initCompareChart = () => {
  const chart = echarts.init(compareChartRef.value)
  const times = mockTemperatureData.map(d => d.recordTime.split(' ')[1])
  const temp1 = mockTemperatureData.map(d => d.temp1)
  const temp2 = mockTemperatureData.map(d => d.temp2)
  const minLine = mockTemperatureData.map(d => d.standardMin)
  const maxLine = mockTemperatureData.map(d => d.standardMax)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['批次1（平稳）', '批次2（波动）', '标准下限', '标准上限'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: 17,
      max: 24
    },
    series: [
      {
        name: '批次1（平稳）',
        type: 'line',
        smooth: true,
        data: temp1,
        lineStyle: { color: '#67c23a', width: 3 },
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.3)' },
            { offset: 1, color: 'rgba(103,194,58,0.05)' }
          ])
        }
      },
      {
        name: '批次2（波动）',
        type: 'line',
        smooth: true,
        data: temp2,
        lineStyle: { color: '#f56c6c', width: 3 },
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,108,108,0.3)' },
            { offset: 1, color: 'rgba(245,108,108,0.05)' }
          ])
        }
      },
      {
        name: '标准下限',
        type: 'line',
        data: minLine,
        lineStyle: { color: '#909399', type: 'dashed', width: 1 },
        itemStyle: { color: '#909399' },
        symbol: 'none'
      },
      {
        name: '标准上限',
        type: 'line',
        data: maxLine,
        lineStyle: { color: '#909399', type: 'dashed', width: 1 },
        itemStyle: { color: '#909399' },
        symbol: 'none'
      }
    ]
  })
}

const initAnalysisChart = () => {
  const chart = echarts.init(analysisChartRef.value)
  const times = mockTemperatureData.map(d => d.recordTime.split(' ')[1])
  const diffs = mockTemperatureData.map(d => Math.abs(d.temp2 - 20))

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['批次2温度偏差', '偏差阈值'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: times
    },
    yAxis: {
      type: 'value',
      name: '偏差(°C)',
      min: 0,
      max: 3
    },
    series: [
      {
        name: '批次2温度偏差',
        type: 'bar',
        data: diffs,
        itemStyle: {
          color: (params) => params.data > 1 ? '#f56c6c' : '#e6a23c'
        },
        barWidth: '50%'
      },
      {
        name: '偏差阈值',
        type: 'line',
        data: new Array(times.length).fill(1),
        lineStyle: { color: '#f56c6c', type: 'dashed', width: 2 },
        itemStyle: { color: '#f56c6c' },
        symbol: 'none'
      }
    ]
  })
}

const mockTemperatureData = [
  { recordTime: '2024-01-10 12:00:00', temp1: 20.0, temp2: 19.8, diff: 0.2, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-10 14:00:00', temp1: 20.1, temp2: 20.5, diff: 0.4, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-10 16:00:00', temp1: 19.9, temp2: 21.2, diff: 1.3, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-10 18:00:00', temp1: 20.0, temp2: 21.8, diff: 1.8, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-10 20:00:00', temp1: 20.2, temp2: 22.1, diff: 1.9, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-10 22:00:00', temp1: 19.8, temp2: 21.5, diff: 1.7, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 00:00:00', temp1: 20.0, temp2: 20.8, diff: 0.8, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 02:00:00', temp1: 20.1, temp2: 19.5, diff: 0.6, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 04:00:00', temp1: 19.9, temp2: 18.8, diff: 1.1, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 06:00:00', temp1: 20.0, temp2: 18.5, diff: 1.5, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 08:00:00', temp1: 20.1, temp2: 19.2, diff: 0.9, standardMin: 19, standardMax: 21 },
  { recordTime: '2024-01-11 10:00:00', temp1: 19.8, temp2: 20.0, diff: 0.2, standardMin: 19, standardMax: 21 }
]

onMounted(() => {
  loadBatches()
  loadData()
  window.addEventListener('resize', () => {
    compareChartRef.value && echarts.getInstanceByDom(compareChartRef.value)?.resize()
    analysisChartRef.value && echarts.getInstanceByDom(analysisChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.temperature-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  border-radius: 8px;
}

.chart-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-line {
  width: 20px;
  height: 2px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-unit {
  font-size: 16px;
  color: #909399;
  margin-left: 4px;
}

.stat-footer {
  margin-top: 8px;
  font-size: 13px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.data-card {
  border-radius: 8px;
}
</style>
