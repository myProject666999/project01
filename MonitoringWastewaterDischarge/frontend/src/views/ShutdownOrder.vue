<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">停机指令管理</span>
        </div>
      </template>
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="排放点">
          <el-select v-model="queryForm.pointId" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.orderStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="待确认" :value="0" />
            <el-option label="已确认" :value="1" />
            <el-option label="已执行" :value="2" />
            <el-option label="已复产" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="orderNo" label="指令编号" width="160" />
        <el-table-column prop="pointCode" label="排放点" width="100" />
        <el-table-column prop="triggerIndicatorName" label="触发指标" width="140" />
        <el-table-column label="数值">
          <template #default="{ row }">
            <span class="trigger-value">{{ row.triggerValue }}</span>
            <span class="threshold"> / 阈值: {{ row.thresholdValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="continuousMinutes" label="连续超标" width="100">
          <template #default="{ row }">{{ row.continuousMinutes }} 分钟</template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.orderStatus)" size="small">
              {{ getStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作工" width="100" />
        <el-table-column prop="confirmTime" label="确认时间" width="180">
          <template #default="{ row }">{{ formatTime(row.confirmTime) }}</template>
        </el-table-column>
        <el-table-column prop="executeTime" label="执行时间" width="180">
          <template #default="{ row }">{{ formatTime(row.executeTime) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.orderStatus === 0" size="small" type="primary" link @click="handleConfirm(row)">
              确认
            </el-button>
            <el-button v-if="row.orderStatus === 1" size="small" type="success" link @click="handleExecute(row)">
              执行停机
            </el-button>
            <el-button v-if="row.orderStatus === 2" size="small" type="warning" link @click="handleView(row)">
              详情
            </el-button>
            <el-button v-if="row.orderStatus === 3" size="small" type="info" link @click="handleView(row)">
              详情
            </el-button>
          </template>
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

    <el-dialog v-model="confirmDialogVisible" title="确认停机指令" width="500px">
      <el-form :model="confirmForm" :rules="confirmRules" ref="confirmFormRef" label-width="100px">
        <el-form-item label="指令编号">
          <span>{{ selectedOrder?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="排放点">
          <span>{{ selectedOrder?.pointCode }}</span>
        </el-form-item>
        <el-form-item label="操作工" prop="operatorName">
          <el-input v-model="confirmForm.operatorName" placeholder="请输入操作工姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConfirm">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="executeDialogVisible" title="执行停机" width="600px">
      <el-form :model="executeForm" :rules="executeRules" ref="executeFormRef" label-width="100px">
        <el-form-item label="指令编号">
          <span>{{ selectedOrder?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="操作工" prop="operatorName">
          <el-input v-model="executeForm.operatorName" placeholder="请输入操作工姓名" />
        </el-form-item>
        <el-form-item label="原因分析" prop="reasonAnalysis">
          <el-input v-model="executeForm.reasonAnalysis" type="textarea" :rows="3" placeholder="请输入原因分析" />
        </el-form-item>
        <el-form-item label="工艺调整" prop="processAdjustment">
          <el-input v-model="executeForm.processAdjustment" type="textarea" :rows="3" placeholder="请输入工艺调整措施" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExecute">执行</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="停机指令详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="指令编号">{{ selectedOrder?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="排放点">{{ selectedOrder?.pointCode }}</el-descriptions-item>
        <el-descriptions-item label="触发指标">{{ selectedOrder?.triggerIndicatorName }}</el-descriptions-item>
        <el-descriptions-item label="连续超标">{{ selectedOrder?.continuousMinutes }} 分钟</el-descriptions-item>
        <el-descriptions-item label="触发值">{{ selectedOrder?.triggerValue }}</el-descriptions-item>
        <el-descriptions-item label="阈值">{{ selectedOrder?.thresholdValue }}</el-descriptions-item>
        <el-descriptions-item label="操作工">{{ selectedOrder?.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedOrder?.orderStatus)" size="small">
            {{ getStatusText(selectedOrder?.orderStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="确认时间" :span="2">{{ formatTime(selectedOrder?.confirmTime) }}</el-descriptions-item>
        <el-descriptions-item label="执行时间" :span="2">{{ formatTime(selectedOrder?.executeTime) }}</el-descriptions-item>
        <el-descriptions-item label="原因分析" :span="2">{{ selectedOrder?.reasonAnalysis || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工艺调整" :span="2">{{ selectedOrder?.processAdjustment || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const points = ref([])
const tableData = ref([])
const selectedOrder = ref(null)
const confirmDialogVisible = ref(false)
const executeDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const confirmFormRef = ref(null)
const executeFormRef = ref(null)

const queryForm = reactive({
  pointId: null,
  orderStatus: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const confirmForm = reactive({
  id: null,
  operatorName: ''
})

const executeForm = reactive({
  id: null,
  operatorName: '',
  reasonAnalysis: '',
  processAdjustment: ''
})

const confirmRules = {
  operatorName: [{ required: true, message: '请输入操作工姓名', trigger: 'blur' }]
}

const executeRules = {
  operatorName: [{ required: true, message: '请输入操作工姓名', trigger: 'blur' }],
  reasonAnalysis: [{ required: true, message: '请输入原因分析', trigger: 'blur' }],
  processAdjustment: [{ required: true, message: '请输入工艺调整措施', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'danger', 'success']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待确认', '已确认', '已执行', '已复产']
  return texts[status] || '未知'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const fetchData = async () => {
  try {
    const res = await request.get('/shutdown-order/list', {
      params: {
        pointId: queryForm.pointId,
        orderStatus: queryForm.orderStatus,
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
  queryForm.orderStatus = null
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

const handleConfirm = (row) => {
  selectedOrder.value = row
  confirmForm.id = row.id
  confirmForm.operatorName = ''
  confirmDialogVisible.value = true
}

const handleExecute = (row) => {
  selectedOrder.value = row
  executeForm.id = row.id
  executeForm.operatorName = ''
  executeForm.reasonAnalysis = ''
  executeForm.processAdjustment = ''
  executeDialogVisible.value = true
}

const handleView = (row) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
}

const submitConfirm = async () => {
  if (!confirmFormRef.value) return
  await confirmFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('/shutdown-order/confirm', confirmForm)
        ElMessage.success('确认成功')
        confirmDialogVisible.value = false
        fetchData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const submitExecute = async () => {
  if (!executeFormRef.value) return
  await executeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('/shutdown-order/execute', executeForm)
        ElMessage.success('执行成功')
        executeDialogVisible.value = false
        fetchData()
      } catch (e) {
        console.error(e)
      }
    }
  })
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
.trigger-value {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}
.threshold {
  color: #909399;
  font-size: 13px;
}
</style>
