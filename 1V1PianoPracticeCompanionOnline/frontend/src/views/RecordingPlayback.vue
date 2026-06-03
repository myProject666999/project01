<template>
  <div class="recording-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <h2 class="page-title">课程录像回看</h2>
      <div class="header-right"></div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="video-section card-shadow">
            <div class="video-player-wrapper">
              <video
                ref="videoPlayer"
                class="video-player"
                :src="recording?.videoUrl"
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onVideoLoaded"
              ></video>
              <div class="video-overlay" v-if="!isPlaying && videoLoaded">
                <el-button circle size="large" type="primary" @click="togglePlay">
                  <el-icon class="play-icon"><VideoPlay /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="video-controls">
              <div class="progress-bar" @click="seekVideo">
                <div class="progress-bg"></div>
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
                <div
                  v-for="marker in annotationMarkers"
                  :key="marker.id"
                  class="annotation-marker"
                  :style="{ left: (marker.time / duration * 100) + '%' }"
                  @click.stop="seekToAnnotation(marker)"
                >
                  <el-tooltip :content="marker.content || getAnnotationTypeText(marker.type)" placement="top">
                    <div class="marker-dot"></div>
                  </el-tooltip>
                </div>
              </div>
              <div class="control-buttons">
                <el-button circle @click="togglePlay">
                  <el-icon><VideoPause v-if="isPlaying" /><VideoPlay v-else /></el-icon>
                </el-button>
                <el-button circle @click="skipBackward">
                  <el-icon><DArrowLeft /></el-icon>
                </el-button>
                <el-button circle @click="skipForward">
                  <el-icon><DArrowRight /></el-icon>
                </el-button>
                <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
                <div class="volume-control">
                  <el-icon><Microphone /></el-icon>
                  <el-slider v-model="volume" :min="0" :max="100" style="width: 80px" />
                </div>
                <el-button circle @click="toggleFullscreen">
                  <el-icon><FullScreen /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>

          <el-card class="sheet-music-card card-shadow mt-20">
            <template #header>
              <div class="card-header">
                <span>曲谱 - {{ sheetMusic?.title }}</span>
                <div class="page-info">第 {{ currentPage }} / {{ sheetMusic?.pageCount || 1 }} 页</div>
              </div>
            </template>
            <div class="sheet-music-wrapper">
              <div class="sheet-music-container">
                <img
                  v-if="sheetMusic?.fileType === 'image'"
                  :src="sheetMusic.fileUrl"
                  :alt="sheetMusic.title"
                  class="sheet-music-image"
                />
                <div v-else class="sheet-music-placeholder">
                  <el-icon class="music-icon"><Document /></el-icon>
                  <span>曲谱显示区域</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="annotations-card card-shadow">
            <template #header>
              <div class="card-header">
                <span>标注时间轴</span>
                <el-tag type="info" size="small">共 {{ annotations.length }} 条标注</el-tag>
              </div>
            </template>
            <div class="annotations-list">
              <div
                v-for="annotation in sortedAnnotations"
                :key="annotation.id"
                class="annotation-item"
                :class="{ active: currentAnnotationId === annotation.id }"
                @click="seekToAnnotation(annotation)"
              >
                <div class="annotation-time">
                  <span class="time-badge">{{ formatTime(annotation.timestamp || 0) }}</span>
                  <el-tag :type="getAnnotationTypeColor(annotation.type)" size="small">
                    {{ getAnnotationTypeText(annotation.type) }}
                  </el-tag>
                </div>
                <div class="annotation-content">
                  <p v-if="annotation.content" class="text-content">{{ annotation.content }}</p>
                  <div class="annotation-meta">
                    <span>第 {{ annotation.pageNumber }} 页</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="annotations.length === 0" description="暂无标注" :image-size="80" />
            </div>
          </el-card>

          <el-card class="info-card card-shadow mt-20">
            <template #header>
              <span>课程信息</span>
            </template>
            <div class="lesson-info">
              <div class="info-item">
                <span class="label">课程名称</span>
                <span class="value">{{ recording?.title || '钢琴课程' }}</span>
              </div>
              <div class="info-item">
                <span class="label">课程时长</span>
                <span class="value">{{ formatTime(recording?.duration || 0) }}</span>
              </div>
              <div class="info-item">
                <span class="label">录制时间</span>
                <span class="value">{{ recordingCreatedAt }}</span>
              </div>
              <div class="info-item">
                <span class="label">练习曲目</span>
                <span class="value">{{ sheetMusic?.title || '-' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  VideoPlay,
  VideoPause,
  DArrowLeft,
  DArrowRight,
  FullScreen,
  Microphone,
  Document
} from '@element-plus/icons-vue'
import { getRecordingDetailApi } from '@/api/lesson'
import type { Recording, Annotation, SheetMusic } from '@/types'

const route = useRoute()

const recordingId = computed(() => Number(route.params.recordingId))

const videoPlayer = ref<HTMLVideoElement | null>(null)
const recording = ref<Recording | null>(null)
const annotations = ref<Annotation[]>([])
const sheetMusic = ref<SheetMusic | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const videoLoaded = ref(false)
const currentPage = ref(1)
const currentAnnotationId = ref<string | null>(null)

const sortedAnnotations = computed(() => {
  return [...annotations.value].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const annotationMarkers = computed(() => {
  return annotations.value.filter(a => a.timestamp !== undefined)
})

const recordingCreatedAt = computed(() => {
  if (!recording.value?.createdAt) return '-'
  return new Date(recording.value.createdAt).toLocaleString('zh-CN')
})

onMounted(() => {
  loadRecordingDetail()
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
})

async function loadRecordingDetail() {
  try {
    const data = await getRecordingDetailApi(recordingId.value)
    recording.value = data
    annotations.value = data.annotations || []
  } catch (error) {
    console.error('Load recording error:', error)
  }
}

function onVideoLoaded() {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration
    videoLoaded.value = true
  }
}

function onTimeUpdate() {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
    updateCurrentAnnotation()
  }
}

function updateCurrentAnnotation() {
  const current = sortedAnnotations.value.find(a => {
    const time = a.timestamp || 0
    return time <= currentTime.value && time + 5 > currentTime.value
  })
  if (current) {
    currentAnnotationId.value = current.id
    currentPage.value = current.pageNumber
  }
}

function togglePlay() {
  if (!videoPlayer.value) return
  if (isPlaying.value) {
    videoPlayer.value.pause()
  } else {
    videoPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function skipBackward() {
  if (!videoPlayer.value) return
  videoPlayer.value.currentTime = Math.max(0, videoPlayer.value.currentTime - 10)
}

function skipForward() {
  if (!videoPlayer.value) return
  videoPlayer.value.currentTime = Math.min(duration.value, videoPlayer.value.currentTime + 10)
}

function seekVideo(e: MouseEvent) {
  if (!videoPlayer.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoPlayer.value.currentTime = percent * duration.value
}

function seekToAnnotation(annotation: Annotation) {
  if (!videoPlayer.value || annotation.timestamp === undefined) return
  videoPlayer.value.currentTime = annotation.timestamp
  currentAnnotationId.value = annotation.id
  currentPage.value = annotation.pageNumber
  if (!isPlaying.value) {
    togglePlay()
  }
}

function toggleFullscreen() {
  if (!videoPlayer.value) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoPlayer.value.requestFullscreen()
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function getAnnotationTypeColor(type: string) {
  const map: Record<string, string> = {
    text: 'primary',
    circle: 'success',
    rect: 'warning',
    line: 'info',
    freehand: 'danger'
  }
  return map[type] || 'info'
}

function getAnnotationTypeText(type: string) {
  const map: Record<string, string> = {
    text: '文字',
    circle: '圆圈',
    rect: '矩形',
    line: '直线',
    freehand: '画笔'
  }
  return map[type] || type
}
</script>

<style scoped>
.recording-container {
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

.video-section,
.sheet-music-card,
.annotations-card,
.info-card {
  border-radius: 8px;
}

.video-player-wrapper {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.play-icon {
  font-size: 32px;
}

.video-controls {
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}

.progress-bar {
  position: relative;
  height: 8px;
  margin-bottom: 16px;
  cursor: pointer;
}

.progress-bg {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: #ebeef5;
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.1s;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  transition: left 0.1s;
}

.annotation-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.marker-dot {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  font-size: 14px;
  color: #606266;
  font-family: monospace;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-info {
  font-size: 14px;
  color: #909399;
}

.sheet-music-wrapper {
  max-height: 300px;
  overflow: auto;
  background: #f5f7fa;
  border-radius: 8px;
}

.sheet-music-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 200px;
}

.sheet-music-image {
  max-width: 100%;
  height: auto;
}

.sheet-music-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.music-icon {
  font-size: 48px;
}

.annotations-list {
  max-height: 400px;
  overflow-y: auto;
}

.annotation-item {
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
}

.annotation-item:hover {
  background: #f5f7fa;
}

.annotation-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.annotation-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.time-badge {
  font-size: 12px;
  font-family: monospace;
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
}

.text-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.annotation-meta {
  font-size: 12px;
  color: #909399;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 14px;
  color: #606266;
}

.info-item .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.mt-20 {
  margin-top: 20px;
}
</style>
