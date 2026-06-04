<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>复核管理</span>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待复核" :value="0" />
            <el-option label="复核通过" :value="1" />
            <el-option label="复核异常" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="review_no" label="复核单号" width="180" />
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="total_items" label="商品数" width="100" />
        <el-table-column prop="pass_items" label="通过数" width="100" />
        <el-table-column prop="fail_items" label="异常数" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="复核员" width="100" />
        <el-table-column prop="reviewed_at" label="复核时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" v-if="row.status === 0" @click="handleScan(row)">
              扫码复核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="复核单号">{{ detail.review_no }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detail.order_no }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ detail.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail.address }}</el-descriptions-item>
      </el-descriptions>
      
      <div v-if="isScan" style="margin: 20px 0">
        <el-alert title="扫码复核" type="info" :closable="false">
          <template #default>
            <div style="margin-top: 10px">
              <el-input 
                v-model="scanBarcode" 
                placeholder="输入或扫描商品条码" 
                size="large"
                style="width: 400px; margin-right: 10px"
                @keyup.enter="handleScanBarcode"
              />
              <el-button type="primary" size="large" @click="handleScanBarcode">确认扫描</el-button>
            </div>
            <div v-if="scanResult" style="margin-top: 10px">
              <el-tag :type="scanResult.success ? 'success' : 'danger'">
                {{ scanResult.message }}
              </el-tag>
              <span v-if="scanResult.product" style="margin-left: 10px">
                {{ scanResult.product.name }} - 
                已扫 {{ scanResult.scanned }}/{{ scanResult.expected }}
              </span>
            </div>
          </template>
        </el-alert>
      </div>
      
      <h4 style="margin: 20px 0 10px">复核明细</h4>
      <el-table :data="detail.items || []" border size="small">
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="barcode" label="条码" width="150" />
        <el-table-column prop="expected_qty" label="期望数量" width="100" />
        <el-table-column prop="actual_qty" label="实际数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">
              {{ getReviewItemStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button 
          v-if="isScan" 
          type="success" 
          @click="completeReview"
          :disabled="!canComplete"
        >
          完成复核
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="selectOrderDialog" title="选择订单开始复核" width="600px">
      <el-table :data="pendingOrders" border stripe @selection-change="handleOrderSelect">
        <el-table-column type="radio" width="55" />
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="customer_name" label="客户" width="100" />
        <el-table-column prop="total_qty" label="数量" width="80" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="selectOrderDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedOrder" @click="startReview">
          开始复核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { review, orders } from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const selectOrderDialog = ref(false)
const dialogTitle = ref('')
const isScan = ref(false)
const scanBarcode = ref('')
const scanResult = ref(null)
const pendingOrders = ref([])
const selectedOrder = ref(null)

const searchForm = reactive({
  status: undefined
})

const detail = ref({ items: [] })

const canComplete = computed(() => {
  if (!detail.value.items) return false
  return detail.value.items.every(item => item.status === 1)
})

const getStatusType = (status) => {
  const types = ['warning', 'success', 'danger']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待复核', '复核通过', '复核异常']
  return texts[status] || '未知'
}

const getReviewItemStatus = (status) => {
  const texts = ['待扫', '通过', '异常']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    const data = await review.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const loadPendingOrders = async () => {
  try {
    pendingOrders.value = await orders.list({ status: 3 })
  } catch (error) {
    console.error('加载待复核订单失败')
  }
}

const resetSearch = () => {
  searchForm.status = undefined
  loadData()
}

const handleOrderSelect = (selection) => {
  selectedOrder.value = selection[0] || null
}

const startReview = async () => {
  try {
    const result = await review.start({ order_id: selectedOrder.value.id })
    ElMessage.success('复核开始')
    selectOrderDialog.value = false
    await openScan(result.id)
  } catch (error) {
    ElMessage.error('开始复核失败')
  }
}

const handleView = async (row) => {
  isScan.value = false
  dialogTitle.value = '复核详情'
  detail.value = await review.get(row.id)
  dialogVisible.value = true
}

const openScan = async (id) => {
  isScan.value = true
  dialogTitle.value = '扫码复核'
  scanBarcode.value = ''
  scanResult.value = null
  detail.value = await review.get(id)
  dialogVisible.value = true
}

const handleScan = () => {
  loadPendingOrders()
  selectOrderDialog.value = true
}

const handleScanBarcode = async () => {
  if (!scanBarcode.value) {
    ElMessage.warning('请输入条码')
    return
  }
  
  try {
    const result = await review.scan(detail.value.id, { barcode: scanBarcode.value })
    scanResult.value = { success: true, ...result }
    scanBarcode.value = ''
    detail.value = await review.get(detail.value.id)
  } catch (error) {
    scanResult.value = { 
      success: false, 
      message: error.response?.data?.error || '扫描失败' 
    }
  }
}

const completeReview = async () => {
  try {
    await review.complete(detail.value.id)
    ElMessage.success('复核完成')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('复核完成失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
