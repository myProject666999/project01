<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>会话详情 - {{ conversation.sessionId }}</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>对话内容</span>
              <el-tag :type="getEmotionTagType(conversation.aiEmotion)">
                情绪: {{ getEmotionText(conversation.aiEmotion) }}
              </el-tag>
            </div>
          </template>
          <div class="chat-container">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['chat-message', msg.senderType === 1 ? 'customer' : 'cs']"
            >
              <div class="message-bubble">
                <div class="message-sender">{{ msg.senderName }}</div>
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.sendTime) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <span>质检结果 - 规则质检</span>
          </template>
          <div v-for="item in ruleResults" :key="item.id" class="quality-result-item">
            <div class="result-header">
              <span>{{ item.ruleName }}</span>
              <el-tag :type="item.isPass === 1 ? 'success' : 'danger'" size="small">
                {{ item.isPass === 1 ? '通过' : '不通过' }}
              </el-tag>
            </div>
            <div v-if="item.isPass !== 1" class="violation-info">
              <span class="violation-tag" :class="`level-${item.violationLevel}`">
                {{ getViolationLevelText(item.violationLevel) }}
              </span>
              <span>扣分: {{ item.deductScore }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <span>质检结果 - AI分析</span>
          </template>
          <div v-if="aiResult" class="ai-result">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="满意度评分">{{ aiResult.satisfactionScore }}</el-descriptions-item>
              <el-descriptions-item label="服务态度">{{ aiResult.serviceAttitudeScore }}</el-descriptions-item>
              <el-descriptions-item label="专业度">{{ aiResult.professionalScore }}</el-descriptions-item>
              <el-descriptions-item label="响应及时性">{{ aiResult.responseTimelinessScore }}</el-descriptions-item>
            </el-descriptions>
            <div class="ai-summary" style="margin-top: 12px;">
              <strong>AI总结:</strong> {{ aiResult.aiSummary }}
            </div>
          </div>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>会话信息</span>
          </template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="客服">{{ conversation.csName }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ conversation.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ conversation.endTime }}</el-descriptions-item>
            <el-descriptions-item label="会话时长">{{ conversation.duration }}秒</el-descriptions-item>
            <el-descriptions-item label="消息数量">{{ conversation.messageCount }}</el-descriptions-item>
            <el-descriptions-item label="质检得分">
              <span :style="{ color: conversation.totalScore >= 90 ? '#67c23a' : conversation.totalScore < 60 ? '#f56c6c' : '' }">
                {{ conversation.totalScore || '-' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { conversationApi } from '@/api'

const route = useRoute()
const router = useRouter()

const conversation = reactive({
  id: null,
  sessionId: '-',
  csName: '-',
  startTime: '-',
  endTime: '-',
  duration: 0,
  messageCount: 0,
  totalScore: null,
  aiEmotion: 'NEUTRAL'
})

const messages = ref([
  {
    id: 1,
    senderType: 1,
    senderName: '客户',
    content: '您好，我想咨询一下订单的物流情况',
    sendTime: '2024-06-01 09:15:30'
  },
  {
    id: 2,
    senderType: 2,
    senderName: '客服张三',
    content: '您好！很高兴为您服务。请问您的订单号是多少呢？',
    sendTime: '2024-06-01 09:15:35'
  },
  {
    id: 3,
    senderType: 1,
    senderName: '客户',
    content: '订单号是2024060112345678',
    sendTime: '2024-06-01 09:16:00'
  },
  {
    id: 4,
    senderType: 2,
    senderName: '客服张三',
    content: '好的，我帮您查询一下。您的订单已于今天上午8:30发出，预计明天送达。',
    sendTime: '2024-06-01 09:16:20'
  },
  {
    id: 5,
    senderType: 1,
    senderName: '客户',
    content: '好的，谢谢！',
    sendTime: '2024-06-01 09:16:45'
  },
  {
    id: 6,
    senderType: 2,
    senderName: '客服张三',
    content: '不客气！如果后续还有问题，欢迎随时联系我们。祝您生活愉快！',
    sendTime: '2024-06-01 09:17:00'
  }
])

const ruleResults = ref([
  { id: 1, ruleName: '禁用辱骂词汇', isPass: 1, violationLevel: 3, deductScore: 0 },
  { id: 2, ruleName: '首响超时检测', isPass: 1, violationLevel: 1, deductScore: 0 },
  { id: 3, ruleName: '平均响应超时', isPass: 1, violationLevel: 1, deductScore: 0 },
  { id: 4, ruleName: '开场白规范', isPass: 0, violationLevel: 2, deductScore: 5 },
  { id: 5, ruleName: '结束语规范', isPass: 1, violationLevel: 2, deductScore: 0 }
])

const aiResult = ref({
  satisfactionScore: 88,
  serviceAttitudeScore: 90,
  professionalScore: 85,
  responseTimelinessScore: 92,
  aiSummary: '本次会话服务质量良好，客服响应及时，问题解答清晰，客户满意度较高。'
})

const loadData = async () => {
  const id = route.params.id
  try {
    const res = await conversationApi.getById(id)
    if (res.data) {
      Object.assign(conversation, res.data)
    }
  } catch (e) {
    console.log('使用模拟数据')
  }
}

const goBack = () => {
  router.back()
}

const getEmotionText = (emotion) => {
  const map = { POSITIVE: '积极', NEUTRAL: '中性', NEGATIVE: '消极' }
  return map[emotion] || '未知'
}

const getEmotionTagType = (emotion) => {
  const map = { POSITIVE: 'success', NEUTRAL: 'info', NEGATIVE: 'danger' }
  return map[emotion] || 'info'
}

const getViolationLevelText = (level) => {
  const map = { 1: '轻微', 2: '一般', 3: '严重' }
  return map[level] || '未知'
}

const formatTime = (time) => {
  return time
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.quality-result-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.quality-result-item:last-child {
  border-bottom: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.violation-info {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
}

.ai-result {
  padding: 8px 0;
}

.ai-summary {
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}
</style>
