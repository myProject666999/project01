<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">监测数据查询</span>
        </div>
      </template>
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="排放点">
          <el-select v-model="queryForm.pointId" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="queryForm.startTime" type="datetime" placeholder="选择时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="queryForm.endTime" type="datetime" placeholder="选择时间" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="pointCode" label="排放点" width="100" />
        <el-table-column prop="codValue" label="COD(mg/L)" width="110">
          <template #default="{ row }">
            <span :class="{ 'over-limit': isOverLimit(row, 'COD') }">{{ row.codValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phValue" label="pH" width="100">
          <template #default="{ row }">
            <span :class="{ 'over-limit': isOverLimit(row, 'pH') }">{{ row.phValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="colorValue" label="色度(倍)" width="100">
          <template #default="{ row }">
            <span :class="{ 'over-limit': isOverLimit(row, 'COLOR') }">{{ row.colorValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ammoniaValue" label="氨氮(mg/L)" width="110">
          <template #default="{ row }">
            <span :class="{ 'over-limit': isOverLimit(row, 'AMMONIA') }">{{ row.ammoniaValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isOverLimit" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isOverLimit === 1 ? 'danger' : 'success'" size="small">
              {{ row.isOverLimit === 1 ? '超标' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overLimitIndicators" label="超标指标" width="150" />
        <el-table-column prop="reportStatus" label="报送状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.reportStatus === 1 ? 'success' : row.reportStatus === 2 ? 'danger' : 'warning'" size="small">
              {{ row.reportStatus === 1 ? '已报送' : row.reportStatus === 2 ? '失败' : '待报送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="monitorTime" label="监测时间" width="180">
          <template #default="{ row }">{{ formatTime(row.monitorTime) }}</template>
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

const queryForm = reactive({
  pointId: null,
  startTime: null,
  endTime: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const isOverLimit = (row, indicator) => {
  if (!row || !row.overLimitIndicators) return false
  return row.overLimitIndicators.includes(indicator)
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const fetchData = async () => {
  try {
    const res = await request.get('/monitor-data/history', {
      params: {
        pointId: queryForm.pointId,
        startTime: queryForm.startTime ? dayjs(queryForm.startTime).format('YYYY-MM-DD HH:mm:ss') : null,
        endTime: queryForm.endTime ? dayjs(queryForm.endTime).format('YYYY-MM-DD HH:mm:ss') : null,
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
  queryForm.startTime = null
  queryForm.endTime = null
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
.over-limit {
  color: #f56c6c;
  font-weight: 600;
}
</style>
