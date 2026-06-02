<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import AnnotationCanvas from './AnnotationCanvas.vue'
import type { SheetMusic, Annotation } from '@/types'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const props = defineProps<{
  sheetMusic: SheetMusic | null
  annotations?: Annotation[]
  readOnly?: boolean
}>()

const emit = defineEmits<{
  annotationAdded: [annotation: Annotation]
  annotationSelected: [annotation: Annotation]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.5)
const pdfDoc = ref<any>(null)
const imageUrl = ref('')
const loading = ref(false)

watch(
  () => props.sheetMusic,
  async (newVal) => {
    if (newVal) {
      if (newVal.fileType === 'pdf') {
        await loadPdf(newVal.fileUrl)
      } else {
        imageUrl.value = newVal.fileUrl
        totalPages.value = newVal.pageCount
      }
    }
  },
  { immediate: true }
)

async function loadPdf(url: string) {
  loading.value = true
  try {
    pdfDoc.value = await pdfjsLib.getDocument(url).promise
    totalPages.value = pdfDoc.value.numPages
    currentPage.value = 1
    await renderPage(1)
  } catch (error) {
    console.error('PDF加载失败:', error)
  } finally {
    loading.value = false
  }
}

async function renderPage(pageNum: number) {
  if (!pdfDoc.value || !canvasRef.value) return

  const page = await pdfDoc.value.getPage(pageNum)
  const viewport = page.getViewport({ scale: scale.value })
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')!

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise
}

async function changePage(delta: number) {
  const newPage = currentPage.value + delta
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    if (props.sheetMusic?.fileType === 'pdf') {
      await renderPage(newPage)
    }
  }
}

function handleAnnotationAdded(annotation: Annotation) {
  const annoWithPage = { ...annotation, pageNumber: currentPage.value }
  emit('annotationAdded', annoWithPage)
}

function handleAnnotationSelected(annotation: Annotation) {
  emit('annotationSelected', annotation)
}

const pageAnnotations = ref<Annotation[]>([])

watch(
  [() => props.annotations, currentPage],
  ([annotations, page]) => {
    if (annotations) {
      pageAnnotations.value = annotations.filter((a) => a.pageNumber === page)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="sheet-music-viewer" ref="containerRef">
    <div class="viewer-toolbar">
      <el-button-group>
        <el-button :disabled="currentPage <= 1" @click="changePage(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <el-button :disabled="currentPage >= totalPages" @click="changePage(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </el-button-group>
      <el-slider v-model="scale" :min="0.5" :max="3" :step="0.1" style="width: 150px; margin: 0 20px" />
      <span class="scale-text">{{ (scale * 100).toFixed(0) }}%</span>
    </div>

    <div class="viewer-content">
      <div v-loading="loading" class="canvas-wrapper">
        <canvas
          v-if="sheetMusic?.fileType === 'pdf'"
          ref="canvasRef"
          class="pdf-canvas"
        />
        <img
          v-else-if="sheetMusic?.fileType === 'image'"
          :src="imageUrl"
          :style="{ transform: `scale(${scale})` }"
          class="sheet-image"
        />
        <AnnotationCanvas
          v-if="sheetMusic"
          :annotations="pageAnnotations"
          :read-only="readOnly"
          :page-width="canvasRef?.width || 800"
          :page-height="canvasRef?.height || 1100"
          @annotation-added="handleAnnotationAdded"
