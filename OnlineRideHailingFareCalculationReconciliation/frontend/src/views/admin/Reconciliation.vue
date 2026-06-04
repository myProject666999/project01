<template>
  <div class="reconciliation">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>对账管理</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 300px; margin-right: 10px;"
            />
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="reconciliations" stripe v-loading="loading">
        <el-table-column prop="reconciliation_no" label="对账编号" width="180" />
        <el-table-column prop="driver_name" label="司机" width="120" />
        <el-table-column prop="reconciliation_date" label="对账日期" width="120" />
        <el-table-column prop="total_orders" label="总订单数" width="100" align="center" />
        <el-table-column prop="matched_orders" label="已匹配" width="100" align="center" />
        <el-table-column prop="diff_orders" label="差异订单" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.diff_orders > 0" class="diff-red">{{ row.diff_orders }}</span>
            <span v-else>{{ row.diff_orders }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platform_total_amount" label="平台金额" width="120">
          <template #default="{ row }">
            ¥{{ row.platform_total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="local_total_amount" label="本地金额" width="120">
          <template #default="{ row }">
            ¥{{ row.local_total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount_diff" label="金额差异" width="120">
          <template #default="{ row }">
            <span v-if="row.total_amount_diff > 0" class="diff-red">¥{{ row.total_amount_diff }}</span>
            <span v-else>¥{{ row.total_amount_diff }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetails(row)">
              详情
            </el-button>
            <el-button type="success" size="small" link @click="confirmReconciliation(row)" v-if="row.status === 0">
              确认
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="对账详情" width="90%">
      <el-descriptions :column="4" border v-if="currentReconciliation">
        <el-descriptions-item label="对账编号">{{ currentReconciliation.reconciliation_no }}</el-descriptions-item>
        <el-descriptions-item label="司机">{{ currentReconciliation.driver_name }}</el-descriptions-item>
        <el-descriptions-item label="对账日期">{{ currentReconciliation.reconciliation_date }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReconciliation.status)">
            {{ getStatusText(currentReconciliation.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总订单数">{{ currentReconciliation.total_orders }}</el-descriptions-item>
        <el-descriptions-item label="已匹配">{{ currentReconciliation.matched_orders }}</el-descriptions-item>
        <el-descriptions-item label="差异订单">{{ currentReconciliation.diff_orders }}</el-descriptions-item>
        <el-descriptions-item label="金额差异">¥{{ currentReconciliation.total_amount_diff }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>订单明细</el-divider>
      
      <el-table :data="detailList" stripe style="margin-top: 20px;">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="platform_name" label="平台" width="100" />
        <el-table-column prop="platform_amount" label="平台金额" width="100" />
        <el-table-column prop="local_amount" label="本地金额" width="100" />
        <el-table-column prop="amount_diff" label="金额差异" width="100">
          <template #default="{ row }">
            <span v-if="row.is_diff && row.amount_diff > 0" class="diff-red">¥{{ row.amount_diff }}</span>
            <span v-else>¥{{ row.amount_diff || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platform_distance" label="平台里程" width="100" />
        <el-table-column prop="local_distance" label="本地里程" width="100" />
        <el-table-column prop="distance_diff" label="里程差异" width="100">
          <template #default="{ row }">
            <span v-if="row.is_diff && row.distance_diff > 0" class="diff-red">{{ row.distance_diff }}km</span>
            <span v-else>{{ row.distance_diff || 0 }}km</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_diff" type="danger">有差异</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reconciliationApi } from '@/api'
import moment from 'moment'

const dateRange = ref([moment().subtract(7, 'days').toDate(), new Date()])
const reconciliations = ref([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentReconciliation = ref(null)
const detailList = ref([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const startDate = moment(dateRange.value[0]).format('YYYY-MM-DD')
    const endDate = moment(dateRange.value[1]).format('YYYY-MM-DD')
    
    const res = await reconciliationApi.getList({ startDate, endDate })
    reconciliations.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewDetails = async (row) => {
  try {
    currentReconciliation.value = row
    const res = await reconciliationApi.getDetails(row.id)
    detailList.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const confirmReconciliation = async (row) => {
  try {
    await reconciliationApi.confirm(row.id)
    ElMessage.success('确认成功')
    loadData()
  } catch (e) {
    console.error(e)
    ElMessage.error('确认失败')
  }
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '待确认', 1: '已确认', 2: '有申诉' }
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

.diff-red {
  color: #f56c6c;
  font-weight: bold;
}
</style>
