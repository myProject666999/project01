<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>出库报关</span>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待出库" :value="0" />
            <el-option label="已出库" :value="1" />
            <el-option label="已发货" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="outbound_no" label="出库单号" width="180" />
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="review_no" label="复核单号" width="150" />
        <el-table-column prop="customer_name" label="客户" width="100" />
        <el-table-column prop="customs_status" label="报关状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getCustomsType(row.customs_status)">{{ getCustomsText(row.customs_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="logistics_no" label="物流单号" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              size="small" 
              type="primary" 
              v-if="row.status === 0" 
              @click="handleConfirm(row)"
            >
              出库确认
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              v-if="row.status === 1" 
              @click="handleShip(row)"
            >
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div style="margin-top: 20px">
        <el-button type="primary" @click="handleCreate">创建出库单</el-button>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-descriptions :column="2" border v-if="detail.id">
        <el-descriptions-item label="出库单号">{{ detail.outbound_no }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detail.order_no }}</el-descriptions-item>
        <el-descriptions-item label="复核单号">{{ detail.review_no }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ detail.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.customer_phone }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.id_card }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail.address }}</el-descriptions-item>
        <el-descriptions-item label="报关状态">
          <el-tag :type="getCustomsType(detail.customs_status)">{{ getCustomsText(detail.customs_status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物流单号">{{ detail.logistics_no || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detail.operator || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 style="margin: 20px 0 10px">商品明细</h4>
      <el-table :data="detail.items || []" border size="small">
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="country" label="原产国" width="100" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
      </el-table>
      
      <div v-if="isConfirm" style="margin-top: 20px">
        <el-form :model="outboundForm" label-width="100px">
          <el-form-item label="操作员">
            <el-input v-model="outboundForm.operator" />
          </el-form-item>
          <el-form-item label="物流单号">
            <el-input v-model="outboundForm.logistics_no" />
          </el-form-item>
        </el-form>
      </div>
      
      <div v-if="detail.id && detail.status === 0" style="margin-top: 20px">
        <h4>报关状态更新</h4>
        <el-radio-group v-model="customsStatus">
          <el-radio :value="0">待报关</el-radio>
          <el-radio :value="1">报关中</el-radio>
          <el-radio :value="2">已通关</el-radio>
          <el-radio :value="3">报关异常</el-radio>
        </el-radio-group>
        <el-button type="primary" style="margin-left: 20px" @click="updateCustoms">
          更新报关状态
        </el-button>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="isConfirm" type="primary" @click="confirmOutbound">确认出库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="selectOrderDialog" title="选择订单创建出库单" width="600px">
      <el-table :data="completedOrders" border stripe @selection-change="handleOrderSelect">
        <el-table-column type="radio" width="55" />
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="customer_name" label="客户" width="100" />
        <el-table-column prop="total_qty" label="数量" width="80" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="selectOrderDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedOrder" @click="createOutbound">
          创建出库单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { outbound, orders, review as reviewApi } from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const selectOrderDialog = ref(false)
const dialogTitle = ref('')
const isConfirm = ref(false)
const completedOrders = ref([])
const selectedOrder = ref(null)
const customsStatus = ref(0)

const searchForm = reactive({
  status: undefined
})

const detail = ref({ items: [] })
const outboundForm = reactive({
  operator: '',
  logistics_no: ''
})

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待出库', '已出库', '已发货']
  return texts[status] || '未知'
}

const getCustomsType = (status) => {
  const types = ['warning', 'primary', 'success', 'danger']
  return types[status] || ''
}

const getCustomsText = (status) => {
  const texts = ['待报关', '报关中', '已通关', '报关异常']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    const data = await outbound.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const loadCompletedOrders = async () => {
  try {
    completedOrders.value = await orders.list({ status: 4 })
  } catch (error) {
    console.error('加载已完成订单失败')
  }
}

const resetSearch = () => {
  searchForm.status = undefined
  loadData()
}

const handleOrderSelect = (selection) => {
  selectedOrder.value = selection[0] || null
}

const handleCreate = () => {
  loadCompletedOrders()
  selectOrderDialog.value = true
}

const createOutbound = async () => {
  try {
    await outbound.create({
      order_id: selectedOrder.value.id,
      review_id: null
    })
    ElMessage.success('出库单创建成功')
    selectOrderDialog.value = false
    loadData()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleView = async (row) => {
  isConfirm.value = false
  dialogTitle.value = '出库单详情'
  detail.value = await outbound.get(row.id)
  customsStatus.value = detail.value.customs_status
  dialogVisible.value = true
}

const handleConfirm = async (row) => {
  isConfirm.value = true
  dialogTitle.value = '出库确认'
  detail.value = await outbound.get(row.id)
  outboundForm.operator = ''
  outboundForm.logistics_no = ''
  dialogVisible.value = true
}

const confirmOutbound = async () => {
  try {
    await outbound.confirm(detail.value.id, outboundForm)
    ElMessage.success('出库确认成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

const handleShip = async (row) => {
  try {
    await outbound.ship(row.id)
    ElMessage.success('发货成功')
    loadData()
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

const updateCustoms = async () => {
  try {
    await outbound.customs(detail.value.id, { customs_status: customsStatus.value })
    ElMessage.success('报关状态更新成功')
    detail.value = await outbound.get(detail.value.id)
  } catch (error) {
    ElMessage.error('更新失败')
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
