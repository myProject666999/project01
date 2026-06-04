<template>
  <div class="appeals">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>申诉处理</span>
          <div class="header-info">
            <el-tag type="warning" effect="dark">待处理：{{ pendingCount }}</el-tag>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 100%;" @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-col>
      </el-row>
      
      <el-table :data="appeals" stripe v-loading="loading">
        <el-table-column prop="appeal_no" label="申诉编号" width="180" />
        <el-table-column prop="driver_name" label="申诉司机" width="100" />
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="appeal_type" label="申诉类型" width="120" />
        <el-table-column prop="appeal_reason" label="申诉原因" show-overflow-tooltip min-width="200" />
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
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status === 0 || row.status === 1" 
              type="success" 
              size="small" 
              link 
              @click="handleAppeal(row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="申诉详情" width="600px">
      <el-descriptions :column="2" border v-if="currentAppeal">
        <el-descriptions-item label="申诉编号">{{ currentAppeal.appeal_no }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentAppeal.order_no }}</el-descriptions-item>
        <el-descriptions-item label="申诉司机">{{ currentAppeal.driver_name }}</el-descriptions-item>
        <el-descriptions-item label="申诉类型">{{ currentAppeal.appeal_type }}</el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ formatTime(currentAppeal.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="申诉原因" :span="2">
          {{ currentAppeal.appeal_reason }}
        </el-descriptions-item>
        <el-descriptions-item label="证明材料" :span="2" v-if="currentAppeal.appeal_proof">
          {{ currentAppeal.appeal_proof }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentAppeal.status)">
            {{ getStatusText(currentAppeal.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentAppeal.handler || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间" :span="2">
          {{ formatTime(currentAppeal.handled_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="处理意见" :span="2">
          {{ currentAppeal.handle_remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="handleDialogVisible" title="处理申诉" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="handleForm.status">
            <el-radio :label="2">通过</el-radio>
            <el-radio :label="3">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input
            type="textarea"
            v-model="handleForm.handle_remark"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { appealApi } from '@/api'
import moment from 'moment'

const appeals = ref([])
const loading = ref(false)
const statusFilter = ref('')
const pendingCount = ref(0)
const detailDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const currentAppeal = ref(null)
const handleForm = ref({
  id: null,
  status: 2,
  handle_remark: '',
  handler: '管理员'
})

onMounted(() => {
  loadData()
  loadPendingCount()
})

const loadData = async () => {
  loading.value = true
  try {
    const status = statusFilter.value === '' ? null : statusFilter.value
    const res = await appealApi.getList(status)
    appeals.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadPendingCount = async () => {
  try {
    const res = await appealApi.getPendingCount()
    pendingCount.value = res.data.count
  } catch (e) {
    console.error(e)
  }
}

const viewDetail = (row) => {
  currentAppeal.value = row
  detailDialogVisible.value = true
}

const handleAppeal = (row) => {
  handleForm.value = {
    id: row.id,
    status: 2,
    handle_remark: '',
    handler: '管理员'
  }
  handleDialogVisible.value = true
}

const confirmHandle = async () => {
  try {
    await appealApi.handle(handleForm.value.id, handleForm.value.handler, handleForm.value.handle_remark, handleForm.value.status)
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    loadData()
    loadPendingCount()
  } catch (e) {
    console.error(e)
    ElMessage.error('处理失败')
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
