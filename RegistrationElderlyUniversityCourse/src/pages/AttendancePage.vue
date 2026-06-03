<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get } from '@/lib/api'
import type { AttendanceRecord, AttendanceStats } from '@/lib/types'
import Empty from '@/components/Empty.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const records = ref<AttendanceRecord[]>([])
const stats = ref<AttendanceStats | null>(null)
const loading = ref(true)
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)

const monthLabel = computed(() => `${year.value}年${month.value}月`)

const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())
const firstDayOfWeek = computed(() => (new Date(year.value, month.value - 1, 1).getDay() + 6) % 7)

const attendanceMap = computed(() => {
  const map = new Map<string, number>()
  if (records.value) {
    records.value.forEach(r => {
      if (r && r.attendance_date) {
        map.set(r.attendance_date.slice(0, 10), r.status)
      }
    })
  }
  return map
})

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    const monthStr = `${year.value}-${String(month.value).padStart(2, '0')}`
    const [recordsRes, statsRes] = await Promise.all([
      get<AttendanceRecord[]>('/attendance/my', { month: monthStr }),
      get<AttendanceStats>('/attendance/stats'),
    ])
    if (recordsRes.code === 0) records.value = recordsRes.data || []
    if (statsRes.code === 0) stats.value = statsRes.data || { present: 0, absent: 0, leave: 0 }
  } catch { /* */ } finally {
    loading.value = false
  }
}

function prevMonth() {
  if (month.value === 1) { month.value = 12; year.value-- }
  else month.value--
  fetchData()
}

function nextMonth() {
  if (month.value === 12) { month.value = 1; year.value++ }
  else month.value++
  fetchData()
}

function getStatusIcon(day: number) {
  const dateStr = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const status = attendanceMap.value.get(dateStr)
  if (status === 1) return { icon: '✓', class: 'bg-green-100 text-green-600' }
  if (status === 0) return { icon: '✗', class: 'bg-red-100 text-red-600' }
  if (status === 2) return { icon: '△', class: 'bg-yellow-100 text-yellow-600' }
  return null
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <h1 class="text-xl4 font-bold text-secondary mb-4">考勤查询</h1>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <template v-else>
      <div class="flex items-center justify-between mb-4 bg-white rounded-xl2 p-3 shadow-sm">
        <button @click="prevMonth" class="p-3 rounded-xl2 hover:bg-cream-dark active:scale-95 transition">
          <ChevronLeft class="w-6 h-6 text-secondary" />
        </button>
        <span class="text-xl2 font-bold text-secondary">{{ monthLabel }}</span>
        <button @click="nextMonth" class="p-3 rounded-xl2 hover:bg-cream-dark active:scale-95 transition">
          <ChevronRight class="w-6 h-6 text-secondary" />
        </button>
      </div>

      <div v-if="stats" class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white rounded-xl2 p-3 text-center shadow-sm">
          <div class="text-xl3 font-bold text-primary">{{ stats.present + stats.absent + stats.leave > 0 ? ((stats.present / (stats.present + stats.absent + stats.leave)) * 100).toFixed(0) : 0 }}%</div>
          <div class="text-base text-secondary-light">出勤率</div>
        </div>
        <div class="bg-white rounded-xl2 p-3 text-center shadow-sm">
          <div class="text-xl3 font-bold text-green-600">{{ stats.present }}</div>
          <div class="text-base text-secondary-light">出勤</div>
        </div>
        <div class="bg-white rounded-xl2 p-3 text-center shadow-sm">
          <div class="text-xl3 font-bold text-red-500">{{ stats.absent }}</div>
          <div class="text-base text-secondary-light">缺勤</div>
        </div>
      </div>

      <div class="bg-white rounded-xl2 p-4 shadow-sm">
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="text-center text-sm font-bold text-secondary-light py-1">
            周{{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="n in firstDayOfWeek" :key="'e'+n" class="aspect-square"></div>
          <div v-for="day in daysInMonth" :key="day" class="aspect-square flex items-center justify-center">
            <div
              v-if="getStatusIcon(day)"
              class="w-10 h-10 rounded-xl2 flex flex-col items-center justify-center"
              :class="getStatusIcon(day)!.class"
            >
              <span class="text-xs font-bold">{{ day }}</span>
              <span class="text-sm font-bold leading-none">{{ getStatusIcon(day)!.icon }}</span>
            </div>
            <div v-else class="w-10 h-10 rounded-xl2 flex items-center justify-center text-base text-secondary-light">
              {{ day }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mt-4 text-base text-secondary-light">
        <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded bg-green-100"></span> 出勤 ✓</span>
        <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded bg-red-100"></span> 缺勤 ✗</span>
        <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded bg-yellow-100"></span> 请假 △</span>
      </div>
    </template>
  </div>
</template>
