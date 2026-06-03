<template>
  <div class="lesson-room-container">
    <el-header class="header">
      <div class="lesson-info">
        <h2 class="lesson-title">钢琴课程 - {{ currentLesson?.booking?.sheetMusic?.title || '未命名' }}</h2>
        <div class="lesson-meta">
          <el-tag type="success" v-if="lessonStatus === 'in-progress'">上课中</el-tag>
          <span class="timer">课程时长：{{ formatDuration(lessonDuration) }}</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="toggleLesson">
          {{ lessonStatus === 'scheduled' ? '开始上课' : '结束课程' }}
        </el-button>
        <el-button @click="$router.push('/')">退出</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20" class="content-row">
        <el-col :span="16" class="sheet-music-col">
          <el-card class="sheet-music-card card-shadow">
            <template #header>
              <div class="card-header">
                <span>曲谱 - {{ sheetMusic?.title }}</span>
                <div class="page-controls">
                  <el-button-group>
                    <el-button :disabled="currentPage <= 1" @click="prevPage">上一页</el-button>
                    <el-button>{{ currentPage }} / {{ sheetMusic?.pageCount || 1 }}</el-button>
                    <el-button :disabled="currentPage >= (sheetMusic?.pageCount || 1)" @click="nextPage">下一页</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>
            <div class="sheet-music-wrapper">
              <div class="sheet-music-container" ref="sheetMusicContainer">
                <img
                  v-if="sheetMusic?.fileType === 'image'"
                  :src="sheetMusic.fileUrl"
                  :alt="sheetMusic.title"
                  class="sheet-music-image"
                />
                <div v-else-if="sheetMusic?.fileType === 'pdf'" class="pdf-placeholder">
                  <el-icon class="pdf-icon"><Document /></el-icon>
                  <span>PDF曲谱渲染区域</span>
                </div>
                <canvas
                  ref="annotationCanvas"
                  class="annotation-canvas"
                  @mousedown="startDrawing"
                  @mousemove="drawing"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                ></canvas>
              </div>
            </div>
            <div class="toolbar">
              <div class="tool-group">
                <el-button-group>
                  <el-button
                    :type="currentTool === 'select' ? 'primary' : 'default'"
                    @click="setTool('select')"
                  >
                    <el-icon><Pointer /></el-icon>
                  </el-button>
                  <el-button
                    :type="currentTool === 'pen' ? 'primary' : 'default'"
                    @click="setTool('pen')"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    :type="currentTool === 'highlight' ? 'primary' : 'default'"
                    @click="setTool('highlight')"
                  >
                    <el-icon><MagicStick /></el-icon>
                  </el-button>
                  <el-button
                    :type="currentTool === 'text' ? 'primary' : 'default'"
                    @click="setTool('text')"
                  >
                    <el-icon><Tickets /></el-icon>
                  </el-button>
                  <el-button
                    :type="currentTool === 'circle' ? 'primary' : 'default'"
                    @click="setTool('circle')"
                  >
                    <el-icon><CircleClose /></el-icon>
                  </el-button>
                  <el-button
                    :type="currentTool === 'rect' ? 'primary' : 'default'"
                    @click="setTool('rect')"
                  >
                    <el-icon><Grid /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
              <div class="tool-group">
                <el-color-picker v-model="currentColor" show-alpha />
                <el-slider v-model="lineWidth" :min="1" :max="20" style="width: 100px" />
              </div>
              <div class="tool-group">
                <el-button @click="undo">
                  <el-icon><RefreshLeft /></el-icon>
                </el-button>
                <el-button @click="clearCanvas">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8" class="video-col">
          <el-card class="video-card card-shadow">
            <template #header>
              <span>视频通话</span>
            </template>
            <div class="video-container">
              <div class="video-wrapper main-video">
                <video ref="remoteVideo" autoplay playsinline class="video-element"></video>
                <div class="video-overlay">
                  <span class="video-label">老师</span>
                </div>
                <div class="video-placeholder" v-if="!remoteVideoStream">
                  <el-icon class="placeholder-icon"><VideoCamera /></el-icon>
                  <span>等待老师加入...</span>
                </div>
              </div>
              <div class="video-wrapper self-video">
                <video ref="localVideo" autoplay playsinline muted class="video-element"></video>
                <div class="video-overlay">
                  <span class="video-label">我</span>
                </div>
                <div class="video-placeholder" v-if="!localVideoStream">
                  <el-icon class="placeholder-icon"><User /></el-icon>
                  <span>摄像头未开启</span>
                </div>
              </div>
            </div>
            <div class="video-controls">
              <el-button :type="audioEnabled ? 'primary' : 'default'" circle @click="toggleAudio">
                <el-icon><Microphone v-if="audioEnabled" /><SwitchButton v-else /></el-icon>
              </el-button>
              <el-button :type="videoEnabled ? 'primary' : 'default'" circle @click="toggleVideo">
                <el-icon><VideoCamera v-if="videoEnabled" /><VideoCameraFilled v-else /></el-icon>
              </el-button>
              <el-button type="danger" circle @click="endCall">
                <el-icon><Phone /></el-icon>
              </el-button>
            </div>
          </el-card>

          <el-card class="chat-card card-shadow mt-20">
            <template #header>
              <span>实时标注同步</span>
            </template>
            <div class="annotation-list">
              <div
                v-for="annotation in annotations"
                :key="annotation.id"
                class="annotation-item"
              >
                <div class="annotation-header">
                  <el-avatar :size="24">
                    {{ annotation.authorId === userStore.userInfo?.id ? '我' : '师' }}
                  </el-avatar>
                  <span class="annotation-time">{{ formatAnnotationTime(annotation.createdAt) }}</span>
                </div>
                <div class="annotation-content">
                  <el-tag :type="getAnnotationTypeColor(annotation.type)" size="small">
                    {{ getAnnotationTypeText(annotation.type) }}
                  </el-tag>
                  <span class="annotation-text" v-if="annotation.content">{{ annotation.content }}</span>
                </div>
              </div>
              <el-empty v-if="annotations.length === 0" description="暂无标注" :image-size="80" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Pointer,
  Edit,
  MagicStick,
  Tickets,
  CircleClose,
  Grid,
  RefreshLeft,
  Delete,
  VideoCamera,
  VideoCameraFilled,
  User,
  Microphone,
  SwitchButton,
  Phone
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getLessonDetailApi, startLessonApi, endLessonApi, saveAnnotationApi, getAnnotationsApi } from '@/api/lesson'
import type { Lesson, Annotation, SheetMusic } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const lessonId = computed(() => Number(route.params.lessonId))

