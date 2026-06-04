<template>
  <div class="appeals">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的申诉</span>
          <el-select v-model="statusFilter" placeholder="状态筛选" @change="loadData" style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </div>
      </template>
      
      <el-table :data="appeals" stripe v-loading="loading">
        <el-table-column prop="appeal_no" label="申诉编号" width="180" />
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="appeal_type" label="申诉类型" width="120" />
        <el-table-column prop="appeal_reason" label="申诉原因" show-overflow-tooltip />
        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column prop="handle_remark" label="处理意见" show-overflow-tooltip />
        <el-table-column prop="handled_at" label="处理时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.handled_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { appealApi } from '@/api'
import moment from 'moment'

const appeals = ref([])
const loading = ref(false)
const statusFilter = ref('')

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const driverId = localStorage.getItem('selectedDriver') || 1
    const res = await appealApi.getDriverList(driverId, statusFilter.value === '' ? null : statusFilter.value)
    appeals.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '待处理', 1: '处理中', 2: '已通过', 3: '已驳回' }
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
</style>
