<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">报警记录</span>
          <el-badge :value="stats.unprocessedCount" class="alarm-badge">
            <el-tag type="danger">待处理报警</el-tag>
          </el-badge>
        </div>
      </template>
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="排放点">
          <el-select v-model="queryForm.pointId" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警级别">
          <el-select v-model="queryForm.alarmLevel" placeholder="全部" clearable style="width: 150px">
            <el-option label="预警" :value="1" />
            <el-option label="严重" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="queryForm.dateRange" type="datetimerange" range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="pointCode" label="排放点" width="100" />
        <el-table-column prop="indicatorName" label="指标" width="150" />
        <el-table-column label="数值">
          <template #default="{ row }">
            <span class="current-value">{{ row.currentValue }}</span>
            <span class="threshold"> / 阈值: {{ row.thresholdValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="continuousMinutes" label="连续超标(分钟)" width="140">
          <template #default="{ row }">
            <el-tag :type="row.continuousMinutes >= 3 ? 'danger' : 'warning'" size="small">
              {{ row.continuousMinutes }} 分钟
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarmLevel" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.alarmLevel === 2 ? 'danger' : 'warning'" size="small">
              {{ row.alarmLevel === 2 ? '严重' : '预警' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="monitorTime" label="监测时间" width="180">
          <template #default="{ row }">{{ formatTime(row.monitorTime) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="报警时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import dayjs from 'dayjs'

const points = ref([])
const tableData = ref([])

const stats = reactive({
  unprocessedCount: 0
})

const queryForm = reactive({
  pointId: null,
  alarmLevel: null,
  dateRange: []
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const fetchStats = async () => {
  try {
    const res = await request.get('/alarm-record/unprocessed-count')
    stats.unprocessedCount = res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchData = async () => {
  try {
    const res = await request.get('/alarm-record/list', {
      params: {
        pointId: queryForm.pointId,
        alarmLevel: queryForm.alarmLevel,
        startTime: queryForm.dateRange && queryForm.dateRange[0] ? dayjs(queryForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : null,
        endTime: queryForm.dateRange && queryForm.dateRange[1] ? dayjs(queryForm.dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : null,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }
    })
    tableData.value = res.data.records
    pagination.total = res.data.total
  } catch (e) {
    console.error(e)
  }
}

const resetForm = () => {
  queryForm.pointId = null
  queryForm.alarmLevel = null
  queryForm.dateRange = []
  pagination.pageNum = 1
  fetchData()
}

const fetchPoints = async () => {
  try {
    const res = await request.get('/discharge-point/list')
    points.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchPoints()
  fetchData()
  fetchStats()
})
</script>

<style scoped>
.query-form {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.current-value {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}
.threshold {
  color: #909399;
  font-size: 13px;
}
.alarm-badge {
  margin-left: 20px;
}
</style>
