<template>
  <div class="h-screen flex flex-col bg-ink-50">
    <header class="bg-white border-b border-ink-200 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="$router.back()" class="text-ink-500 hover:text-ink-700">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-lg font-serif text-ink-900">审稿定稿 - 第 {{ pageNumber }} 页</h1>
          <p class="text-xs text-ink-500">双人校对对照，差异已高亮</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="handleFinalize"
          class="px-4 py-2 text-sm bg-pine-500 hover:bg-pine-600 text-white rounded transition-colors flex items-center gap-2"
        >
          <CheckCircle class="w-4 h-4" />
          定稿冻结
        </button>
      </div>
    </header>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 flex overflow-hidden">
        <div class="w-1/2 flex flex-col bg-white border-r border-ink-200">
          <div class="px-4 py-2 border-b border-ink-200 bg-indigo-50">
            <span class="text-sm text-indigo-700 font-medium">校对员 A: {{ reviewData?.proofreading1?.username }}</span>
          </div>
          <div class="flex-1 flex overflow-hidden">
            <div class="w-12 bg-ink-50 border-r border-ink-200 text-right py-4 px-2 select-none overflow-hidden">
              <div v-for="n in Math.max(lines1.length, lines2.length)" :key="n" class="text-xs text-ink-400 leading-8 font-mono">
                {{ n }}
              </div>
            </div>
            <div class="flex-1 overflow-auto scrollbar-thin">
              <div v-for="(line, idx) in lines1" :key="idx" class="px-4 leading-8 font-serif text-lg"
                :class="{ 'bg-vermilion-100': hasDifference(idx) }">
                {{ line || '&nbsp;' }}
              </div>
            </div>
          </div>
        </div>

        <div class="w-1/2 flex flex-col bg-white">
          <div class="px-4 py-2 border-b border-ink-200 bg-vermilion-50">
            <span class="text-sm text-vermilion-700 font-medium">校对员 B: {{ reviewData?.proofreading2?.username }}</span>
          </div>
          <div class="flex-1 flex overflow-hidden">
            <div class="w-12 bg-ink-50 border-r border-ink-200 text-right py-4 px-2 select-none overflow-hidden">
              <div v-for="n in Math.max(lines1.length, lines2.length)" :key="n" class="text-xs text-ink-400 leading-8 font-mono">
                {{ n }}
              </div>
            </div>
            <div class="flex-1 overflow-auto scrollbar-thin">
              <div v-for="(line, idx) in lines2" :key="idx" class="px-4 leading-8 font-serif text-lg"
                :class="{ 'bg-vermilion-100': hasDifference(idx) }">
                {{ line || '&nbsp;' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-72 border-t-2 border-ink-300 flex flex-col bg-ink-900">
        <div class="px-4 py-2 border-b border-ink-700 flex items-center justify-between bg-ink-800">
          <span class="text-sm text-ink-200 font-medium flex items-center gap-2">
            <Edit3 class="w-4 h-4" />
            定稿文本 (点击左侧行号或直接编辑)
          </span>
          <span class="text-xs text-ink-400">共 {{ differenceCount }} 处差异</span>
        </div>
        <div class="flex-1 flex overflow-hidden">
          <div class="w-12 bg-ink-800 border-r border-ink-700 text-right py-4 px-2 select-none overflow-hidden">
            <div
              v-for="n in finalLines.length"
              :key="n"
              class="text-xs leading-8 font-mono cursor-pointer transition-colors"
              :class="hasDifference(n-1) ? 'text-vermilion-400 hover:text-vermilion-300' : 'text-ink-500 hover:text-ink-300'"
              @click="useLineFromA(n-1)"
              @contextmenu.prevent="useLineFromB(n-1)"
              :title="hasDifference(n-1) ? '左键用A版，右键用B版' : '无差异'"
            >
              {{ n }}
            </div>
          </div>
          <div class="flex-1 relative">
            <textarea
              v-model="finalText"
              class="w-full h-full p-4 resize-none focus:outline-none font-serif text-lg leading-8 text-ink-100 bg-ink-900"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle, Edit3 } from 'lucide-vue-next'
import { getReview, finalizeReview } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const bookId = route.params.bookId as string
const pageId = route.params.pageId as string

const pageNumber = ref(0)
const reviewData = ref<any>(null)
const finalText = ref('')

const lines1 = computed(() => reviewData.value?.proofreading1?.textContent?.split('\n') || [])
const lines2 = computed(() => reviewData.value?.proofreading2?.textContent?.split('\n') || [])
const finalLines = computed(() => finalText.value.split('\n'))

const differenceCount = computed(() => {
  if (!reviewData.value?.differences) return 0
  return reviewData.value.differences.length
})

function hasDifference(idx: number) {
  if (!reviewData.value?.differences) return false
  return reviewData.value.differences.some((d: any) => d.lineIndex === idx)
}

function useLineFromA(idx: number) {
  const lines = finalText.value.split('\n')
  if (lines1.value[idx] !== undefined) {
    lines[idx] = lines1.value[idx]
    finalText.value = lines.join('\n')
  }
}

function useLineFromB(idx: number) {
  const lines = finalText.value.split('\n')
  if (lines2.value[idx] !== undefined) {
    lines[idx] = lines2.value[idx]
    finalText.value = lines.join('\n')
  }
}

async function loadReview() {
  const result = await getReview(bookId, pageId)
  if (result.success) {
    reviewData.value = result.data
    pageNumber.value = parseInt(pageId)
    
    if (result.data.review) {
      finalText.value = result.data.review.finalText
    } else {
      const merged: string[] = []
      const maxLen = Math.max(lines1.value.length, lines2.value.length)
      for (let i = 0; i < maxLen; i++) {
        merged.push(lines1.value[i] || lines2.value[i] || '')
      }
      finalText.value = merged.join('\n')
    }
  }
}

async function handleFinalize() {
  if (!confirm('确定定稿？定稿后页面将被冻结，无法再修改。')) return
  
  const result = await finalizeReview(bookId, pageId, finalText.value)
  if (result.success) {
    alert('定稿成功，页面已冻结')
    router.back()
  } else {
    alert(result.error)
  }
}

onMounted(loadReview)
</script>
