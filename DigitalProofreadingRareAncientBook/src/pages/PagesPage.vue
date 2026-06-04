<template>
  <div class="p-8">
    <div class="flex items-center gap-4 mb-8">
      <button @click="$router.back()" class="text-ink-500 hover:text-ink-700">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div>
        <h1 class="text-2xl font-serif text-ink-900 mb-1">{{ book?.title }}</h1>
        <p class="text-ink-500">{{ book?.author || '佚名' }} · {{ book?.dynasty || '不详' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg p-4 border border-ink-200">
        <div class="text-3xl font-serif text-ink-900 mb-1">{{ pages.length }}</div>
        <div class="text-sm text-ink-500">总页数</div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-ink-200">
        <div class="text-3xl font-serif text-ink-600 mb-1">{{ countByStatus('unclaimed') + countByStatus('proofreading') + countByStatus('first_done') }}</div>
        <div class="text-sm text-ink-500">待校对</div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-ink-200">
        <div class="text-3xl font-serif text-indigo-500 mb-1">{{ countByStatus('pending_review') }}</div>
        <div class="text-sm text-ink-500">待审稿</div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-ink-200">
        <div class="text-3xl font-serif text-pine-500 mb-1">{{ countByStatus('finalized') }}</div>
        <div class="text-sm text-ink-500">已定稿</div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-ink-300 border-t-vermilion-500 rounded-full"></div>
    </div>

    <div v-else class="grid grid-cols-4 gap-6">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-ink-300"></div>
          <h3 class="font-medium text-ink-700">待认领</h3>
          <span class="text-xs text-ink-500">({{ getPagesByStatus('unclaimed').length }})</span>
        </div>
        <div class="space-y-3">
          <PageCard
            v-for="page in getPagesByStatus('unclaimed')"
            :key="page.id"
            :page="page"
            @claim="handleClaim(page.id)"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
          <h3 class="font-medium text-ink-700">校对中</h3>
          <span class="text-xs text-ink-500">({{ getPagesByStatus('proofreading').length + getPagesByStatus('first_done').length }})</span>
        </div>
        <div class="space-y-3">
          <PageCard
            v-for="page in [...getPagesByStatus('proofreading'), ...getPagesByStatus('first_done')]"
            :key="page.id"
            :page="page"
            @open="openProofread(page.id)"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-vermilion-500"></div>
          <h3 class="font-medium text-ink-700">待审稿</h3>
          <span class="text-xs text-ink-500">({{ getPagesByStatus('pending_review').length }})</span>
        </div>
        <div class="space-y-3">
          <PageCard
            v-for="page in getPagesByStatus('pending_review')"
            :key="page.id"
            :page="page"
            @review="openReview(page.id)"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-pine-500"></div>
          <h3 class="font-medium text-ink-700">已定稿</h3>
          <span class="text-xs text-ink-500">({{ getPagesByStatus('finalized').length }})</span>
        </div>
        <div class="space-y-3">
          <PageCard
            v-for="page in getPagesByStatus('finalized')"
            :key="page.id"
            :page="page"
            frozen
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getBook, getPages, claimPage } from '@/composables/useApi'
import PageCard from '@/components/PageCard.vue'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id as string

const book = ref<any>(null)
const pages = ref<any[]>([])
const loading = ref(true)

async function loadData() {
  loading.value = true
  const [bookResult, pagesResult] = await Promise.all([
    getBook(bookId),
    getPages(bookId),
  ])
  if (bookResult.success) {
    book.value = bookResult.data
  }
  if (pagesResult.success) {
    pages.value = pagesResult.data
  }
  loading.value = false
}

function countByStatus(status: string) {
  return pages.value.filter((p) => p.status === status).length
}

function getPagesByStatus(status: string) {
  return pages.value.filter((p) => p.status === status)
}

async function handleClaim(pageId: number) {
  const result = await claimPage(bookId, String(pageId))
  if (result.success) {
    await loadData()
    router.push(`/proofread/${bookId}/${pageId}`)
  } else {
    alert(result.error || '认领失败')
  }
}

function openProofread(pageId: number) {
  router.push(`/proofread/${bookId}/${pageId}`)
}

function openReview(pageId: number) {
  router.push(`/review/${bookId}/${pageId}`)
}

onMounted(loadData)
</script>
