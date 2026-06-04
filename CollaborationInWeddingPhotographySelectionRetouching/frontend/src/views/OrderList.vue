<template>
  <div class="order-list">
    <el-card class="filter-card">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号/新人姓名"
          clearable
          style="width: 240px"
          @keyup.enter="fetchOrders"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="订单状态"
          clearable
          style="width: 160px"
          @change="fetchOrders"
        >
          <el-option
            v-for="status in orderStatusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
        <el-button type="primary" @click="fetchOrders">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
    </el-card>

    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ totalOrders }}</div>
            <div class="stat-label">全部订单</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item selecting">
            <div class="stat-number">{{ selectingCount }}</div>
            <div class="stat-label">选片中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item retouching">
            <div class="stat-number">{{ retouchingCount }}</div>
            <div class="stat-label">修图中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item completed">
            <div class="stat-number">{{ completedCount }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <el-button v-if="isAdmin" type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建订单
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="orders"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单编号" width="160" />
        <el-table-column prop="coupleName" label="新人姓名" width="140" />
        <el-table-column prop="packageName" label="套餐名称" min-width="160" />
        <el-table-column label="照片数量" width="120">
          <template #default="{ row }">
            {{ row.selectedCount || 0 }} / {{ row.totalPhotos }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ row.price?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isCouple && row.status === 'paid'"
              type="primary"
              size="small"
              @click="startSelection(row.id)"
            >
              开始选片
            </el-button>
            <el-button
              v-if="row.status === 'selecting'"
              type="primary"
              size="small"
              @click="goToSelection(row.id)"
            >
              进入选片
            </el-button>
            <el-button
              v-if="isCouple && row.status === 'reviewing'"
              type="success"
              size="small"
              @click="goToReview(row.id)"
            >
              验收修图
            </el-button>
            <el-button
              v-if="isRetoucher && row.status === 'retouching'"
              type="warning"
              size="small"
              @click="goToRetouch(row.id)"
            >
              修图任务
            </el-button>
            <el-button size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchOrders"
          @current-change="fetchOrders"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      title="新建订单"
      width="500px"
    >
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="新人姓名" required>
          <el-input v-model="orderForm.coupleName" placeholder="请输入新人姓名" />
        </el-form-item>
        <el-form-item label="套餐名称" required>
          <el-input v-model="orderForm.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="总照片数">
          <el-input-number v-model="orderForm.totalPhotos" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="orderForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="拍摄日期">
          <el-date-picker
            v-model="orderForm.shootDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="拍摄地点">
          <el-input v-model="orderForm.location" placeholder="请输入拍摄地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createOrder">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { OrderStatus } from '@/types'
import type { Order } from '@/types'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const loading = computed(() => orderStore.loading)
const orders = computed(() => orderStore.orders)
const total = computed(() => orderStore.total)

const isAdmin = computed(() => userStore.isAdmin)
const isCouple = computed(() => userStore.isCouple)
const isRetoucher = computed(() => userStore.isRetoucher)

const searchKeyword = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const orderForm = reactive({
  coupleName: '',
  packageName: '',
  totalPhotos: 100,
  price: 5000,
  shootDate: '',
  location: ''
})

const orderStatusOptions = [
  { value: OrderStatus.PENDING, label: '待付款' },
  { value: OrderStatus.PAID, label: '已付款' },
  { value: OrderStatus.SELECTING, label: '选片中' },
  { value: OrderStatus.SELECTED, label: '选片完成' },
  { value: OrderStatus.RETOUCHING, label: '修图中' },
  { value: OrderStatus.REVIEWING, label: '验收中' },
  { value: OrderStatus.COMPLETED, label: '已完成' },
  { value: OrderStatus.CANCELLED, label: '已取消' }
]

const totalOrders = computed(() => total.value)
const selectingCount = computed(() => orders.value.filter(o => o.status === OrderStatus.SELECTING).length)
const retouchingCount = computed(() => orders.value.filter(o => o.status === OrderStatus.RETOUCHING || o.status === OrderStatus.REVIEWING).length)
const completedCount = computed(() => orders.value.filter(o => o.status === OrderStatus.COMPLETED).length)

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [OrderStatus.PENDING]: 'info',
    [OrderStatus.PAID]: 'warning',
    [OrderStatus.SELECTING]: 'primary',
    [OrderStatus.SELECTED]: 'warning',
    [OrderStatus.RETOUCHING]: 'warning',
    [OrderStatus.REVIEWING]: 'primary',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    [OrderStatus.PENDING]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.SELECTING]: '选片中',
    [OrderStatus.SELECTED]: '选片完成',
    [OrderStatus.RETOUCHING]: '修图中',
    [OrderStatus.REVIEWING]: '验收中',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消'
  }
  return labelMap[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const fetchOrders = async () => {
  await orderStore.fetchOrders({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: statusFilter.value || undefined
  })
}

const resetFilter = () => {
  searchKeyword.value = ''
  statusFilter.value = ''
  pagination.page = 1
  fetchOrders()
}

const startSelection = async (orderId: number) => {
  await orderStore.startSelection(orderId)
  await fetchOrders()
  router.push(`/photo-selection?orderId=${orderId}`)
}

const goToSelection = (orderId: number) => {
  router.push(`/photo-selection?orderId=${orderId}`)
}

const goToReview = (orderId: number) => {
  router.push(`/review-retouch?orderId=${orderId}`)
}

const goToRetouch = (orderId: number) => {
  router.push(`/retouch-tasks?orderId=${orderId}`)
}

const viewDetail = (row: Order) => {
  console.log('View detail:', row)
}

const createOrder = async () => {
  try {
    await orderStore.createOrder(orderForm)
    showCreateDialog.value = false
    fetchOrders()
  } catch {}
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card :deep(.el-card__body) {
  padding: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
}

.stat-item.selecting {
  background: #ecf5ff;
}

.stat-item.retouching {
  background: #fdf6ec;
}

.stat-item.completed {
  background: #f0f9eb;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.pagination-wrapper {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
