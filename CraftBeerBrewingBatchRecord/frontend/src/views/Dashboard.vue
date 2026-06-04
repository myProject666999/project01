<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon :size="28"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBatches }}</div>
              <div class="stat-label">总批次</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon :size="28"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.qualifiedBatches }}</div>
              <div class="stat-label">合格批次</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon :size="28"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.unqualifiedBatches }}</div>
              <div class="stat-label">不合格批次</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon :size="28"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgScore }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>批次状态统计</span>
              <el-tag type="success">近30天</el-tag>
            </div>
          </template>
          <div ref="batchChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>品测评分分布</span>
              <el-tag type="warning">按维度</el-tag>
            </div>
          </template>
          <div ref="scoreChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="tables-row">
      <el-col :span="12">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近批次</span>
              <el-button type="primary" link @click="$router.push('/batches')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentBatches" stripe>
            <el-table-column prop="batchNo" label="批次号" width="120" />
            <el-table-column prop="batchName" label="批次名称" />
            <el-table-column prop="batchStatus" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.batchStatus)">{{ getStatusText(row.batchStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="qualityStatus" label="质量状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.qualityStatus === 'QUALIFIED' ? 'success' : 'danger'">
                  {{ row.qualityStatus === 'QUALIFIED' ? '合格' : '不合格' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>最近品测</span>
              <el-button type="primary" link @click="$router.push('/tastings')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentTastings" stripe>
            <el-table-column prop="batchNo" label="批次号" width="120" />
            <el-table-column prop="overallScore" label="综合评分" width="100">
              <template #default="{ row }">
                <span :class="getScoreClass(row.overallScore)">{{ row.overallScore }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="finalJudgment" label="判定" width="100">
              <template #default="{ row }">
                <el-tag :type="row.finalJudgment === 'PASS' ? 'success' : 'danger'">
                  {{ row.finalJudgment === 'PASS' ? '通过' : '未通过' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="tastingTime" label="品测时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getBatchList } from '@/api/batch'
import { getTastingList } from '@/api/tasting'

const batchChartRef = ref(null)
const scoreChartRef = ref(null)

const stats = ref({
  totalBatches: 0,
  qualifiedBatches: 0,
  unqualifiedBatches: 0,
  avgScore: '0.0'
})

const recentBatches = ref([])
const recentTastings = ref([])

const loadData = async () => {
  try {
    const [batchRes, tastingRes] = await Promise.all([
      getBatchList({ pageNum: 1, pageSize: 5 }),
      getTastingList({ pageNum: 1, pageSize: 5 })
    ])

    recentBatches.value = batchRes.records || []
    recentTastings.value = tastingRes.records || []

    stats.value.totalBatches = batchRes.total || 0
    stats.value.qualifiedBatches = recentBatches.value.filter(b => b.qualityStatus === 'QUALIFIED').length
    stats.value.unqualifiedBatches = recentBatches.value.filter(b => b.qualityStatus === 'UNQUALIFIED').length

    const avgScore = recentTastings.value.reduce((sum, t) => sum + Number(t.overallScore || 0), 0) / (recentTastings.value.length || 1)
    stats.value.avgScore = avgScore.toFixed(1)
  } catch (e) {
    recentBatches.value = mockBatches
    recentTastings.value = mockTastings
    stats.value.totalBatches = 156
    stats.value.qualifiedBatches = 142
    stats.value.unqualifiedBatches = 14
    stats.value.avgScore = '8.5'
  }
}

const getStatusType = (status) => {
  const map = { BREWING: 'primary', FERMENTING: 'warning', BOTTLED: 'success', COMPLETED: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { BREWING: '酿造中', FERMENTING: '发酵中', BOTTLED: '装瓶', COMPLETED: '完成' }
  return map[status] || status
}

const getScoreClass = (score) => {
  if (score >= 9) return 'score-high'
  if (score >= 7) return 'score-medium'
  return 'score-low'
}

const initBatchChart = () => {
  const chart = echarts.init(batchChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['批次数量'] },
    xAxis: {
      type: 'category',
      data: ['IPA', '世涛', '小麦', '皮尔森', '酸啤', '艾尔']
    },
    yAxis: { type: 'value' },
    series: [{
      name: '批次数量',
      type: 'bar',
      data: [45, 32, 28, 25, 15, 11],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67c23a' },
          { offset: 1, color: '#95d475' }
        ])
      },
      barWidth: '50%'
    }]
  })
}

const initScoreChart = () => {
  const chart = echarts.init(scoreChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '批次1', '批次2'] },
    radar: {
      indicator: [
        { name: '外观', max: 10 },
        { name: '香气', max: 10 },
        { name: '风味', max: 10 },
        { name: '口感', max: 10 },
        { name: '整体', max: 10 }
      ]
    },
    series: [{
      type: 'radar',
      data: [
        { value: [8.2, 8.5, 8.3, 8.0, 8.4], name: '平均分', areaStyle: { color: 'rgba(64,158,255,0.3)' } },
        { value: [9.0, 8.5, 8.8, 8.2, 8.6], name: '批次1', areaStyle: { color: 'rgba(103,194,58,0.3)' } },
        { value: [7.5, 7.8, 7.6, 7.9, 7.7], name: '批次2', areaStyle: { color: 'rgba(245,108,108,0.3)' } }
      ]
    }]
  })
}

const mockBatches = [
  { batchNo: 'B2024001', batchName: '美式IPA第一批次', batchStatus: 'COMPLETED', qualityStatus: 'QUALIFIED' },
  { batchNo: 'B2024002', batchName: '牛奶世涛', batchStatus: 'FERMENTING', qualityStatus: 'PENDING' },
  { batchNo: 'B2024003', batchName: '比利时小麦', batchStatus: 'BREWING', qualityStatus: 'PENDING' },
  { batchNo: 'B2024004', batchName: '德式皮尔森', batchStatus: 'COMPLETED', qualityStatus: 'UNQUALIFIED' },
  { batchNo: 'B2024005', batchName: '樱桃酸啤', batchStatus: 'BOTTLED', qualityStatus: 'PENDING' }
]

const mockTastings = [
  { batchNo: 'B2024001', overallScore: 8.8, finalJudgment: 'PASS', tastingTime: '2024-01-15 14:30' },
  { batchNo: 'B2024004', overallScore: 6.5, finalJudgment: 'FAIL', tastingTime: '2024-01-14 10:00' },
  { batchNo: 'B2023098', overallScore: 9.2, finalJudgment: 'PASS', tastingTime: '2024-01-13 15:20' },
  { batchNo: 'B2023095', overallScore: 7.8, finalJudgment: 'PASS', tastingTime: '2024-01-12 11:30' },
  { batchNo: 'B2023090', overallScore: 8.3, finalJudgment: 'PASS', tastingTime: '2024-01-11 16:45' }
]

onMounted(() => {
  loadData()
  initBatchChart()
  initScoreChart()
  window.addEventListener('resize', () => {
    batchChartRef.value && echarts.getInstanceByDom(batchChartRef.value)?.resize()
    scoreChartRef.value && echarts.getInstanceByDom(scoreChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-container {
  height: 300px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.score-high {
  color: #67c23a;
  font-weight: bold;
  font-size: 16px;
}

.score-medium {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.score-low {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}
</style>
