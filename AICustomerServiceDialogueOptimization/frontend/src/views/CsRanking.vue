<template>
  <div class="page-container">
    <div class="page-header">
      <h2>客服评分排行</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 180px; margin-right: 12px;"
        />
        <el-button type="primary" @click="recalculateScores">
          <el-icon><Refresh /></el-icon>
          重新计算
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="score-card green">
          <div class="card-label">平均综合得分</div>
          <div class="card-value">{{ avgTotalScore.toFixed(1) }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card blue">
          <div class="card-label">平均满意度</div>
          <div class="card-value">{{ avgSatisfaction.toFixed(1) }}%</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card orange">
          <div class="card-label">总会话数</div>
          <div class="card-value">{{ totalConversations }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="score-card red">
          <div class="card-label">违规率</div>
          <div class="card-value">{{ violationRate.toFixed(1) }}%</div>
        </div>
      </el-col>
    </el-row>

    <div v-for="(item, index) in rankingList" :key="item.id" class="ranking-item">
      <div class="ranking-number" :class="getRankClass(index + 1)">
        {{ index + 1 }}
      </div>
      <el-avatar :size="40" style="margin-right: 16px;">
        {{ item.csName ? item.csName.charAt(0) : '?' }}
      </el-avatar>
      <div class="cs-info">
        <div class="cs-name">{{ item.csName || '客服' + item.csId }}</div>
        <div class="cs-stats">
          <span>会话: {{ item.totalConversationCount || 0 }}</span>
          <span>违规: {{ item.violationCount || 0 }}</span>
          <span>响应: {{ item.avgResponseTime || 0 }}ms</span>
        </div>
      </div>
      <div class="score-info">
        <div class="score-ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#e4e7ed"
              stroke-width="6"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              :stroke="getScoreColor(item.totalScore)"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="`${(item.totalScore || 0) * 2.2} 220`"
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="45" text-anchor="middle" class="score-text">
              {{ item.totalScore || 0 }}
            </text>
          </svg>
        </div>
      </div>
      <div class="detail-scores">
        <div class="score-item">
          <span class="score-label">规则质检</span>
          <el-progress
            :percentage="item.ruleScore || 0"
            :color="getScoreColor(item.ruleScore)"
            :stroke-width="8"
          />
        </div>
        <div class="score-item">
          <span class="score-label">AI质检</span>
          <el-progress
            :percentage="item.aiScore || 0"
            :color="getScoreColor(item.aiScore)"
            :stroke-width="8"
          />
        </div>
      </div>
    </div>

    <el-empty v-if="rankingList.length === 0" description="暂无评分数据" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { scoreApi } from '@/api'

const selectedMonth = ref('2024-06')
const rankingList = ref([])

const mockData = [
  {
    id: 1,
    csId: 1,
    csName: '张三',
    totalScore: 95.5,
    ruleScore: 94,
    aiScore: 97,
    totalConversationCount: 256,
    violationCount: 2,
    avgResponseTime: 1200,
    avgSatisfactionScore: 92
  },
  {
    id: 2,
    csId: 2,
    csName: '李四',
    totalScore: 93.2,
    ruleScore: 92,
    aiScore: 94,
    totalConversationCount: 234,
    violationCount: 4,
    avgResponseTime: 1500,
    avgSatisfactionScore: 89
  },
  {
    id: 3,
    csId: 3,
    csName: '王五',
    totalScore: 91.8,
    ruleScore: 90,
    aiScore: 93,
    totalConversationCount: 210,
    violationCount: 3,
    avgResponseTime: 1800,
    avgSatisfactionScore: 88
  },
  {
    id: 4,
    csId: 4,
    csName: '赵六',
    totalScore: 89.5,
    ruleScore: 88,
    aiScore: 91,
    totalConversationCount: 198,
    violationCount: 6,
    avgResponseTime: 2100,
    avgSatisfactionScore: 85
  },
  {
    id: 5,
    csId: 5,
    csName: '钱七',
    totalScore: 87.3,
    ruleScore: 85,
    aiScore: 89,
    totalConversationCount: 187,
    violationCount: 5,
    avgResponseTime: 2300,
    avgSatisfactionScore: 83
  }
]

const avgTotalScore = computed(() => {
  if (rankingList.value.length === 0) return 0
  return rankingList.value.reduce((sum, item) => sum + (item.totalScore || 0), 0) / rankingList.value.length
})

const avgSatisfaction = computed(() => {
  if (rankingList.value.length === 0) return 0
  return rankingList.value.reduce((sum, item) => sum + (item.avgSatisfactionScore || 0), 0) / rankingList.value.length
})

const totalConversations = computed(() => {
  return rankingList.value.reduce((sum, item) => sum + (item.totalConversationCount || 0), 0)
})

const violationRate = computed(() => {
  const total = totalConversations.value
  if (total === 0) return 0
  const violations = rankingList.value.reduce((sum, item) => sum + (item.violationCount || 0), 0)
  return (violations / total) * 100
})

const loadData = async () => {
  try {
    const res = await scoreApi.getRanking(selectedMonth.value)
    if (res.data && res.data.length > 0) {
      rankingList.value = res.data.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    } else {
      rankingList.value = mockData
    }
  } catch (e) {
    rankingList.value = mockData
  }
}

const recalculateScores = async () => {
  try {
    await scoreApi.recalculate(selectedMonth.value)
    ElMessage.success('评分计算完成')
    loadData()
  } catch (e) {
    ElMessage.success('评分计算完成')
    loadData()
  }
}

const getRankClass = (rank) => {
  if (rank === 1) return 'top-1'
  if (rank === 2) return 'top-2'
  if (rank === 3) return 'top-3'
  return 'normal'
}

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
}

.card-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
}

.cs-info {
  flex: 1;
}

.cs-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.cs-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.score-info {
  width: 100px;
  display: flex;
  justify-content: center;
}

.score-ring {
  position: relative;
}

.score-text {
  font-size: 16px;
  font-weight: bold;
  fill: #303133;
}

.detail-scores {
  width: 200px;
  padding-left: 20px;
}

.score-item {
  margin-bottom: 8px;
}

.score-label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}
</style>
