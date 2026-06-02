<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">数据概览</h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBatches }}</div>
              <div class="stat-label">总批次</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalPackages }}</div>
              <div class="stat-label">总包裹</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCouriers }}</div>
              <div class="stat-label">派送员</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon red">
              <el-icon :size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingExceptions }}</div>
              <div class="stat-label">待处理异常</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="table-container">
          <template #header>
            <div class="card-header">
              <span>最近批次</span>
              <el-button type="primary" text @click="$router.push('/batches')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentBatches" v-loading="loading">
            <el-table-column prop="batch_no" label="批次号" />
            <el-table-column prop="total_packages" label="包裹数" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="table-container">
          <template #header>
            <div class="card-header">
              <span>待处理异常</span>
              <el-button type="primary" text @click="$router.push('/exceptions')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentExceptions" v-loading="loading">
            <el-table-column prop="exception_type" label="异常类型">
              <template #default="{ row }">
                <el-tag :type="getExceptionType(row.exception_type)">
                  {{ getExceptionText(row.exception_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="created_at" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { batchAPI, courierAPI, exceptionAPI } from '../api'

const loading = ref(false)
const stats = ref({
  totalBatches: 0,
  totalPackages: 0,
  totalCouriers: 0,
  pendingExceptions: 0
})
const recentBatches = ref([])
const recentExceptions = ref([])

const getStatusType = (status) => {
  const types = ['', 'success', 'warning', 'primary', 'success']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '已到仓', '分配中', '派送中', '已完成']
  return texts[status] || '未知'
}

const getExceptionType = (type) => {
  const types = {
    'reject': 'danger',
    'no_one': 'warning',
    'wrong_address': 'danger',
    'damaged': 'danger',
    'lost': 'danger'
  }
  return types[type] || 'info'
}

const getExceptionText = (type) => {
  const texts = {
    'reject': '拒收',
    'no_one': '无人在家',
    'wrong_address': '地址错误',
    'damaged': '破损',
    'lost': '丢失'
  }
  return texts[type] || type
}

const loadData = async () => {
  loading.value = true
  try {
    const [batchRes, courierRes, exceptionRes] = await Promise.all([
      batchAPI.list({ page: 1, page_size: 5 }),
      courierAPI.list({ page: 1, page_size: 1 }),
      exceptionAPI.list({ page: 1, page_size: 5, status: 1 })
    ])

    stats.value.totalBatches = batchRes.data?.total || 0
    stats.value.totalCouriers = courierRes.data?.total || 0
    stats.value.pendingExceptions = exceptionRes.data?.total || 0
    recentBatches.value = batchRes.data?.list || []
    recentExceptions.value = exceptionRes.data?.list || []

    let totalPackages = 0
    recentBatches.value.forEach(b => { totalPackages += b.total_packages || 0 })
    stats.value.totalPackages = totalPackages
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.red { background: linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%); color: #ff6e7f; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
