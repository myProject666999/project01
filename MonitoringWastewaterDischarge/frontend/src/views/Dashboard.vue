<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon :size="36"><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.runningPoints }}/{{ stats.totalPoints }}</div>
              <div class="stat-label">运行中排放点</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon red">
              <el-icon :size="36"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.alarmCount24h }}</div>
              <div class="stat-label">24小时报警数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon :size="36"><SwitchButton /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingShutdownOrders }}</div>
              <div class="stat-label">待处理停机</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon :size="36"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingRecoveryApplications }}</div>
              <div class="stat-label">待审核复产</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="realtime-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">实时监测数据</span>
          <el-tag type="info" size="small">{{ currentTime }}</el-tag>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="point in points" :key="point.id">
          <el-card class="point-card" :class="{ 'stopped': point.status === 0 }" shadow="hover">
            <div class="point-header">
              <div class="point-name">{{ point.pointName }}</div>
              <el-tag :type="point.status === 1 ? 'success' : 'danger'" size="small">
                {{ point.status === 1 ? '运行中' : '已停机' }}
              </el-tag>
            </div>
            <div class="point-location">{{ point.location }}</div>
            <div class="point-data" v-if="realtimeData[point.pointCode]">
              <div class="data-item" :class="{ 'over-limit': isOverLimit(realtimeData[point.pointCode], 'COD') }">
                <span class="data-label">COD</span>
                <span class="data-value">{{ realtimeData[point.pointCode].codValue }}</span>
                <span class="data-unit">mg/L</span>
                <span class="data-threshold">(≤{{ point.codThreshold }})</span>
              </div>
              <div class="data-item" :class="{ 'over-limit': isOverLimit(realtimeData[point.pointCode], 'pH') }">
                <span class="data-label">pH</span>
                <span class="data-value">{{ realtimeData[point.pointCode].phValue }}</span>
                <span class="data-unit"></span>
                <span class="data-threshold">({{ point.phMinThreshold }}-{{ point.phMaxThreshold }})</span>
              </div>
              <div class="data-item" :class="{ 'over-limit': isOverLimit(realtimeData[point.pointCode], 'COLOR') }">
                <span class="data-label">色度</span>
                <span class="data-value">{{ realtimeData[point.pointCode].colorValue }}</span>
                <span class="data-unit">倍</span>
                <span class="data-threshold">(≤{{ point.colorThreshold }})</span>
              </div>
              <div class="data-item" :class="{ 'over-limit': isOverLimit(realtimeData[point.pointCode], 'AMMONIA') }">
                <span class="data-label">氨氮</span>
                <span class="data-value">{{ realtimeData[point.pointCode].ammoniaValue }}</span>
                <span class="data-unit">mg/L</span>
                <span class="data-threshold">(≤{{ point.ammoniaThreshold }})</span>
              </div>
              <div class="data-time">
                监测时间: {{ formatTime(realtimeData[point.pointCode].monitorTime) }}
              </div>
            </div>
            <el-empty v-else description="暂无数据" :image-size="80" />
            <div class="point-actions">
              <el-button size="small" type="primary" link @click="triggerOverLimit(point.pointCode, 'COD')">
                模拟COD超标
              </el-button>
              <el-button size="small" type="danger" link @click="viewChart(point)">
                查看趋势
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="chartVisible" :title="chartTitle" width="900px">
      <div ref="chartRef" class="chart-container"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import request from '@/utils/request'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const stats = reactive({
  totalPoints: 0,
  runningPoints: 0,
  stoppedPoints: 0,
  alarmCount24h: 0,
  pendingShutdownOrders: 0,
  pendingRecoveryApplications: 0
})

const points = ref([])
const realtimeData = ref({})
const currentTime = ref('')
const chartVisible = ref(false)
const chartTitle = ref('')
const chartRef = ref(null)
let chartInstance = null
let timer = null

