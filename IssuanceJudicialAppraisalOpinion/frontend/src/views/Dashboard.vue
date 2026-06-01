<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">委托总数</p>
              <p class="stat-value">{{ stats.total }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">进行中</p>
              <p class="stat-value">{{ stats.inProgress }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">已完成</p>
              <p class="stat-value">{{ stats.completed }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">待复核</p>
              <p class="stat-value">{{ stats.pendingReview }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
          <span>最近委托</span>
          <el-button type="primary" link @click="goToEntrustment">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentList" v-loading="loading" stripe>
        <el-table-column prop="entrustNo" label="委托编号" width="180" />
        <el-table-column prop="caseName" label="案件名称" min-width="200" />
        <el-table-column prop="appraisalType" label="鉴定类型" width="150" />
        <el-table-column prop="entrustor" label="委托人" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entrustDate" label="委托日期" width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Loading, CircleCheck, Bell } from '@element-plus/icons-vue'
import { getEntrustmentList } from '@/api/entrustment'

const router = useRouter()
const loading = ref(false)

const stats = reactive({
  total: 0,
  inProgress: 0,
  completed: 0,
  pendingReview: 0
})

const recentList = ref([])

const statusMap = {
  pending: { text: '待受理', type: 'info' },
  accepted: { text: '已受理', type: 'primary' },
  inProgress: { text: '进行中', type: 'warning' },
  completed: { text: '已完成', type: 'success' },
  pendingReview: { text: '待复核', type: 'danger' },
  reviewed: { text: '已复核', type: 'success' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getEntrustmentList({ pageSize: 10, pageNum: 1 })
    if (res.code === 200) {
      const list = res.data?.list || []
      recentList.value = list
      stats.total = res.data?.total || 0
      stats.inProgress = list.filter(item => item.status === 'inProgress' || item.status === 'accepted').length
      stats.completed = list.filter(item => item.status === 'completed' || item.status === 'reviewed').length
      stats.pendingReview = list.filter(item => item.status === 'pendingReview').length
    }
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

const goToEntrustment = () => {
  router.push('/entrustment')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 30px;
  color: #fff;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.stat-value {
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.recent-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}
</style>