const currentLesson = ref<Lesson | null>(null)
const sheetMusic = ref<SheetMusic | null>(null)
const annotations = ref<Annotation[]>([])
const lessonStatus = ref<'scheduled' | 'in-progress' | 'completed'>('scheduled')
const lessonDuration = ref(0)
const durationTimer = ref<number | null>(null)

const currentPage = ref(1)
const annotationCanvas = ref<HTMLCanvasElement | null>(null)
const sheetMusicContainer = ref<HTMLDivElement | null>(null)
const isDrawing = ref(false)
const currentTool = ref<'select' | 'pen' | 'highlight' | 'text' | 'circle' | 'rect'>('pen')
const currentColor = ref('#ff0000')
const lineWidth = ref(3)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)
const lastPos = reactive({ x: 0, y: 0 })

const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)
const localVideoStream = ref<MediaStream | null>(null)
const remoteVideoStream = ref<MediaStream | null>(null)
const audioEnabled = ref(false)
const videoEnabled = ref(false)

onMounted(() => {
  loadLessonDetail()
  loadAnnotations()
  initCanvas()
})

onUnmounted(() => {
  if (durationTimer.value) {
    clearInterval(durationTimer.value)
  }
  stopLocalStream()
})

async function loadLessonDetail() {
  try {
    const data = await getLessonDetailApi(lessonId.value)
    currentLesson.value = data
    sheetMusic.value = (data as any).booking?.sheetMusic || null
    lessonStatus.value = data.status as any
  } catch (error) {
    console.error('Load lesson detail error:', error)
  }
}

async function loadAnnotations() {
  try {
    const data = await getAnnotationsApi(lessonId.value)
    annotations.value = data
  } catch (error) {
    console.error('Load annotations error:', error)
  }
}

function initCanvas() {
  nextTick(() => {
    if (annotationCanvas.value && sheetMusicContainer.value) {
      const canvas = annotationCanvas.value
      const container = sheetMusicContainer.value
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      canvasContext.value = canvas.getContext('2d')
    }
  })
}

function setTool(tool: typeof currentTool.value) {
  currentTool.value = tool
}

function startDrawing(e: MouseEvent) {
  if (currentTool.value === 'select') return
  isDrawing.value = true
  const rect = annotationCanvas.value?.getBoundingClientRect()
  if (rect) {
    lastPos.x = e.clientX - rect.left
    lastPos.y = e.clientY - rect.top
  }
}

