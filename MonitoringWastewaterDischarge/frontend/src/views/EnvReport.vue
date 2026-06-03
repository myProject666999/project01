<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">环保平台报送记录</span>
          <el-button type="primary" @click="handleRetry">
            <el-icon><Refresh /></el-icon>
            重发失败数据
          </el-button>
        </div>
      </template>
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="排放点">
          <el-select v-model="queryForm.pointId" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="报送状态">
          <el-select v-model="queryForm.reportStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="待报送" :value="0" />
            <el-option label="已报送" :value="1" />
            <el-option label="报送失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="pointCode" label="排放点" width="100" />
        <el-table-column prop="reportContent" label="报送内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <el-popover placement="top-start" :width="400" trigger="click">
              <template #reference>
                <span class="content-preview">{{ formatContent(row.reportContent) }}</span>
              </template>
              <pre style="white-space: pre-wrap; word-break: break-all;">{{ row.reportContent }}</pre>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="reportStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.reportStatus)" size="small">
              {{ getStatusText(row.reportStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="90" />
        <el-table-column prop="responseContent" label="平台响应" min-width="200" show-overflow-tooltip />
        <el-table-column prop="reportTime" label="报送时间" width="180">
          <template #default="{ row }">{{ formatTime(row.reportTime) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
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

    <el-card class="page-card" style="margin-top: 20px;">
      <template #header>
        <span class="card-title">模拟超标测试</span>
      </template>
      <el-alert title="测试说明" type="info" :closable="false" style="margin-bottom: 20px">
        <p>选择排放点和指标后，点击触发按钮，系统将在下一次数据模拟时强制该指标超标。</p>
        <p>连续3分钟超标后将自动触发停机指令。</p>
      </el-alert>
      <el-form :inline="true" :model="triggerForm">
        <el-form-item label="排放点">
          <el-select v-model="triggerForm.pointCode" placeholder="请选择排放点" style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.pointCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="超标指标">
          <el-select v-model="triggerForm.indicator" placeholder="请选择指标" style="width: 150px">
            <el-option label="COD" value="COD" />
            <el-option label="pH" value="pH" />
            <el-option label="色度" value="COLOR" />
            <el-option label="氨氮" value="AMMONIA" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="triggerOverLimit">
            <el-icon><Warning /></el-icon>
            触发超标
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const points = ref([])
const tableData = ref([])

const queryForm = reactive({
  pointId: null,
  reportStatus: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const triggerForm = reactive({
  pointCode: '',
  indicator: 'COD'
})

const getStatusType = (status) => {
  const types = ['warning', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待报送', '已报送', '报送失败']
  return texts[status] || '未知'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const formatContent = (content) => {
  if (!content) return '-'
  try {
    const obj = JSON.parse(content)
    return `排放点: ${obj.pointCode}, COD: ${obj.cod}, pH: ${obj.ph}`
  } catch (e) {
    return content.substring(0, 50) + '...'
  }
}

const fetchData = async () => {
  try {
    const res = await request.get('/env-report/list', {
      params: {
        pointId: queryForm.pointId,
        reportStatus: queryForm.reportStatus,
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
  queryForm.reportStatus = null
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

const handleRetry = async () => {
  try {
    await request.post('/env-report/retry')
    ElMessage.success('已触发重发操作')
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

const triggerOverLimit = async () => {
  if (!triggerForm.pointCode) {
    ElMessage.warning('请选择排放点')
    return
  }
  try {
    await request.post(`/env-report/trigger-overlimit/${triggerForm.pointCode}/${triggerForm.indicator}`)
    ElMessage.success(`已设置 ${triggerForm.pointCode} 强制${triggerForm.indicator}超标，将在下一分钟生效`)
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
.content-preview {
  color: #409eff;
  cursor: pointer;
}
</style>
