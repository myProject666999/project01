<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="score-card blue">
          <div class="card-title">总会话数</div>
          <div class="card-value">{{ stats.totalConversations }}</div>
          <div class="card-trend">较昨日 +12%</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card green">
          <div class="card-title">质检完成</div>
          <div class="card-value">{{ stats.qualityCompleted }}</div>
          <div class="card-trend">完成率 85%</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card orange">
          <div class="card-title">违规数量</div>
          <div class="card-value">{{ stats.violationCount }}</div>
          <div class="card-trend">待处理 {{ stats.pendingViolation }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card red">
          <div class="card-title">申诉待审</div>
          <div class="card-value">{{ stats.pendingAppeal }}</div>
          <div class="card-trend">需及时处理</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="page-container">
          <h3 style="margin-bottom: 20px;">质检趋势</h3>
          <div ref="chartRef" style="height: 300px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="page-container">
          <h3 style="margin-bottom: 20px;">违规类型分布</h3>
          <div ref="pieChartRef" style="height: 300px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <div class="page-container">
          <h3 style="margin-bottom: 20px;">客服评分TOP5</h3>
          <el-table :data="topCsList" style="width: 100%;">
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.rank <= 3 ? 'warning' : 'info'">{{ scope.row.rank }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="csName" label="客服姓名" />
            <el-table-column prop="totalScore" label="综合得分" />
            <el-table-column prop="totalConversationCount" label="会话数" />
            <el-table-column prop="avgSatisfactionScore" label="满意度" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { scoreApi } from '@/api'

const chartRef = ref(null)
const pieChartRef = ref(null)

const stats = reactive({
  totalConversations: 12580,
  qualityCompleted: 10693,
  violationCount: 328,
  pendingViolation: 45,
  pendingAppeal: 12
})

const topCsList = ref([
  { rank: 1, csName: '张三', totalScore: 95.5, totalConversationCount: 256, avgSatisfactionScore: 92 },
  { rank: 2, csName: '李四', totalScore: 93.2, totalConversationCount: 234, avgSatisfactionScore: 89 },
  { rank: 3, csName: '王五', totalScore: 91.8, totalConversationCount: 210, avgSatisfactionScore: 88 },
  { rank: 4, csName: '赵六', totalScore: 89.5, totalConversationCount: 198, avgSatisfactionScore: 85 },
  { rank: 5, csName: '钱七', totalScore: 87.3, totalConversationCount: 187, avgSatisfactionScore: 83 }
])

const loadRankingData = async () => {
  try {
    const res = await scoreApi.getRanking('')
    if (res.data && res.data.length > 0) {
      topCsList.value = res.data.slice(0, 5).map((item, index) => ({
        ...item,
        rank: index + 1
      }))
    }
  } catch (e) {
    console.log('使用模拟数据')
  }
}

onMounted(() => {
  loadRankingData()
  initChart()
  initPieChart()
})

const initChart = () => {
  const chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['质检数量', '违规数量']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '质检数量',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true
      },
      {
        name: '违规数量',
        type: 'line',
        data: [12, 15, 8, 18, 6, 25, 20],
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}

const initPieChart = () => {
  const chart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '违规类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 1048, name: '响应超时' },
          { value: 735, name: '敏感词' },
          { value: 580, name: '服务态度' },
          { value: 484, name: '流程规范' },
          { value: 300, name: '其他' }
        ]
      }
    ]
  }
  chart.setOption(option)
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.card-trend {
  font-size: 12px;
  opacity: 0.8;
}
</style>
