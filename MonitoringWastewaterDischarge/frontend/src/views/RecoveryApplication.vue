<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">复产申请管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建申请
          </el-button>
        </div>
      </template>
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="排放点">
          <el-select v-model="queryForm.pointId" placeholder="全部" clearable style="width: 200px">
            <el-option v-for="p in points" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.applicationStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="applicationNo" label="申请编号" width="160" />
        <el-table-column prop="pointCode" label="排放点" width="100" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="reasonHandled" label="处理情况" min-width="200" show-overflow-tooltip />
        <el-table-column prop="applicationStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.applicationStatus)" size="small">
              {{ getStatusText(row.applicationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审核人" width="100" />
        <el-table-column prop="approvalTime" label="审核时间" width="180">
          <template #default="{ row }">{{ formatTime(row.approvalTime) }}</template>
        </el-table-column>
        <el-table-column prop="recoveryTime" label="复产时间" width="180">
          <template #default="{ row }">{{ formatTime(row.recoveryTime) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.applicationStatus === 0" size="small" type="primary" link @click="handleApprove(row)">
              审核
            </el-button>
            <el-button size="small" type="info" link @click="handleView(row)">
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

    <el-dialog v-model="addDialogVisible" title="新建复产申请" width="600px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="停机指令" prop="shutdownOrderId">
          <el-select v-model="addForm.shutdownOrderId" placeholder="请选择停机指令" style="width: 100%" @change="onOrderChange">
            <el-option v-for="order in shutdownOrders" :key="order.id" :label="order.orderNo" :value="order.id">
              <span>{{ order.orderNo }} - {{ order.pointCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排放点" prop="pointId">
          <el-select v-model="addForm.pointId" placeholder="请选择排放点" style="width: 100%">
            <el-option v-for="p in stoppedPoints" :key="p.id" :label="p.pointName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="addForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="处理情况" prop="reasonHandled">
          <el-input v-model="addForm.reasonHandled" type="textarea" :rows="4" placeholder="请输入问题处理情况说明" />
        </el-form-item>
        <el-form-item label="检测报告">
          <el-input v-model="addForm.testReport" placeholder="请输入检测报告附件路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveDialogVisible" title="审核复产申请" width="600px">
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="申请编号">{{ selectedApp?.applicationNo }}</el-descriptions-item>
        <el-descriptions-item label="排放点">{{ selectedApp?.pointCode }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ selectedApp?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatTime(selectedApp?.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="处理情况" :span="2">{{ selectedApp?.reasonHandled }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="approveForm" :rules="approveRules" ref="approveFormRef" label-width="100px">
        <el-form-item label="审核结果" prop="applicationStatus">
          <el-radio-group v-model="approveForm.applicationStatus">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核人" prop="approver">
          <el-input v-model="approveForm.approver" placeholder="请输入审核人姓名" />
        </el-form-item>
        <el-form-item label="审核意见" prop="approvalOpinion">
          <el-input v-model="approveForm.approvalOpinion" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="复产申请详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请编号">{{ selectedApp?.applicationNo }}</el-descriptions-item>
        <el-descriptions-item label="排放点">{{ selectedApp?.pointCode }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ selectedApp?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedApp?.applicationStatus)" size="small">
            {{ getStatusText(selectedApp?.applicationStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理情况" :span="2">{{ selectedApp?.reasonHandled }}</el-descriptions-item>
        <el-descriptions-item label="检测报告" :span="2">{{ selectedApp?.testReport || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ selectedApp?.approver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(selectedApp?.approvalTime) }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ selectedApp?.approvalOpinion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="复产时间" :span="2">{{ formatTime(selectedApp?.recoveryTime) }}</el-descriptions-item>
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
const stoppedPoints = ref([])
const shutdownOrders = ref([])
const tableData = ref([])
const selectedApp = ref(null)
const addDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const addFormRef = ref(null)
const approveFormRef = ref(null)

const queryForm = reactive({
  pointId: null,
  applicationStatus: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const addForm = reactive({
  shutdownOrderId: null,
  pointId: null,
  pointCode: '',
  applicant: '',
  reasonHandled: '',
  testReport: ''
})

const approveForm = reactive({
  id: null,
  applicationStatus: 1,
  approver: '',
  approvalOpinion: ''
})

const addRules = {
  shutdownOrderId: [{ required: true, message: '请选择停机指令', trigger: 'change' }],
  pointId: [{ required: true, message: '请选择排放点', trigger: 'change' }],
  applicant: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  reasonHandled: [{ required: true, message: '请输入处理情况', trigger: 'blur' }]
}

const approveRules = {
  applicationStatus: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  approver: [{ required: true, message: '请输入审核人姓名', trigger: 'blur' }],
  approvalOpinion: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const types = ['warning', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审核', '审核通过', '审核驳回']
  return texts[status] || '未知'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const fetchData = async () => {
  try {
    const res = await request.get('/recovery-application/list', {
      params: {
        pointId: queryForm.pointId,
        applicationStatus: queryForm.applicationStatus,
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
  queryForm.applicationStatus = null
  pagination.pageNum = 1
  fetchData()
}

const fetchPoints = async () => {
  try {
    const res = await request.get('/discharge-point/list')
    points.value = res.data
    stoppedPoints.value = res.data.filter(p => p.status === 0)
  } catch (e) {
    console.error(e)
  }
}

const fetchShutdownOrders = async () => {
  try {
    const res = await request.get('/shutdown-order/list', {
      params: { orderStatus: 2, pageNum: 1, pageSize: 100 }
    })
    shutdownOrders.value = res.data.records
  } catch (e) {
    console.error(e)
  }
}

const onOrderChange = (orderId) => {
  const order = shutdownOrders.value.find(o => o.id === orderId)
  if (order) {
    addForm.pointId = order.pointId
    addForm.pointCode = order.pointCode
  }
}

const handleAdd = () => {
  Object.assign(addForm, {
    shutdownOrderId: null,
    pointId: null,
    pointCode: '',
    applicant: '',
    reasonHandled: '',
    testReport: ''
  })
  addDialogVisible.value = true
}

const handleApprove = (row) => {
  selectedApp.value = row
  approveForm.id = row.id
  approveForm.applicationStatus = 1
  approveForm.approver = ''
  approveForm.approvalOpinion = ''
  approveDialogVisible.value = true
}

const handleView = (row) => {
  selectedApp.value = row
  detailDialogVisible.value = true
}

const submitAdd = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('/recovery-application', addForm)
        ElMessage.success('申请提交成功')
        addDialogVisible.value = false
        fetchData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const submitApprove = async () => {
  if (!approveFormRef.value) return
  await approveFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('/recovery-application/approve', approveForm)
        ElMessage.success('审核成功')
        approveDialogVisible.value = false
        fetchData()
        fetchPoints()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

onMounted(() => {
  fetchPoints()
  fetchShutdownOrders()
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
</style>
