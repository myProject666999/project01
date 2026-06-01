<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon order">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.orders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon processing">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.processing }}</div>
              <div class="stat-label">加工任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon delivery">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.deliveries }}</div>
              <div class="stat-label">配送中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon customer">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customers }}</div>
              <div class="stat-label">客户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>订单趋势</span>
          </template>
          <div ref="chartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>菜品销量排行</span>
          </template>
          <div ref="chartRef2" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>近期订单</span>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="order_no" label="订单编号" width="180" />
            <el-table-column prop="customer.name" label="客户名称" />
            <el-table-column prop="delivery_date" label="配送日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.delivery_date) }}
              </template>
            </el-table-column>
            <el-table-column prop="total_amount" label="金额" width="100">
              <template #default="{ row }">
                ¥{{ row.total_amount }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
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
import * as echarts from 'echarts'
import { getOrders, getCustomers, getProcessingTasks, getDeliveries } from '@/api'

const stats = ref({
  orders: 0,
  processing: 0,
  deliveries: 0,
  customers: 0
})

const recentOrders = ref([])
const chartRef = ref(null)
const chartRef2 = ref(null)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'primary', 'success', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待确认', '已确认', '加工中', '配送中', '已完成', '已取消']
  return texts[status] || '未知'
}

const loadStats = async () => {
  try {
    const [ordersRes, customersRes, processingRes, deliveriesRes] = await Promise.all([
      getOrders(),
      getCustomers(),
      getProcessingTasks(),
      getDeliveries()
    ])
    
    stats.value.orders = ordersRes.data?.length || 0
    stats.value.customers = customersRes.data?.length || 0
    stats.value.processing = processingRes.data?.length || 0
    stats.value.deliveries = deliveriesRes.data?.filter(d => d.status === 1).length || 0
    
    recentOrders.value = ordersRes.data?.slice(0, 5) || []
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const initCharts = () => {
  const chart1 = echarts.init(chartRef.value)
  chart1.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [12, 19, 15, 22, 18, 25, 20],
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 }
    }]
  })

  const chart2 = echarts.init(chartRef2.value)
  chart2.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['西红柿丁', '土豆丝', '鸡丝', '黄瓜片', '胡萝卜丁']
    },
    series: [{
      data: [320, 280, 250, 200, 180],
      type: 'bar',
      itemStyle: { color: '#1890ff' }
    }]
  })
}

onMounted(() => {
  loadStats()
  initCharts()
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
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
}

.stat-icon.order {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.processing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.delivery {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.customer {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
</style>
