<template>
  <div class="booking-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/teachers')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <h2 class="page-title">预约课程</h2>
      <div class="header-right"></div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="section-card card-shadow">
            <template #header>
              <span>选择时间</span>
            </template>
            <div class="date-picker-section">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                :disabled-date="disabledDate"
                size="large"
                @change="loadTimeSlots"
              />
            </div>
            <div class="time-slots-section">
              <h4 class="section-title">可选时间段</h4>
              <div v-if="loading" class="loading-wrapper">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="timeSlots.length === 0" class="empty-wrapper">
                <el-empty description="该日期暂无可用时间，请选择其他日期" />
              </div>
              <div v-else class="time-slots-grid">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.id"
                  class="time-slot-item"
                  :class="{ selected: selectedTimeSlot?.id === slot.id, disabled: slot.isBooked }"
                  @click="selectTimeSlot(slot)"
                >
                  <span class="time-text">{{ formatSlotTime(slot.startTime) }}</span>
                  <span class="duration-text">- {{ formatSlotTime(slot.endTime) }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="section-card card-shadow mt-20">
            <template #header>
              <span>选择曲谱</span>
            </template>
            <div class="sheet-music-list">
              <div
                v-for="music in sheetMusicList"
                :key="music.id"
                class="sheet-music-item"
                :class="{ selected: selectedSheetMusic?.id === music.id }"
                @click="selectSheetMusic(music)"
              >
                <div class="music-cover">
                  <img v-if="music.thumbnailUrl" :src="music.thumbnailUrl" :alt="music.title" />
                  <span v-else class="music-icon">🎼</span>
                </div>
                <div class="music-info">
                  <h4 class="music-title">{{ music.title }}</h4>
                  <p class="music-composer">{{ music.composer }}</p>
                  <el-tag :type="getDifficultyTagType(music.difficulty)" size="small">
                    {{ getDifficultyText(music.difficulty) }}
                  </el-tag>
                </div>
                <el-icon v-if="selectedSheetMusic?.id === music.id" class="check-icon"><Check /></el-icon>
              </div>
            </div>
          </el-card>

          <el-card class="section-card card-shadow mt-20">
            <template #header>
              <span>备注信息</span>
            </template>
            <el-input
              v-model="bookingNotes"
              type="textarea"
              :rows="4"
              placeholder="请输入学习目标或需要老师特别注意的内容（选填）"
            />
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="teacher-card card-shadow">
            <div class="teacher-info-header">
              <el-avatar :size="80" :src="teacher?.avatar">
                {{ teacher?.username?.charAt(0) }}
              </el-avatar>
              <div class="teacher-basic">
                <h3 class="teacher-name">{{ teacher?.username }}</h3>
                <div class="teacher-rating">
                  <el-rate :model-value="teacher?.rating" disabled :max="5" show-score />
                </div>
              </div>
            </div>
            <div class="teacher-stats">
              <div class="stat-item">
                <span class="stat-value">{{ teacher?.reviewCount || 0 }}</span>
                <span class="stat-label">评价数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ teacher?.hourlyRate || 0 }}</span>
                <span class="stat-label">元/小时</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">
                  <el-tag v-if="teacher?.teachChinese" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </span>
                <span class="stat-label">中文教学</span>
              </div>
            </div>
          </el-card>

          <el-card class="summary-card card-shadow mt-20">
            <template #header>
              <span>预约摘要</span>
            </template>
            <div class="summary-content">
              <div class="summary-item">
                <span class="label">老师：</span>
                <span class="value">{{ teacher?.username || '-' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">日期：</span>
                <span class="value">{{ selectedDate ? formatDate(selectedDate) : '-' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">时间：</span>
                <span class="value">
                  {{ selectedTimeSlot ? formatSlotTime(selectedTimeSlot.startTime) + ' - ' + formatSlotTime(selectedTimeSlot.endTime) : '-' }}
                </span>
              </div>
              <div class="summary-item">
                <span class="label">曲谱：</span>
                <span class="value">{{ selectedSheetMusic?.title || '暂未选择' }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-item total">
                <span class="label">课程费用：</span>
                <span class="value price">¥{{ teacher?.hourlyRate || 0 }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              size="large"
              class="confirm-btn"
              :disabled="!canSubmit"
              :loading="submitting"
              @click="submitBooking"
            >
              确认预约
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { getTeacherDetailApi, getTeacherTimeSlotsApi, createBookingApi } from '@/api/booking'
import { getSheetMusicListApi } from '@/api/lesson'
import type { Teacher, TimeSlot, SheetMusic } from '@/types'

const route = useRoute()
const router = useRouter()

const teacherId = computed(() => Number(route.params.teacherId))

const teacher = ref<Teacher | null>(null)
const timeSlots = ref<TimeSlot[]>([])
const sheetMusicList = ref<SheetMusic[]>([])
const selectedDate = ref<Date>()
const selectedTimeSlot = ref<TimeSlot>()
const selectedSheetMusic = ref<SheetMusic>()
const bookingNotes = ref('')
const loading = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => {
  return selectedDate.value && selectedTimeSlot.value && !submitting.value
})

onMounted(() => {
  loadTeacherDetail()
  loadSheetMusic()
})

async function loadTeacherDetail() {
  try {
    const data = await getTeacherDetailApi(teacherId.value)
    teacher.value = data
  } catch (error) {
    console.error('Load teacher detail error:', error)
  }
}

async function loadTimeSlots() {
  if (!selectedDate.value) return
  loading.value = true
  try {
    const dateStr = selectedDate.value.toISOString().split('T')[0]
    const data = await getTeacherTimeSlotsApi(teacherId.value, dateStr)
    timeSlots.value = data
  } catch (error) {
    console.error('Load time slots error:', error)
  } finally {
    loading.value = false
  }
}

async function loadSheetMusic() {
  try {
    const data = await getSheetMusicListApi()
    sheetMusicList.value = data
  } catch (error) {
    console.error('Load sheet music error:', error)
  }
}

function disabledDate(time: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime()
}

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function formatSlotTime(time: string) {
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function selectTimeSlot(slot: TimeSlot) {
  if (slot.isBooked) return
  selectedTimeSlot.value = slot
}

function selectSheetMusic(music: SheetMusic) {
  selectedSheetMusic.value = music
}

function getDifficultyTagType(difficulty: string) {
  const map: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return map[difficulty] || 'info'
}

function getDifficultyText(difficulty: string) {
  const map: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return map[difficulty] || difficulty
}

async function submitBooking() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await createBookingApi({
      teacherId: teacherId.value,
      timeSlotId: selectedTimeSlot.value!.id,
      sheetMusicId: selectedSheetMusic.value?.id,
      notes: bookingNotes.value
    })
    ElMessage.success('预约成功！')
    router.push('/')
  } catch (error) {
    console.error('Submit booking error:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-container {
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
}

.section-card {
  border-radius: 8px;
}

.date-picker-section {
  padding: 20px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.time-slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-slot-item:hover:not(.disabled) {
  border-color: #409eff;
  background: #ecf5ff;
}

.time-slot-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.time-slot-item.disabled {
  background: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

.time-text {
  font-size: 16px;
  font-weight: 500;
}

.duration-text {
  font-size: 14px;
  color: #909399;
}

.sheet-music-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sheet-music-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.sheet-music-item:hover {
  border-color: #409eff;
}

.sheet-music-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.music-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-icon {
  font-size: 28px;
}

.music-info {
  flex: 1;
}

.music-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.music-composer {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.check-icon {
  font-size: 24px;
  color: #67c23a;
}

.teacher-card {
  border-radius: 8px;
}

.teacher-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.teacher-basic {
  flex: 1;
}

.teacher-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.teacher-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.summary-card {
  border-radius: 8px;
}

.summary-content {
  padding: 10px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.summary-item .label {
  font-size: 14px;
  color: #606266;
}

.summary-item .value {
  font-size: 14px;
  color: #303133;
}

.summary-item.total .value {
  font-size: 20px;
  font-weight: 600;
}

.summary-item.total .price {
  color: #f56c6c;
}

.summary-divider {
  height: 1px;
  background: #ebeef5;
  margin: 12px 0;
}

.confirm-btn {
  width: 100%;
  margin-top: 20px;
}

.loading-wrapper,
.empty-wrapper {
  padding: 40px 0;
}

.mt-20 {
  margin-top: 20px;
}
</style>
