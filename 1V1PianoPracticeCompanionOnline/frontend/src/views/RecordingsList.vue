<template>
  <div class="recordings-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <div class="title">课程录像</div>
      <div style="width: 80px"></div>
    </el-header>

    <el-main class="main-content">
      <el-table :data="recordings" style="width: 100%" v-if="recordings.length > 0">
        <el-table-column prop="lesson.booking.teacher.user.name" label="老师" width="120">
          <template #default="{ row }">
            <el-avatar :size="32" :src="row.lesson?.booking?.teacher?.user?.avatarUrl" class="mr-10">
              {{ row.lesson?.booking?.teacher?.user?.name?.charAt(0) }}
            </el-avatar>
            {{ row.lesson?.booking?.teacher?.user?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="lesson.booking.sheetMusic.title" label="曲目" width="180">
          <template #default="{ row }">
            {{ row.lesson?.booking?.sheetMusic?.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recordingType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRecordingType(row.recordingType)">{{ getRecordingTypeText(row.recordingType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="durationSeconds" label="时长" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.durationSeconds) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="录制时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="playRecording(row)">
              <el-icon><VideoPlay /></el-icon>
              播放
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty description="暂无录像" v-else />
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
import { getRecordingsListApi } from '@/api/recording'
import type { LessonRecording } from '@/types'

const router = useRouter()
const recordings = ref<LessonRecording[]>([])

onMounted(() => {
  loadRecordings()
})

async function loadRecordings() {
  try {
    const data = await getRecordingsListApi()
    recordings.value = data
  } catch (error) {
    console.error('Load recordings error:', error)
  }
}

function getRecordingType(type: string) {
  const map: Record<string, string> = {
    teacher: 'success',
    student: 'info',
    combined: 'warning'
  }
  return map[type] || 'info'
}

function getRecordingTypeText(type: string) {
  const map: Record<string, string> = {
    teacher: '老师视角',
    student: '学生视角',
    combined: '合成'
  }
  return map[type] || type
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN')
}

function playRecording(recording: LessonRecording) {
  router.push(`/recording/${recording.id}`)
}
</script>

<style scoped>
.recordings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
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
  color: #909399;
  font-size: 14px;
}

.back-btn:hover {
  color: #409eff;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.mr-10 {
  margin-right: 10px;
}
</style>
