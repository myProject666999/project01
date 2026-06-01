<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">环境监控</h2>
      <div style="display: flex; gap: 10px;">
        <el-select v-model="selectedLocation" placeholder="选择仓位" clearable filterable style="width: 200px;">
          <el-option
            v-for="location in locations"
            :key="location.id"
            :label="location.location_code"
            :value="location.id"
          />
        </el-select>
        <el-button type="primary" @click="loadData">刷新数据</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <div class="chart-container">
          <h3 style="margin-bottom: 20px;">温湿度趋势图（近30天）</h3>
          <div ref="trendChart" style="height: 400px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="chart-container">
          <h3 style="margin-bottom: 20px;">各仓位最新环境数据</h3>
          <el-table :data="latestRecords" style="width: 100%" v-loading="loading">
            <el-table-column prop="location.location_code" label="仓位" width="100">
              <template #default="{ row }">
                <el-tag type="primary">{{ row.location.location_code }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="temperature" label="温度(°C)" width="100" />
            <el-table-column prop="humidity" label="湿度(%)" width="100">
              <template #default="{ row }">
                <span :class="row.is_alert ? 'status-danger' : ''" style="font-weight: 600;">
                  {{ row.humidity }}
                  <el-tag v-if="row.is_alert" type="danger" size="small" style="margin-left: 5px;">超限</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="record_date" label="日期" width="120" />
            <el-table-column prop="record_time" label="时间" width="100" />
            <el-table-column prop="is_alert" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.is_alert ? 'danger' : 'success'" size="small">
                  {{ row.is_alert ? '异常' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>预警列表</h3>
            <el-tag type="danger" v-if="pendingAlerts > 0">{{ pendingAlerts }} 条待处理</el-tag>
          </div>
          <el-table :data="alerts" style="width: 100%" height="400" v-loading="loading">
            <el-table-column prop="location.location_code" label="仓位" width="100" />
            <el-table-column prop="alert_level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="row.alert_level === 'danger' ? 'danger' : 'warning'" size="small">
                  {{ row.alert_level === 'danger' ? '危险' : '警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="预警内容" />
            <el-table-column prop="value" label="当前值" width="80" />
            <el-table-column prop="threshold" label="阈值" width="80" />
            <el-table-column prop="resolved" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.resolved ? 'info' : 'danger'" size="small">
                  {{ row.resolved ? '已处理' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  v-if="!row.resolved"
                  type="success"
                  size="small"
                  @click="handleResolve(row)"
                >
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="resolveDialogVisible" title="处理预警" width="500px">
      <el-form :model="resolveForm" ref="resolveFormRef" label-width="100px">
        <el-form-item label="处理备注">
          <el-input v-model="resolveForm.resolved_note" type="textarea" :rows="4" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getLatestRecords, getEnvironmentStatistics, getAlerts, resolveAlert } from '../api/environment'
import { getAllStorageLocations } from '../api/storageLocations'

const trendChart = ref(null)
const loading = ref(false)
const locations = ref([])
const selectedLocation = ref('')
const latestRecords = ref([])
const alerts = ref([])
const pendingAlerts = ref(0)
const resolveDialogVisible = ref(false)
const resolveFormRef = ref(null)

const resolveForm = reactive({
  id: null,
  resolved_note: ''
})

const initTrendChart = (data) => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  
  const dates = data.map(item => item.date)
  const avgTemp = data.map(item => parseFloat(item.avg_temperature))
  const avgHumidity = data.map(item => parseFloat(item.avg_humidity))
  const maxHumidity = data.map(item => parseFloat(item.max_humidity))
  const minHumidity = data.map(item => parseFloat(item.min_humidity))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均温度', '平均湿度', '最高湿度', '最低湿度']
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
        position: 'left',
        min: 10,
        max: 40
      },
      {
        type: 'value',
        name: '湿度(%)',
        position: 'right',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '平均温度',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        itemStyle: { color: '#e6a23c' },
        lineStyle: { color: '#e6a23c', width: 3 },
        data: avgTemp
      },
      {
        name: '平均湿度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff', width: 3 },
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
            lineStyle: { color: '#f56c6c', type: 'dashed', width: 2 },
            label: { formatter: '安全阈值 75%', color: '#f56c6c' }
          }]
        },
        data: avgHumidity
      },
      {
        name: '最高湿度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { color: '#f56c6c', type: 'dashed' },
        data: maxHumidity
      },
      {
        name: '最低湿度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#67c23a' },
        lineStyle: { color: '#67c23a', type: 'dashed' },
        data: minHumidity
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { days: 30 }
    if (selectedLocation.value) {
      params.location_id = selectedLocation.value
    }
    
    const [records, stats, alertList] = await Promise.all([
      getLatestRecords(),
      getEnvironmentStatistics(params),
      getAlerts({ pageSize: 50 })
    ])
    
    latestRecords.value = records.data
    alerts.value = alertList.data.list
    pendingAlerts.value = alerts.value.filter(a => !a.resolved).length
    
    await nextTick()
    initTrendChart(stats.data)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadLocations = async () => {
  try {
    const res = await getAllStorageLocations()
    locations.value = res.data
  } catch (error) {
    console.error('加载仓位失败:', error)
  }
}

const handleResolve = (row) => {
  resolveForm.id = row.id
  resolveForm.resolved_note = ''
  resolveDialogVisible.value = true
}

const confirmResolve = async () => {
  try {
    await resolveAlert(resolveForm.id, { resolved_note: resolveForm.resolved_note })
    ElMessage.success('处理成功')
    resolveDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('处理失败:', error)
  }
}

watch(selectedLocation, () => {
  loadData()
})

onMounted(() => {
  loadLocations()
  loadData()
})
</script>
