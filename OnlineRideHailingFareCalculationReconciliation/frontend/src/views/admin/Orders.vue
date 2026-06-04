<template>
  <div class="orders">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-upload
              :before-upload="handleBeforeUpload"
              :show-file-list="false"
              accept=".csv"
              style="margin-right: 10px;"
            >
              <el-button type="success">
                <el-icon><Upload /></el-icon>
                导入CSV
              </el-button>
            </el-upload>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              style="width: 200px;"
            />
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-select v-model="filterDriver" placeholder="选择司机" style="width: 100%;" @change="loadOrders">
            <el-option label="全部司机" value="" />
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.driver_name"
              :value="driver.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="loadOrders">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button type="warning" @click="autoMatch" style="margin-left: 10px;">
            <el-icon><Refresh /></el-icon>
            自动匹配
          </el-button>
        </el-col>
      </el-row>
      
      <el-table :data="orders" stripe v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="platform_name" label="平台" width="100" />
        <el-table-column prop="driver_name" label="司机" width="100" />
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
        <el-table-column prop="start_address" label="起点" show-overflow-tooltip />
        <el-table-column prop="end_address" label="终点" show-overflow-tooltip />
        <el-table-column prop="distance" label="里程(km)" width="100" />
        <el-table-column prop="total_amount" label="总金额(元)" width="120" />
        <el-table-column prop="driver_amount" label="司机所得(元)" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ row.driver_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="matched_trip_id" label="匹配行程" width="120">
          <template #default="{ row }">
            {{ row.trip_no || '未匹配' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="matchOrder(row)" v-if="row.status === 0">
              手动匹配
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="matchDialogVisible" title="手动匹配行程" width="800px">
      <el-form :model="matchForm" label-width="100px">
        <el-form-item label="当前订单">
          <span>{{ matchForm.order_no }}</span>
        </el-form-item>
        <el-form-item label="选择行程">
          <el-select v-model="matchForm.trip_id" placeholder="请选择行程" style="width: 100%;">
            <el-option
              v-for="trip in availableTrips"
              :key="trip.id"
              :label="`${trip.trip_no} (${formatTime(trip.start_time)})`"
              :value="trip.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="matchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMatch">确认匹配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi, driverApi, tripApi } from '@/api'
import moment from 'moment'

const orders = ref([])
const drivers = ref([])
const availableTrips = ref([])
const loading = ref(false)
const selectedDate = ref(new Date())
const filterDriver = ref('')
const matchDialogVisible = ref(false)
const matchForm = ref({
  order_id: null,
  order_no: '',
  trip_id: null
})

onMounted(() => {
  loadDrivers()
  loadOrders()
})

const loadDrivers = async () => {
  try {
    const res = await driverApi.getList()
    drivers.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterDriver.value) {
      params.driverId = filterDriver.value
      params.date = moment(selectedDate.value).format('YYYY-MM-DD')
    } else {
      params.unmatched = 'true'
    }
    
    const res = await orderApi.getList(params)
    orders.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleBeforeUpload = async (file) => {
  try {
    await orderApi.import(file)
    ElMessage.success('导入成功')
    loadOrders()
  } catch (e) {
    ElMessage.error('导入失败')
  }
  return false
}

const autoMatch = async () => {
  if (!filterDriver.value) {
    ElMessage.warning('请先选择司机')
    return
  }
  
  try {
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    const res = await orderApi.autoMatch(filterDriver.value, date)
    ElMessage.success(`自动匹配成功，匹配了 ${res.data.matchedCount} 个订单`)
    loadOrders()
  } catch (e) {
    console.error(e)
    ElMessage.error('自动匹配失败')
  }
}

const matchOrder = async (row) => {
  matchForm.value = {
    order_id: row.id,
    order_no: row.order_no,
    trip_id: null
  }
  
  try {
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    const res = await tripApi.getList({ driverId: row.driver_id, date })
    availableTrips.value = res.data.filter(t => t.status === 1)
    matchDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const confirmMatch = async () => {
  try {
    await orderApi.match(matchForm.value.order_id, matchForm.value.trip_id)
    ElMessage.success('匹配成功')
    matchDialogVisible.value = false
    loadOrders()
  } catch (e) {
    console.error(e)
    ElMessage.error('匹配失败')
  }
}

const formatTime = (time) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '未匹配', 1: '已匹配', 2: '有差异' }
  return map[status] || '未知'
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
