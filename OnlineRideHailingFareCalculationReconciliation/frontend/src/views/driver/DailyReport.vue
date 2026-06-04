<template>
  <div class="daily-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流水清单 - 应得金额</span>
          <div class="header-actions">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              style="width: 200px; margin-right: 10px;"
            />
            <el-button type="primary" @click="generateReport">
              <el-icon><Refresh /></el-icon>
              生成对账
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" v-if="report">
        <el-col :span="6">
          <el-statistic title="订单总数" :value="report.reconciliation.total_orders || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已匹配" :value="report.reconciliation.matched_orders || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平台总金额" :value="report.reconciliation.platform_total_amount || 0" prefix="¥" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本地计算金额" :value="report.reconciliation.local_total_amount || 0" prefix="¥" />
        </el-col>
      </el-row>

      <div v-if="report && report.reconciliation.total_amount_diff > 0" class="diff-alert">
        <el-alert
          :title="`存在金额差异，差异总额：¥${report.reconciliation.total_amount_diff}`"
          type="warning"
          show-icon
        />
      </div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>订单明细</span>
        </div>
      </template>
      
      <el-table :data="reportDetails" stripe v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="platform_name" label="平台" width="100" />
        <el-table-column prop="start_time" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column label="起点-终点" min-width="200">
          <template #default="{ row }">
            <div class="address">
              <div><el-icon><Location /></el-icon> {{ row.start_address }}</div>
              <div><el-icon><Location /></el-icon> {{ row.end_address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="platform_amount" label="平台金额" width="120">
          <template #default="{ row }">
            <span>¥{{ row.platform_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="local_amount" label="本地金额" width="120">
          <template #default="{ row }">
            <span>¥{{ row.local_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount_diff" label="金额差异" width="120">
          <template #default="{ row }">
            <span :class="{ 'diff-red': row.is_diff && row.amount_diff > 0 }">
              {{ row.amount_diff > 0 ? '¥' + row.amount_diff : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="platform_distance" label="平台里程" width="100">
          <template #default="{ row }">
            {{ row.platform_distance }}km
          </template>
        </el-table-column>
        <el-table-column prop="local_distance" label="本地里程" width="100">
          <template #default="{ row }">
            {{ row.local_distance }}km
          </template>
        </el-table-column>
        <el-table-column prop="distance_diff" label="里程差异" width="100">
          <template #default="{ row }">
            <span :class="{ 'diff-red': row.is_diff && row.distance_diff > 0 }">
              {{ row.distance_diff > 0 ? row.distance_diff + 'km' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.is_diff" type="danger" effect="dark">
              {{ row.diff_type || '有差异' }}
            </el-tag>
            <el-tag v-else type="success">
              正常
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" v-if="report">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              link
              @click="openAppeal(row)"
              v-if="row.is_diff"
            >
              申诉
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="appealDialogVisible" title="发起申诉" width="500px">
      <el-form :model="appealForm" label-width="100px">
        <el-form-item label="订单号">
          <span>{{ appealForm.order_no }}</span>
        </el-form-item>
        <el-form-item label="申诉类型">
          <el-select v-model="appealForm.appeal_type">
            <el-option label="金额差异" value="金额差异" />
            <el-option label="里程差异" value="里程差异" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="申诉原因">
          <el-input
            type="textarea"
            v-model="appealForm.appeal_reason"
            :rows="4"
            placeholder="请输入申诉原因"
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-input
            type="textarea"
            v-model="appealForm.appeal_proof"
            :rows="3"
            placeholder="请输入证明材料（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="appealDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAppeal">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reconciliationApi, appealApi } from '@/api'
import moment from 'moment'

const selectedDate = ref(new Date())
const report = ref(null)
const reportDetails = ref([])
const loading = ref(false)
const appealDialogVisible = ref(false)
const appealForm = ref({
  order_no: '',
  appeal_type: '',
  appeal_reason: '',
  appeal_proof: '',
  reconciliation_id: null,
  reconciliation_detail_id: null
})

onMounted(() => {
  loadReport()
})

const loadReport = async () => {
  loading.value = true
  try {
    const driverId = localStorage.getItem('selectedDriver') || 1
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    
    const res = await reconciliationApi.getDailyReport(driverId, date)
    report.value = res.data
    reportDetails.value = res.data.details || []
  } catch (e) {
    report.value = null
    reportDetails.value = []
    console.error(e)
  } finally {
    loading.value = false
  }
}

const generateReport = async () => {
  loading.value = true
  try {
    const driverId = localStorage.getItem('selectedDriver') || 1
    const date = moment(selectedDate.value).format('YYYY-MM-DD')
    
    await reconciliationApi.create(driverId, date)
    await loadReport()
    ElMessage.success('对账生成成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('生成对账失败')
  } finally {
    loading.value = false
  }
}

const openAppeal = (row) => {
  appealForm.value = {
    order_no: row.order_no,
    appeal_type: row.diff_type || '金额差异',
    appeal_reason: '',
    appeal_proof: '',
    reconciliation_id: report.value.reconciliation.id,
    reconciliation_detail_id: row.id
  }
  appealDialogVisible.value = true
}

const submitAppeal = async () => {
  try {
    const driverId = localStorage.getItem('selectedDriver') || 1
    await appealApi.create({
      ...appealForm.value,
      driver_id: driverId
    })
    ElMessage.success('申诉提交成功')
    appealDialogVisible.value = false
  } catch (e) {
    console.error(e)
    ElMessage.error('提交失败')
  }
}

const formatTime = (time) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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

.diff-alert {
  margin-top: 20px;
}

.address {
  font-size: 12px;
  line-height: 1.6;
}

.address .el-icon {
  color: #409eff;
  margin-right: 5px;
}

.diff-red {
  color: #f56c6c;
  font-weight: bold;
}
</style>
