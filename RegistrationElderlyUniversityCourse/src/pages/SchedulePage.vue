<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get } from '@/lib/api'
import type { Enrollment, Course } from '@/lib/types'
import Empty from '@/components/Empty.vue'

interface ScheduleItem {
  day: number
  courseName: string
  time: string
  classroom: string
  teacher: string
  category: string
}

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const colors: Record<string, string> = {
  '书画': 'bg-red-100 border-red-400 text-red-800',
  '声乐': 'bg-blue-100 border-blue-400 text-blue-800',
  '舞蹈': 'bg-purple-100 border-purple-400 text-purple-800',
  '手工': 'bg-green-100 border-green-400 text-green-800',
}

const scheduleItems = ref<ScheduleItem[]>([])
const loading = ref(true)
const activeDay = ref(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)

onMounted(async () => {
  try {
    const res = await get<(Enrollment & { course?: Course })[]>('/enrollments/schedule')
    if (res.code === 0) {
      scheduleItems.value = res.data.map((e) => {
        const c = e.course || ({} as Course)
        const dayMap: Record<string, number> = { '周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4, '周六': 5, '周日': 6 }
        const day = dayMap[c.schedule_day] ?? 0
        return {
          day,
          courseName: c.name || '未知课程',
          time: c.schedule_time || '',
          classroom: c.classroom || '',
          teacher: c.teacher || '',
          category: c.category || '',
        }
      })
    }
  } catch { /* */ } finally {
    loading.value = false
  }
})

const dayItems = computed(() =>
  scheduleItems.value.filter(item => item.day === activeDay.value)
)

const allDaysHaveItems = computed(() => {
  const daysWithItems = new Set(scheduleItems.value.map(i => i.day))
  return daysWithItems.size
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <h1 class="text-xl4 font-bold text-secondary mb-4">我的课表</h1>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <Empty v-else-if="scheduleItems.length === 0" message="暂无课程安排" />
    <template v-else>
      <div class="flex gap-1 mb-4 overflow-x-auto pb-2">
        <button
          v-for="(day, idx) in days"
          :key="idx"
          @click="activeDay = idx"
          class="flex-1 min-w-[60px] py-3 rounded-xl2 text-base font-bold text-center transition-colors"
          :class="activeDay === idx
            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
            : 'bg-white text-secondary'"
        >
          {{ day }}
        </button>
      </div>

      <div v-if="dayItems.length === 0" class="text-center py-12 text-secondary-light text-xl">
        今天没有课程 🎉
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="item in dayItems"
          :key="item.courseName"
          class="p-4 rounded-xl2 border-l-4"
          :class="colors[item.category] || 'bg-gray-100 border-gray-400 text-gray-800'"
        >
          <h3 class="text-xl2 font-bold mb-1">{{ item.courseName }}</h3>
          <p class="text-base">{{ item.time }}</p>
          <p class="text-base">{{ item.classroom }} · {{ item.teacher }}</p>
        </div>
      </div>

      <div class="mt-6">
        <h2 class="text-xl2 font-bold text-secondary mb-3">本周总览</h2>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="(day, idx) in days" :key="idx" class="text-center">
            <div class="text-sm font-bold text-secondary mb-1">{{ day }}</div>
            <div
              class="min-h-[40px] rounded-lg flex items-center justify-center"
              :class="scheduleItems.some(i => i.day === idx) ? 'bg-primary/20' : 'bg-cream-dark'"
            >
              <span v-if="scheduleItems.some(i => i.day === idx)" class="text-primary text-sm font-bold">
                {{ scheduleItems.filter(i => i.day === idx).length }}门
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
