<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #409EFF"><Box /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #67C23A"><Location /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalInventory }}</div>
              <div class="stat-label">库存总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #E6A23C"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingOrders }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #F56C6C"><Van /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayOutbound }}</div>
              <div class="stat-label">今日出库</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最新订单</span>
          </template>
          <el-table :data="recentOrders" size="small">
            <el-table-column prop="order_no" label="订单号" width="150" />
            <el-table-column prop="customer_name" label="客户" />
            <el-table-column prop="total_qty" label="数量" width="80" />
            <el-table-column prop="total_amount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.total_amount }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>库存预警</span>
          </template>
          <el-table :data="lowStock" size="small">
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="location_code" label="库位" width="100" />
            <el-table-column prop="quantity" label="库存" width="80">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.quantity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Box, Location, Document, Van } from '@element-plus/icons-vue'
import { products, inventory, orders } from '../api'

const stats = ref({
  totalProducts: 0,
  totalInventory: 0,
  pendingOrders: 0,
  todayOutbound: 0
})

const recentOrders = ref([])
const lowStock = ref([])

const getStatusType = (status) => {
  const types = ['info', 'warning', 'primary', 'success', '']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待处理', '已生成波次', '拣货中', '待复核', '已完成']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const [productList, inventoryList, orderList] = await Promise.all([
      products.list(),
      inventory.list(),
      orders.list({ status: 0 })
    ])
    
    stats.value.totalProducts = productList.length
    stats.value.totalInventory = inventoryList.reduce((sum, item) => sum + item.quantity, 0)
    stats.value.pendingOrders = orderList.length
    
    const allOrders = await orders.list()
    recentOrders.value = allOrders.slice(0, 5)
    
    lowStock.value = inventoryList.filter(item => item.quantity < 50).slice(0, 5)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}
.stat-content {
  display: flex;
  align-items: center;
}
.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>
