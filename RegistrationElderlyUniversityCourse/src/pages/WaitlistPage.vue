<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/lib/api'
import type { WaitlistEntry, Course } from '@/lib/types'
import Empty from '@/components/Empty.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const entries = ref<(WaitlistEntry & { course?: Course })[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await get<(WaitlistEntry & { course?: Course })[]>('/waitlist/my')
    if (res.code === 0) entries.value = res.data
  } catch { /* */ } finally {
    loading.value = false
  }
})

function getProgressWidth(entry: WaitlistEntry) {
  if (!entry.course) return 0
  const total = entry.course.capacity
  const position = entry.position
  return Math.max(5, Math.min(100, ((total - position) / total) * 100))
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <h1 class="text-xl4 font-bold text-secondary mb-4">候补状态</h1>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <Empty v-else-if="entries.length === 0" message="暂无候补课程" />
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="bg-white rounded-xl2 shadow-sm p-5"
      >
        <div class="flex items-start gap-4">
          <div class="flex flex-col items-center justify-center w-20 h-20 rounded-xl2 bg-yellow-100 flex-shrink-0">
            <span class="text-xl4 font-bold text-yellow-600">{{ entry.position }}</span>
            <span class="text-sm text-yellow-600">位次</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl2 font-bold text-secondary mb-1">{{ entry.course?.name || '未知课程' }}</h3>
            <p class="text-base text-secondary-light mb-1">{{ entry.course?.teacher }} · {{ entry.course?.schedule_day }} {{ entry.course?.schedule_time }}</p>
            <p class="text-base text-secondary-light mb-3">排队时间：{{ entry.created_at?.slice(0, 10) }}</p>
            <div class="w-full bg-cream-dark rounded-full h-4">
              <div
                class="bg-gradient-to-r from-yellow-400 to-primary h-4 rounded-full transition-all"
                :style="{ width: getProgressWidth(entry) + '%' }"
              ></div>
            </div>
            <p class="text-sm text-secondary-light mt-1">
              {{ entry.course?.enrolled_count || 0 }}/{{ entry.course?.capacity || 0 }} 人已报名
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