const fetchStats = async () => {
  try {
    const res = await request.get('/dashboard/stats')
    Object.assign(stats, res.data)
  } catch (e) {
    console.error(e)
  }
}

const fetchPoints = async () => {
  try {
    const res = await request.get('/discharge-point/list')
    points.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchRealtimeData = async () => {
  try {
    const res = await request.get('/dashboard/realtime-all')
    realtimeData.value = res.data
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  } catch (e) {
    console.error(e)
  }
}

const isOverLimit = (data, indicator) => {
  if (!data || !data.overLimitIndicators) return false
  return data.overLimitIndicators.includes(indicator)
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const triggerOverLimit = async (pointCode, indicator) => {
  try {
    await request.post(`/env-report/trigger-overlimit/${pointCode}/${indicator}`)
    ElMessage.success(`已设置 ${pointCode} 强制${indicator}超标，将在下一分钟生效`)
  } catch (e) {
    console.error(e)
  }
}

const viewChart = async (point) => {
  chartTitle.value = `${point.pointName} - 监测趋势图`
  chartVisible.value = true
  await nextTick()
  initChart(point)
}

const initChart = async (point) => {
  if (!chartRef.value) return
  if (chartInstance) {
    chartInstance.dispose()
  }
  chartInstance = echarts.init(chartRef.value)

  try {
    const res = await request.get(`/monitor-data/recent/${point.pointCode}/60`)
    const data = res.data.slice().reverse()
    const times = data.map(d => dayjs(d.monitorTime).format('HH:mm'))
    const codData = data.map(d => d.codValue)
    const colorData = data.map(d => d.colorValue)
    const ammoniaData = data.map(d => d.ammoniaValue)

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['COD', '色度', '氨氮'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: times },
      yAxis: [
        { type: 'value', name: 'COD/氨氮(mg/L)', position: 'left' },
        { type: 'value', name: '色度(倍)', position: 'right' }
      ],
      series: [
        {
          name: 'COD',
          type: 'line',
          smooth: true,
          data: codData,
          lineStyle: { color: '#409eff' },
          itemStyle: { color: '#409eff' },
          markLine: {
            silent: true,
            data: [{ yAxis: point.codThreshold, label: { formatter: 'COD阈值' } }]
          }
        },
        {
          name: '色度',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: colorData,
          lineStyle: { color: '#e6a23c' },
          itemStyle: { color: '#e6a23c' },
          markLine: {
            silent: true,
            data: [{ yAxis: point.colorThreshold, label: { formatter: '色度阈值' } }]
          }
        },
        {
          name: '氨氮',
          type: 'line',
          smooth: true,
          data: ammoniaData,
          lineStyle: { color: '#67c23a' },
          itemStyle: { color: '#67c23a' },
          markLine: {
            silent: true,
            data: [{ yAxis: point.ammoniaThreshold, label: { formatter: '氨氮阈值' } }]
          }
        }
      ]
    }
    chartInstance.setOption(option)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchStats()
  fetchPoints()
  fetchRealtimeData()
  timer = setInterval(() => {
    fetchRealtimeData()
    fetchStats()
  }, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  border-radius: 8px;
  border: none;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.red { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-icon.green { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.realtime-card {
  border-radius: 8px;
  border: none;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.point-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
  transition: all 0.3s;
}
.point-card.stopped {
  opacity: 0.7;
  background: #f5f7fa;
}
.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.point-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.point-location {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
}
.point-data {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.data-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 0;
  font-size: 14px;
}
.data-item.over-limit {
  color: #f56c6c;
  font-weight: 600;
}
.data-label {
  width: 40px;
  color: #606266;
}
.data-value {
  font-size: 18px;
  font-weight: 600;
}
.data-unit {
  color: #909399;
  font-size: 12px;
}
.data-threshold {
  color: #c0c4cc;
  font-size: 12px;
}
.data-time {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}
.point-actions {
  display: flex;
  justify-content: space-between;
}
.chart-container {
  height: 400px;
}
</style>
