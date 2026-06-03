<template>
  <div class="home-container">
    <el-header class="header">
      <div class="logo">🎹 1V1钢琴陪练</div>
      <div class="user-info">
        <el-avatar :size="40" :src="userStore.userInfo?.avatar">
          {{ userStore.userInfo?.username?.charAt(0) }}
        </el-avatar>
        <span class="username">{{ userStore.userInfo?.username }}</span>
        <el-button type="text" @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card card-shadow">
            <div class="stat-content">
              <div class="stat-icon lessons">📚</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.lessonsCount }}</div>
                <div class="stat-label">已完成课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-shadow">
            <div class="stat-content">
              <div class="stat-icon hours">⏰</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalHours }}</div>
                <div class="stat-label">学习时长(h)</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-shadow">
            <div class="stat-content">
              <div class="stat-icon rating">⭐</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.avgRating }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-shadow">
            <div class="stat-content">
              <div class="stat-icon packages">🎁</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.packagesCount }}</div>
                <div class="stat-label">有效课程包</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="content-row">
        <el-col :span="16">
          <el-card class="section-card card-shadow">
            <template #header>
              <div class="card-header">
                <span>预约记录</span>
                <el-button type="text" @click="$router.push('/teachers')">查看更多</el-button>
              </div>
            </template>
            <el-table :data="bookings" style="width: 100%">
              <el-table-column prop="teacher.username" label="老师" width="120">
                <template #default="{ row }">
                  <el-avatar :size="32" :src="row.teacher?.avatar" class="mr-10">
                    {{ row.teacher?.username?.charAt(0) }}
                  </el-avatar>
                  {{ row.teacher?.username }}
                </template>
              </el-table-column>
              <el-table-column prop="sheetMusic.title" label="曲目" width="150">
                <template #default="{ row }">
                  {{ row.sheetMusic?.title || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="timeSlot.startTime" label="时间">
                <template #default="{ row }">
                  {{ formatTime(row.timeSlot?.startTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button v-if="row.status === 'confirmed'" type="primary" size="small" @click="joinLesson(row)">
                    进入课堂
                  </el-button>
                  <el-button v-if="row.status === 'completed'" type="success" size="small" @click="viewReport(row)">
                    查看报告
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="section-card card-shadow">
            <template #header>
              <span>快捷入口</span>
            </template>
            <div class="quick-actions">
              <div class="action-item" @click="$router.push('/teachers')">
                <div class="action-icon">👨‍🏫</div>
                <span>选择老师</span>
              </div>
              <div class="action-item" @click="viewRecordings">
                <div class="action-icon">🎥</div>
                <span>课程录像</span>
              </div>
              <div class="action-item" @click="viewSheetMusic">
                <div class="action-icon">🎼</div>
                <span>曲谱库</span>
              </div>
              <div class="action-item" @click="viewPackages">
                <div class="action-icon">💳</div>
                <span>课程包</span>
              </div>
            </div>
          </el-card>

          <el-card class="section-card card-shadow">
            <template #header>
              <span>推荐老师</span>
            </template>
            <div class="teacher-list">
              <div v-for="teacher in recommendedTeachers" :key="teacher.id" class="teacher-item" @click="goToTeacher(teacher.id)">
                <el-avatar :size="48" :src="teacher.user?.avatarUrl">
                  {{ teacher.user?.name?.charAt(0) }}
                </el-avatar>
                <div class="teacher-info">
                  <div class="teacher-name">{{ teacher.user?.name }}</div>
                  <div class="teacher-rating">
                    <el-rate :model-value="teacher.rating" disabled :max="5" show-score />
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getBookingListApi } from '@/api/booking'
import { getTeacherListApi } from '@/api/booking'
import type { Booking, Teacher } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const stats = reactive({
  lessonsCount: 12,
  totalHours: 48,
  avgRating: 4.8,
  packagesCount: 2
})

const bookings = ref<Booking[]>([])
const recommendedTeachers = ref<Teacher[]>([])

onMounted(() => {
  loadBookings()
  loadTeachers()
})

async function loadBookings() {
  try {
    const data = await getBookingListApi()
    bookings.value = data.slice(0, 5)
  } catch (error) {
    console.error('Load bookings error:', error)
  }
}

async function loadTeachers() {
  try {
    const data = await getTeacherListApi({ page: 1, pageSize: 3 })
    recommendedTeachers.value = data.list
  } catch (error) {
    console.error('Load teachers error:', error)
  }
}

function formatTime(time: string | undefined) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function joinLesson(booking: Booking) {
  router.push(`/lesson/${booking.id}`)
}

function viewReport(booking: Booking) {
  router.push(`/report/${booking.id}`)
}

function goToTeacher(teacherId: number) {
  router.push(`/booking/${teacherId}`)
}

function viewRecordings() {
  router.push('/recordings')
}

function viewSheetMusic() {
  router.push('/sheet-music')
}

function viewPackages() {
  router.push('/course-packages')
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.home-container {
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

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.lessons {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.hours {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.packages {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.content-row {
  margin-bottom: 20px;
}

.section-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.teacher-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.teacher-item:hover {
  background: #f5f7fa;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.mr-10 {
  margin-right: 10px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