function drawing(e: MouseEvent) {
  if (!isDrawing.value || !canvasContext.value) return
  const rect = annotationCanvas.value?.getBoundingClientRect()
  if (!rect) return

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (currentTool.value === 'pen' || currentTool.value === 'highlight') {
    const ctx = canvasContext.value
    ctx.beginPath()
    ctx.strokeStyle = currentTool.value === 'highlight' ? currentColor.value + '40' : currentColor.value
    ctx.lineWidth = currentTool.value === 'highlight' ? lineWidth.value * 3 : lineWidth.value
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastPos.x = x
    lastPos.y = y
  }
}

async function stopDrawing() {
  if (isDrawing.value && currentTool.value !== 'select') {
    isDrawing.value = false
    await saveAnnotation({
      type: currentTool.value as any,
      pageNumber: currentPage.value,
      x: lastPos.x,
      y: lastPos.y,
      color: currentColor.value
    })
  }
}

function undo() {
  ElMessage.info('撤销功能开发中')
}

function clearCanvas() {
  if (canvasContext.value && annotationCanvas.value) {
    canvasContext.value.clearRect(0, 0, annotationCanvas.value.width, annotationCanvas.value.height)
  }
}

async function saveAnnotation(annotation: Partial<Annotation>) {
  try {
    const data = await saveAnnotationApi({
      type: annotation.type || 'freehand',
      pageNumber: annotation.pageNumber || 1,
      x: annotation.x || 0,
      y: annotation.y || 0,
      color: annotation.color || '#ff0000'
    })
    annotations.value.unshift(data)
  } catch (error) {
    console.error('Save annotation error:', error)
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    clearCanvas()
  }
}

function nextPage() {
  if (currentPage.value < (sheetMusic.value?.pageCount || 1)) {
    currentPage.value++
    clearCanvas()
  }
}

async function toggleLesson() {
  try {
    if (lessonStatus.value === 'scheduled') {
      await startLessonApi(lessonId.value)
      lessonStatus.value = 'in-progress'
      startDurationTimer()
      await startLocalStream()
      ElMessage.success('课程已开始')
    } else if (lessonStatus.value === 'in-progress') {
      await ElMessageBox.confirm('确定要结束课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await endLessonApi(lessonId.value)
      lessonStatus.value = 'completed'
      stopDurationTimer()
      stopLocalStream()
      ElMessage.success('课程已结束')
      router.push(`/report/${lessonId.value}`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Toggle lesson error:', error)
    }
  }
}

function startDurationTimer() {
  durationTimer.value = window.setInterval(() => {
    lessonDuration.value++
  }, 1000)
}

function stopDurationTimer() {
  if (durationTimer.value) {
    clearInterval(durationTimer.value)
    durationTimer.value = null
  }
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

async function startLocalStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localVideoStream.value = stream
    if (localVideo.value) {
      localVideo.value.srcObject = stream
    }
    audioEnabled.value = true
    videoEnabled.value = true
  } catch (error) {
    console.error('Get user media error:', error)
    ElMessage.error('无法访问摄像头/麦克风')
  }
}

function stopLocalStream() {
  if (localVideoStream.value) {
    localVideoStream.value.getTracks().forEach(track => track.stop())
    localVideoStream.value = null
  }
  audioEnabled.value = false
  videoEnabled.value = false
}

function toggleAudio() {
  if (localVideoStream.value) {
    const audioTrack = localVideoStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      audioEnabled.value = audioTrack.enabled
    }
  }
}

function toggleVideo() {
  if (localVideoStream.value) {
    const videoTrack = localVideoStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      videoEnabled.value = videoTrack.enabled
    }
  }
}

function endCall() {
  ElMessage.info('通话结束')
}

function formatAnnotationTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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
.lesson-room-container {
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

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer {
  font-size: 14px;
  color: #606266;
  font-family: monospace;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.content-row {
  height: 100%;
}

.sheet-music-col,
.video-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sheet-music-card,
.video-card,
.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-music-wrapper {
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
}

.sheet-music-container {
  position: relative;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.sheet-music-image {
  max-width: 100%;
  height: auto;
}

.pdf-placeholder {
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  color: #909399;
}

.pdf-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.annotation-canvas {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  cursor: crosshair;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.main-video {
  flex: 1;
  min-height: 200px;
}

.self-video {
  width: 120px;
  height: 90px;
  position: absolute;
  bottom: 16px;
  right: 16px;
  border: 2px solid #fff;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.video-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.annotation-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.annotation-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.annotation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.annotation-time {
  font-size: 12px;
  color: #909399;
}

.annotation-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.annotation-text {
  font-size: 14px;
  color: #303133;
}

.mt-20 {
  margin-top: 20px;
}
</style>
