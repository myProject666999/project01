<template>
  <div class="driver-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.trip_count || 0 }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ summary.total_fare || 0 }}</div>
              <div class="stat-label">今日营收</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon size="30"><Position /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ summary.total_distance || 0 }}km</div>
              <div class="stat-label">今日里程</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>今日行程</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            @change="loadData"
          />
        </div>
      </template>
      <el-table :data="trips" stripe v-loading="loading">
        <el-table-column prop="trip_no" label="行程号" width="180" />
        <el-table-column prop="plate_no" label="车牌号" width="120" />
        <el-table-column prop="start_time" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_distance" label="里程(km)" width="100" />
        <el-table-column label="时长">
          <template #default="{ row }">
            {{ formatDuration(row.total_duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="calculated_fare" label="金额(元)" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ row.calculated_fare }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { tripApi } from '@/api'
import moment from 'moment'

const selectedDate = ref(new Date())
const trips = ref([])
const summary = ref({})
const loading = ref(false)

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const driverId = localStorage.getItem('selectedDriver') || 1
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    
    const [tripsRes, summaryRes] = await Promise.all([
      tripApi.getList({ driverId, date }),
      tripApi.getSummary(driverId, date)
    ])
    
    trips.value = tripsRes.data
    summary.value = summaryRes.data || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const formatDuration = (seconds) => {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}时${m}分${s}秒`
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'primary' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '进行中', 1: '已完成', 2: '已对账' }
  return map[status] || '未知'
}
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
