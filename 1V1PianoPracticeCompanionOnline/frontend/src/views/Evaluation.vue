<template>
  <div class="evaluation-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <h2 class="page-title">课后报告</h2>
      <div class="header-right"></div>
    </el-header>

    <el-main class="main-content">
      <div class="report-content">
        <el-card class="overview-card card-shadow">
          <div class="overview-content">
            <div class="overall-score">
              <div class="score-circle">
                <svg class="progress-ring" width="160" height="160">
                  <circle class="progress-ring-bg" cx="80" cy="80" r="70" />
                  <circle
                    class="progress-ring-bar"
                    cx="80"
                    cy="80"
                    r="70"
                    :stroke-dasharray="circleCircumference"
                    :stroke-dashoffset="circleOffset"
                  />
                </svg>
                <div class="score-value">
                  <span class="score-number">{{ report?.overallScore || 0 }}</span>
                  <span class="score-label">综合评分</span>
                </div>
              </div>
            </div>
            <div class="lesson-info">
              <h3 class="lesson-title">{{ lessonTitle }}</h3>
              <div class="lesson-meta">
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ lessonDate }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ lessonDuration }}
                </span>
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ teacherName }}
                </span>
              </div>
              <div class="lesson-music">
                <span>练习曲目：</span>
                <el-tag type="info">{{ musicTitle }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="section-card card-shadow">
              <template #header>
                <span>分项评分</span>
              </template>
              <div class="score-items">
                <div class="score-item">
                  <div class="score-header">
                    <span class="score-name">节奏</span>
                    <span class="score-num">{{ report?.rhythmScore || 0 }}分</span>
                  </div>
                  <el-progress :percentage="report?.rhythmScore || 0" :color="getScoreColor(report?.rhythmScore)" />
                </div>
                <div class="score-item">
                  <div class="score-header">
                    <span class="score-name">音准</span>
                    <span class="score-num">{{ report?.technicalScore || 0 }}分</span>
                  </div>
                  <el-progress :percentage="report?.technicalScore || 0" :color="getScoreColor(report?.technicalScore)" />
                </div>
                <div class="score-item">
                  <div class="score-header">
                    <span class="score-name">表现力</span>
                    <span class="score-num">{{ report?.expressionScore || 0 }}分</span>
                  </div>
                  <el-progress :percentage="report?.expressionScore || 0" :color="getScoreColor(report?.expressionScore)" />
                </div>
                <div class="score-item">
                  <div class="score-header">
                    <span class="score-name">记谱准确度</span>
                    <span class="score-num">{{ notationScore }}分</span>
                  </div>
                  <el-progress :percentage="notationScore" :color="getScoreColor(notationScore)" />
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="section-card card-shadow">
              <template #header>
                <span>老师评语</span>
              </template>
              <div class="comments-section">
                <div class="teacher-comment">
                  <div class="comment-header">
                    <el-avatar :size="40" :src="teacherAvatar">
                      {{ teacherName?.charAt(0) }}
                    </el-avatar>
                    <div class="comment-info">
                      <span class="teacher-name">{{ teacherName }}</span>
                      <span class="comment-time">{{ reportCreatedAt }}</span>
                    </div>
                  </div>
                  <p class="comment-content">{{ report?.comments || '暂无评语' }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mt-20">
          <el-col :span="12">
            <el-card class="section-card card-shadow">
              <template #header>
                <span class="header-icon success">
                  <el-icon><CircleCheck /></el-icon>
                  优点
                </span>
              </template>
              <div class="strengths-list">
                <div v-for="(item, index) in report?.strengths || []" :key="index" class="strength-item">
                  <el-icon class="check-icon"><Check /></el-icon>
                  <span>{{ item }}</span>
                </div>
                <el-empty v-if="!report?.strengths?.length" description="暂无记录" :image-size="80" />
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="section-card card-shadow">
              <template #header>
                <span class="header-icon warning">
                  <el-icon><Warning /></el-icon>
                  待改进
                </span>
              </template>
              <div class="improvements-list">
                <div v-for="(item, index) in report?.improvements || []" :key="index" class="improvement-item">
                  <el-icon class="warn-icon"><Star /></el-icon>
                  <span>{{ item }}</span>
                </div>
                <el-empty v-if="!report?.improvements?.length" description="暂无记录" :image-size="80" />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="section-card card-shadow mt-20">
          <template #header>
            <span class="header-icon primary">
              <el-icon><Trophy /></el-icon>
              下节课目标
            </span>
          </template>
          <div class="homework-section">
            <div class="homework-content">
              <p v-if="report?.homework">{{ report.homework }}</p>
              <el-empty v-else description="暂无作业布置" :image-size="80" />
            </div>
          </div>
        </el-card>

        <div class="action-buttons mt-20">
          <el-button size="large" @click="viewRecording">
            <el-icon><VideoPlay /></el-icon>
            查看课程录像
          </el-button>
          <el-button type="primary" size="large" @click="bookNext">
            <el-icon><Calendar /></el-icon>
            预约下次课程
          </el-button>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CircleCheck,
  Check,
  Warning,
  Star,
  Trophy,
  VideoPlay
} from '@element-plus/icons-vue'
import { getLessonReportApi } from '@/api/lesson'
import type { LessonReport } from '@/types'

const route = useRoute()
const router = useRouter()

const lessonId = computed(() => Number(route.params.lessonId))
const report = ref<LessonReport | null>(null)

const lessonTitle = ref('钢琴课程')
const lessonDate = ref('2024-01-15')
const lessonDuration = ref('60分钟')
const teacherName = ref('张老师')
const teacherAvatar = ref('')
const musicTitle = ref('拜厄练习曲 No.20')
const reportCreatedAt = ref('')

const notationScore = ref(85)

const circleCircumference = 2 * Math.PI * 70
const circleOffset = computed(() => {
  const score = report.value?.overallScore || 0
  return circleCircumference - (score / 100) * circleCircumference
})

onMounted(() => {
  loadReport()
})

async function loadReport() {
  try {
    const data = await getLessonReportApi(lessonId.value)
    report.value = data
    reportCreatedAt.value = new Date(data.createdAt).toLocaleString('zh-CN')
  } catch (error) {
    console.error('Load report error:', error)
  }
}

function getScoreColor(score?: number) {
  const s = score || 0
  if (s >= 90) return '#67c23a'
  if (s >= 80) return '#409eff'
  if (s >= 70) return '#e6a23c'
  return '#f56c6c'
}

function viewRecording() {
  router.push(`/recording/${lessonId.value}`)
}

function bookNext() {
  router.push('/teachers')
}
</script>

<style scoped>
.evaluation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #409eff;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  width: 60px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 20px;
}

.report-content {
  max-width: 1200px;
  margin: 0 auto;
}

.overview-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.overview-content {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 0;
}

.overall-score {
  flex-shrink: 0;
}

.score-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #ebeef5;
  stroke-width: 10;
}

.progress-ring-bar {
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.score-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.lesson-music {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.section-card {
  border-radius: 8px;
}

.score-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-name {
  font-size: 14px;
  color: #606266;
}

.score-num {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.comments-section {
  padding: 10px 0;
}

.teacher-comment {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.teacher-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.header-icon {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon.success {
  color: #67c23a;
}

.header-icon.warning {
  color: #e6a23c;
}

.header-icon.primary {
  color: #409eff;
}

.strengths-list,
.improvements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.strength-item,
.improvement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
}

.strength-item {
  background: #f0f9eb;
}

.improvement-item {
  background: #fdf6ec;
}

.check-icon {
  color: #67c23a;
  font-size: 16px;
}

.warn-icon {
  color: #e6a23c;
  font-size: 16px;
}

.homework-section {
  padding: 10px 0;
}

.homework-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  padding: 16px;
  background: #ecf5ff;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.mt-20 {
  margin-top: 20px;
}
</style>
