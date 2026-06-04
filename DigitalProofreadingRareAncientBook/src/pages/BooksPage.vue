<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-serif text-ink-900 mb-2">书籍管理</h1>
        <p class="text-ink-500">查看和管理所有待校对的古籍</p>
      </div>
      <button
        v-if="isAdmin"
        class="px-6 py-2 bg-vermilion-500 hover:bg-vermilion-600 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        新增书籍
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-ink-300 border-t-vermilion-500 rounded-full"></div>
    </div>

    <div v-else-if="error" class="text-center py-16 text-vermilion-500">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="bg-white rounded-lg border border-ink-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        @click="openBook(book.id)"
      >
        <div class="h-40 bg-gradient-to-br from-ink-800 to-ink-900 flex items-center justify-center relative">
          <span class="text-5xl">📖</span>
          <div class="absolute top-3 right-3">
            <span
              class="px-2 py-1 text-xs rounded"
              :class="book.status === 'completed' ? 'bg-pine-500 text-white' : 'bg-ink-600 text-ink-100'"
            >
              {{ book.status === 'completed' ? '已完成' : '校对中' }}
            </span>
          </div>
        </div>
        <div class="p-5">
          <h3 class="text-lg font-serif text-ink-900 mb-2">{{ book.title }}</h3>
          <div class="text-sm text-ink-500 space-y-1 mb-4">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4" />
              <span>{{ book.author || '佚名' }} · {{ book.dynasty || '不详' }}</span>
            </div>
          </div>
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-ink-500">校对进度</span>
              <span class="text-ink-700">{{ book.completedPages }} / {{ book.totalPages }} 页</span>
            </div>
            <div class="w-full h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-pine-500 transition-all"
                :style="{ width: `${book.totalPages ? (book.completedPages / book.totalPages) * 100 : 0}%` }"
              ></div>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-ink-400">
            <span>共 {{ book.totalPages }} 页</span>
            <span class="flex items-center gap-1 text-indigo-500">
              查看详情
              <ChevronRight class="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, User, ChevronRight } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { getBooks } from '@/composables/useApi'

const router = useRouter()
const { isAdmin } = useAuth()

const books = ref<any[]>([])
const loading = ref(true)
const error = ref('')

async function loadBooks() {
  loading.value = true
  error.value = ''
  try {
    const result = await getBooks()
    if (result.success) {
      books.value = result.data
    } else {
      error.value = result.error
    }
  } catch (e) {
    error.value = '加载失败，请刷新重试'
  } finally {
    loading.value = false
  }
}

function openBook(id: number) {
  router.push(`/books/${id}/pages`)
}

onMounted(loadBooks)
</script>
