<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total_collections || 0 }}</div>
              <div class="stat-label">藏品总数</div>
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
              <div class="stat-value">{{ statistics.status_counts?.['在库'] || 0 }}</div>
              <div class="stat-label">在库藏品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Transfer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending_movements || 0 }}</div>
              <div class="stat-label">待审批移动</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.ongoing_inventory || 0 }}</div>
              <div class="stat-label">进行中盘点</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>藏品状态分布</span>
            </div>
          </template>
          <div class="status-distribution">
            <div v-for="(count, status) in statistics.status_counts" :key="status" class="status-item">
              <span class="status-name">{{ status }}</span>
              <el-progress :percentage="Math.round(count / (statistics.total_collections || 1) * 100)" :stroke-width="12" />
              <span class="status-count">{{ count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>文物级别分布</span>
            </div>
          </template>
          <div class="level-distribution">
            <div v-for="(count, level) in statistics.level_counts" :key="level" class="level-item">
              <span class="level-name">{{ level }}</span>
              <el-progress :percentage="Math.round(count / (statistics.total_collections || 1) * 100)" :stroke-width="12" status="warning" />
              <span class="level-count">{{ count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="quick-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/collections')">
              <el-icon><Box /></el-icon>
              藏品管理
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/movements')">
              <el-icon><Transfer /></el-icon>
              移动管理
            </el-button>
            <el-button type="warning" size="large" @click="$router.push('/inventory')">
              <el-icon><CircleCheck /></el-icon>
              盘点管理
            </el-button>
            <el-button type="info" size="large" @click="$router.push('/status-records')">
              <el-icon><Document /></el-icon>
              状态记录
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStatistics } from '@/api'

const statistics = ref({
  total_collections: 0,
  status_counts: {},
  level_counts: {},
  pending_movements: 0,
  ongoing_inventory: 0
})

const loadStatistics = async () => {
  try {
    statistics.value = await getStatistics()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadStatistics()
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
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-right: 20px;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.status-distribution,
.level-distribution {
  padding: 10px 0;
}

.status-item,
.level-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.status-name,
.level-name {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.status-count,
.level-count {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #303133;
}

.quick-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px 0;
}

.quick-actions .el-button {
  width: 180px;
  height: 60px;
  font-size: 16px;
}

.quick-actions .el-icon {
  margin-right: 8px;
}
</style>
