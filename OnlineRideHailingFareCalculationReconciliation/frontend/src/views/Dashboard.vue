<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">今日订单数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.platformAmount }}</div>
              <div class="stat-label">平台金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orange">
              <el-icon size="30"><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.localAmount }}</div>
              <div class="stat-label">本地计算金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon red">
              <el-icon size="30"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.diffOrders }}</div>
              <div class="stat-label">差异订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>计价规则</span>
            </div>
          </template>
          <el-descriptions :column="2" border v-if="pricingRule">
            <el-descriptions-item label="起步价">{{ pricingRule.base_fare }}元</el-descriptions-item>
            <el-descriptions-item label="起步里程">{{ pricingRule.base_km }}公里</el-descriptions-item>
            <el-descriptions-item label="每公里单价">{{ pricingRule.per_km_fare }}元</el-descriptions-item>
            <el-descriptions-item label="免费等候">{{ pricingRule.free_wait_minutes }}分钟</el-descriptions-item>
            <el-descriptions-item label="等候单价">{{ pricingRule.per_minute_wait_fare }}元/分钟</el-descriptions-item>
            <el-descriptions-item label="夜间加价">{{ (pricingRule.night_surcharge_rate * 100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="夜间时段" :span="2">
              {{ pricingRule.night_start_hour }}:00 - {{ pricingRule.night_end_hour }}:00
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速入口</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goTo('/driver/daily-report')">
              <el-icon><Tickets /></el-icon>
              查看流水清单
            </el-button>
            <el-button type="success" @click="goTo('/admin/reconciliation')">
              <el-icon><Check /></el-icon>
              对账管理
            </el-button>
            <el-button type="warning" @click="goTo('/admin/orders')">
              <el-icon><Upload /></el-icon>
              导入订单
            </el-button>
            <el-button type="danger" @click="goTo('/admin/appeals')">
              <el-icon><ChatDotRound /></el-icon>
              申诉处理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pricingApi } from '@/api'

const router = useRouter()

const stats = ref({
  totalOrders: 0,
  platformAmount: 0,
  localAmount: 0,
  diffOrders: 0
})

const pricingRule = ref(null)

onMounted(() => {
  loadPricingRule()
})

const loadPricingRule = async () => {
  try {
    const res = await pricingApi.getActive()
    pricingRule.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
}
</style>
