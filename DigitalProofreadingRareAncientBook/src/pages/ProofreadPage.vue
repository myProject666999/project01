<template>
  <div class="h-screen flex flex-col bg-ink-50">
    <header class="bg-white border-b border-ink-200 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="$router.back()" class="text-ink-500 hover:text-ink-700">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-lg font-serif text-ink-900">{{ bookTitle }} - 第 {{ pageNumber }} 页</h1>
          <p class="text-xs text-ink-500">{{ statusText }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="!isFinalized"
          @click="handleSave"
          class="px-4 py-2 text-sm border border-ink-300 text-ink-700 rounded hover:bg-ink-100 transition-colors flex items-center gap-2"
        >
          <Save class="w-4 h-4" />
          保存
        </button>
        <button
          v-if="!isFinalized"
          @click="handleSubmit"
          class="px-4 py-2 text-sm bg-vermilion-500 hover:bg-vermilion-600 text-white rounded transition-colors flex items-center gap-2"
        >
          <CheckCircle class="w-4 h-4" />
          提交校对
        </button>
        <button
          v-if="!isFinalized"
          @click="handleRelease"
          class="px-4 py-2 text-sm border border-ink-300 text-ink-500 rounded hover:bg-ink-100 transition-colors"
        >
          释放页面
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <div class="w-1/2 bg-ink-900 relative">
        <div ref="viewerContainer" class="w-full h-full"></div>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 text-white text-sm">
          <button @click="zoomIn" class="hover:text-vermilion-400">
            <ZoomIn class="w-4 h-4" />
          </button>
          <button @click="zoomOut" class="hover:text-vermilion-400">
            <ZoomOut class="w-4 h-4" />
          </button>
          <div class="w-px h-4 bg-white/30"></div>
          <button @click="resetZoom" class="hover:text-vermilion-400">
            <Maximize class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="w-1/2 flex flex-col bg-white border-l border-ink-200">
        <div class="px-4 py-2 border-b border-ink-200 flex items-center justify-between bg-ink-50">
          <span class="text-sm text-ink-600">OCR识别文本 - 可直接编辑</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-ink-400">提示: 选中文字后按快捷键或右键查询异体字</span>
          </div>
        </div>
        <div class="flex-1 flex overflow-hidden">
          <div class="w-12 bg-ink-50 border-r border-ink-200 text-right py-4 px-2 select-none overflow-hidden">
            <div v-for="n in lineCount" :key="n" class="text-xs text-ink-400 leading-8 font-mono">
              {{ n }}
            </div>
          </div>
          <div class="flex-1 relative">
            <textarea
              ref="textareaRef"
              v-model="textContent"
              :disabled="isFinalized"
              class="w-full h-full p-4 resize-none focus:outline-none font-serif text-lg leading-8 text-ink-900"
              :class="{ 'bg-ink-50 cursor-not-allowed': isFinalized }"
              @select="handleSelection"
              @click="handleTextClick"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showDictionary && selectedChar"
      class="fixed bg-white rounded-lg shadow-2xl border border-ink-200 p-4 z-50 min-w-64"
      :style="{ left: dictPosition.x + 'px', top: dictPosition.y + 'px' }"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-ink-700">字典查询 - 「{{ selectedChar }}」</h3>
        <button @click="closeDictionary" class="text-ink-400 hover:text-ink-600">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div v-if="dictLoading" class="text-center py-4 text-ink-400">查询中...</div>
      <div v-else-if="dictionaryVariants.length === 0" class="text-center py-4 text-ink-400">
        暂无对应异体字
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="(variant, index) in dictionaryVariants"
          :key="index"
          class="flex items-center gap-3 p-2 rounded hover:bg-ink-50 cursor-pointer"
          @click="insertVariant(variant.char)"
        >
          <span class="text-2xl font-serif w-10 h-10 flex items-center justify-center bg-ink-100 rounded">{{ variant.char }}</span>
          <div>
            <div class="text-xs text-vermilion-500">{{ variant.type }}</div>
            <div class="text-xs text-ink-400">{{ variant.note || variant.dictionaryName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, CheckCircle, ZoomIn, ZoomOut, Maximize, X } from 'lucide-vue-next'
import OpenSeadragon from 'openseadragon'
import { getPage, saveProofreading, submitProofreading, releasePage, lookupDictionary } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const bookId = route.params.bookId as string
const pageId = route.params.pageId as string

const viewerContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let viewer: any = null

const pageData = ref<any>(null)
const textContent = ref('')
const bookTitle = ref('')
const pageNumber = ref(0)
const isFinalized = computed(() => pageData.value?.status === 'finalized')

const statusText = computed(() => {
  const map: Record<string, string> = {
    unclaimed: '待认领',
    proofreading: '校对中',
    first_done: '第一轮校对完成',
    pending_review: '待审稿',
    finalized: '已定稿 (已冻结)',
  }
  return map[pageData.value?.status] || ''
})

const lineCount = computed(() => {
  return textContent.value.split('\n').length || 1
})

const showDictionary = ref(false)
const selectedChar = ref('')
const dictPosition = ref({ x: 0, y: 0 })
const dictLoading = ref(false)
const dictionaryVariants = ref<any[]>([])

async function loadPage() {
  const result = await getPage(bookId, pageId)
  if (result.success) {
    pageData.value = result.data
    bookTitle.value = result.data.bookTitle
    pageNumber.value = result.data.pageNumber
    textContent.value = result.data.currentText || result.data.ocrText || ''
    
    await nextTick()
    initViewer()
  }
}

function initViewer() {
  if (!viewerContainer.value) return
  
  viewer = OpenSeadragon({
    element: viewerContainer.value,
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.1/images/',
    tileSources: {
      type: 'image',
      url: 'https://picsum.photos/1200/1600?random=' + pageId,
    },
    showNavigationControl: false,
    showZoomControl: false,
    showHomeControl: false,
    showFullPageControl: false,
    showRotationControl: false,
    animationTime: 0.5,
    blendTime: 0.1,
    constrainDuringPan: true,
    visibilityRatio: 1,
    minZoomLevel: 0.5,
    maxZoomLevel: 10,
    defaultZoomLevel: 1,
  })
}

function zoomIn() {
  viewer?.viewport.zoomBy(1.5)
}

function zoomOut() {
  viewer?.viewport.zoomBy(0.67)
}

function resetZoom() {
  viewer?.viewport.goHome()
}

async function handleSave() {
  if (!pageData.value?.currentProofreadingId) return
  const result = await saveProofreading(
    bookId,
    pageId,
    String(pageData.value.currentProofreadingId),
    textContent.value
  )
  alert(result.success ? '保存成功' : result.error)
}

async function handleSubmit() {
  if (!pageData.value?.currentProofreadingId) return
  if (!confirm('确定提交校对结果？提交后将无法修改。')) return
  
  const result = await submitProofreading(
    bookId,
    pageId,
    String(pageData.value.currentProofreadingId),
    textContent.value
  )
  if (result.success) {
    alert('提交成功')
    router.back()
  } else {
    alert(result.error)
  }
}

async function handleRelease() {
  if (!confirm('确定释放该页面？其他校对员可以认领。')) return
  const result = await releasePage(bookId, pageId)
  if (result.success) {
    router.back()
  } else {
    alert(result.error)
  }
}

function handleSelection(e: Event) {
  const target = e.target as HTMLTextAreaElement
  const start = target.selectionStart
  const end = target.selectionEnd
  
  if (end > start && end - start <= 2) {
    const char = textContent.value.substring(start, end)
    if (char.trim()) {
      const rect = target.getBoundingClientRect()
      selectedChar.value = char
      dictPosition.value = {
        x: rect.left + 100,
        y: rect.top + 100,
      }
      lookupChar(char)
    }
  }
}

function handleTextClick(e: MouseEvent) {
}

async function lookupChar(char: string) {
  showDictionary.value = true
  dictLoading.value = true
  dictionaryVariants.value = []
  
  const result = await lookupDictionary(char)
  if (result.success) {
    dictionaryVariants.value = result.data.variants
  }
  dictLoading.value = false
}

function closeDictionary() {
  showDictionary.value = false
  selectedChar.value = ''
}

function insertVariant(char: string) {
  if (!textareaRef.value) return
  
  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  
  const before = textContent.value.substring(0, start)
  const after = textContent.value.substring(end)
  
  textContent.value = before + char + after
  closeDictionary()
  
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + char.length
      textareaRef.value.focus()
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault()
    const target = textareaRef.value
    if (target) {
      const start = target.selectionStart
      const char = textContent.value.substring(start, start + 1)
      if (char) {
        selectedChar.value = char
        const rect = target.getBoundingClientRect()
        dictPosition.value = {
          x: rect.left + 100,
          y: rect.top + 100,
        }
        lookupChar(char)
      }
    }
  }
  if (e.key === 'Escape') {
    closeDictionary()
  }
}

onMounted(() => {
  loadPage()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
  }
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
.openseadragon-canvas {
  background-color: #1a1a2e !important;
}
</style>
