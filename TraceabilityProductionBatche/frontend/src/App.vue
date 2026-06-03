<template>
  <div class="app-container">
    <el-container>
      <el-header class="header">
        <h1>食品厂生产批次溯源系统</h1>
        <p class="subtitle">Recall Simulation - 召回模拟工具</p>
      </el-header>
      
      <el-main class="main">
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon material">📦</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.materialBatches }}</div>
                <div class="stat-label">原料批次</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon workorder">🏭</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.workOrders }}</div>
                <div class="stat-label">生产工单</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon product">🎁</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.productBatches }}</div>
                <div class="stat-label">成品批次</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-icon distributor">🚚</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.distributors }}</div>
                <div class="stat-label">经销商</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-tabs v-model="activeTab" class="trace-tabs">
          <el-tab-pane label="原料正向溯源（召回模拟）" name="forward">
            <RecallSimulation />
          </el-tab-pane>
          <el-tab-pane label="成品反向溯源（原料追溯）" name="backward">
            <BackwardTrace />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import RecallSimulation from './components/RecallSimulation.vue'
import BackwardTrace from './components/BackwardTrace.vue'

const activeTab = ref('forward')
const stats = ref({
  materialBatches: 0,
  workOrders: 0,
  productBatches: 0,
  distributors: 0
})

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/stats')
    if (res.data.success) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('获取统计数据失败', err)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 30px 20px;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.main {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
}

.stat-icon.material {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.workorder {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.product {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.distributor {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.trace-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
