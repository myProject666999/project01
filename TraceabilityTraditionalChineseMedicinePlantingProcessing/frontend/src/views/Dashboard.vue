<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-title">{{ stat.title }}</p>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-desc">
                <span :class="stat.trend > 0 ? 'up' : 'down'">
                  <el-icon v-if="stat.trend > 0"><Top /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ Math.abs(stat.trend) }}%
                </span>
                较上月
              </p>
            </div>
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="32"><component :is="stat.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>月度采收量趋势</span>
            </div>
          </template>
          <div ref="harvestChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>品种分布</span>
            </div>
          </template>
          <div ref="varietyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>加工量统计</span>
            </div>
          </template>
          <div ref="processingChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Location, Box, Setting, Goods, Top, Bottom } from '@element-plus/icons-vue'

const harvestChartRef = ref(null)
const varietyChartRef = ref(null)
const processingChartRef = ref(null)

let harvestChart = null
let varietyChart = null
let processingChart = null

const stats = ref([
  { title: '地块总数', value: '128', trend: 12.5, icon: 'Location', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '本月采收量(kg)', value: '15,680', trend: 8.2, icon: 'Box', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '本月加工量(kg)', value: '12,450', trend: 5.3, icon: 'Setting', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '在库产品', value: '3,256', trend: -2.1, icon: 'Goods', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

function initHarvestChart() {
  if (!harvestChartRef.value) return
  harvestChart = echarts.init(harvestChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      name: '采收量(kg)'
    },
    series: [{
      data: [12000, 13200, 10100, 13400, 9000, 23000, 21000, 18200, 19100, 23400, 29000, 33000],
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
        ])
      },
      lineStyle: {
        width: 3,
        color: '#667eea'
      },
      itemStyle: {
        color: '#667eea'
      }
    }]
  }
  harvestChart.setOption(option)
}

function initVarietyChart() {
  if (!varietyChartRef.value) return
  varietyChart = echarts.init(varietyChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '人参' },
        { value: 735, name: '当归' },
        { value: 580, name: '黄芪' },
        { value: 484, name: '川芎' },
        { value: 300, name: '其他' }
      ]
    }]
  }
  varietyChart.setOption(option)
}

function initProcessingChart() {
  if (!processingChartRef.value) return
  processingChart = echarts.init(processingChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['清洗', '切片', '烘干', '包装']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      name: '加工量(kg)'
    },
    series: [
      {
        name: '清洗',
        type: 'bar',
        stack: 'total',
        data: [3200, 3020, 3410, 3740, 3900, 4500],
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '切片',
        type: 'bar',
        stack: 'total',
        data: [1200, 1320, 1010, 1340, 900, 2300],
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '烘干',
        type: 'bar',
        stack: 'total',
        data: [2000, 1820, 1910, 2340, 2900, 3300],
        itemStyle: { color: '#fac858' }
      },
      {
        name: '包装',
        type: 'bar',
        stack: 'total',
        data: [1500, 2100, 1800, 2000, 2200, 2500],
        itemStyle: { color: '#ee6666' }
      }
    ]
  }
  processingChart.setOption(option)
}

function handleResize() {
  harvestChart?.resize()
  varietyChart?.resize()
  processingChart?.resize()
}

onMounted(() => {
  initHarvestChart()
  initVarietyChart()
  initProcessingChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  harvestChart?.dispose()
  varietyChart?.dispose()
  processingChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 10px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.stat-desc .up {
  color: #67c23a;
  margin-right: 8px;
}

.stat-desc .down {
  color: #f56c6c;
  margin-right: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  border: none;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
