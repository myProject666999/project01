<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stats-card">
          <el-icon :size="40" color="#409eff"><Goods /></el-icon>
          <div class="stats-value">{{ stats.totalProducts }}</div>
          <div class="stats-label">茶品总数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <el-icon :size="40" color="#67c23a"><OfficeBuilding /></el-icon>
          <div class="stats-value">{{ stats.totalLocations }}</div>
          <div class="stats-label">仓位总数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card">
          <el-icon :size="40" color="#e6a23c"><Box /></el-icon>
          <div class="stats-value">{{ stats.totalInventory }}</div>
          <div class="stats-label">库存总数（片）</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="position: relative;">
          <el-icon :size="40" color="#f56c6c"><Warning /></el-icon>
          <div class="stats-value" :style="{ color: pendingAlerts > 0 ? '#f56c6c' : '#409eff' }">{{ pendingAlerts }}</div>
          <div class="stats-label">待处理预警</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="chart-container">
          <h3 style="margin-bottom: 20px;">环境监控概览</h3>
          <div ref="envChart" style="height: 350px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <h3 style="margin-bottom: 20px;">最新预警</h3>
          <el-table :data="latestAlerts" style="width: 100%" height="350">
            <el-table-column prop="location.location_code" label="仓位" width="100" />
            <el-table-column prop="alert_level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="row.alert_level === 'danger' ? 'danger' : 'warning'" size="small">
                  {{ row.alert_level === 'danger' ? '危险' : '警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="预警内容" />
            <el-table-column prop="created_at" label="时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <div class="chart-container">
          <h3 style="margin-bottom: 20px;">最新品鉴记录</h3>
          <el-table :data="latestTastingNotes" style="width: 100%">
            <el-table-column prop="teaProduct.product_name" label="茶品名称" width="150" />
            <el-table-column prop="teaProduct.production_year" label="年份" width="80" />
            <el-table-column prop="tasting_date" label="品鉴日期" width="120" />
            <el-table-column prop="tea_weight" label="克重(g)" width="80" />
            <el-table-column prop="water_type" label="用水" width="80">
              <template #default="{ row }">
                {{ row.water_type === 'pure' ? '纯净水' : '矿泉水' }}
              </template>
            </el-table-column>
            <el-table-column prop="brew_count" label="冲泡次数" width="80" />
            <el-table-column prop="overall_score" label="评分" width="80">
              <template #default="{ row }">
                <el-tag type="success">{{ row.overall_score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="评价" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewCurve(row.tea_product_id)">转化曲线</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getTeaProducts } from '../api/teaProducts'
import { getStorageLocations } from '../api/storageLocations'
import { getInventory } from '../api/inventory'
import { getAlerts, getEnvironmentStatistics } from '../api/environment'
import { getTastingNotes } from '../api/tastingNotes'
import { Goods, OfficeBuilding, Box, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const envChart = ref(null)

const stats = ref({
  totalProducts: 0,
  totalLocations: 0,
  totalInventory: 0
})
const pendingAlerts = ref(0)
const latestAlerts = ref([])
const latestTastingNotes = ref([])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const viewCurve = (id) => {
  router.push(`/conversion-curve/${id}`)
}

const initEnvChart = (data) => {
  if (!envChart.value) return
  
  const chart = echarts.init(envChart.value)
  
  const dates = data.map(item => item.date)
  const tempData = data.map(item => parseFloat(item.avg_temperature))
  const humidityData = data.map(item => parseFloat(item.avg_humidity))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均温度(°C)', '平均湿度(%)']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(°C)',
        position: 'left'
      },
      {
        type: 'value',
        name: '湿度(%)',
        position: 'right',
        max: 100
      }
    ],
    series: [
      {
        name: '平均温度(°C)',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        itemStyle: { color: '#e6a23c' },
        lineStyle: { color: '#e6a23c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
          ])
        },
        data: tempData
      },
      {
        name: '平均湿度(%)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        markLine: {
          silent: true,
          data: [{
            yAxis: 75,
            lineStyle: { color: '#f56c6c', type: 'dashed' },
            label: { formatter: '湿度阈值75%' }
          }]
        },
        data: humidityData
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const loadData = async () => {
  try {
    const [products, locations, inventory, alerts, envStats, tastingNotes] = await Promise.all([
      getTeaProducts({ pageSize: 1 }),
      getStorageLocations({ pageSize: 1 }),
      getInventory({ pageSize: 1000 }),
      getAlerts({ resolved: 0, pageSize: 10 }),
      getEnvironmentStatistics({ days: 30 }),
      getTastingNotes({ pageSize: 5 })
    ])
    
    stats.value.totalProducts = products.data.total
    stats.value.totalLocations = locations.data.total
    stats.value.totalInventory = inventory.data.list.reduce((sum, item) => sum + item.quantity, 0)
    pendingAlerts.value = alerts.data.total
    latestAlerts.value = alerts.data.list
    latestTastingNotes.value = tastingNotes.data.list
    
    await nextTick()
    initEnvChart(envStats.data)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
