<template>
  <div>
    <div class="bg-primary px-5 pt-12 pb-6 flex items-center gap-3">
      <button class="text-white" @click="router.back()">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-white text-lg font-bold">排队实时信息</h1>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-400">加载中...</div>

    <div v-else-if="queueInfo" class="px-4 mt-4 space-y-5 pb-6">
      <div class="text-center">
        <h2 class="text-lg font-bold text-gray-900">{{ queueInfo.portName }}</h2>
      </div>

      <div class="flex justify-center py-4">
        <div class="relative w-36 h-36">
          <svg class="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="10"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              :stroke="progressColor"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
              class="transition-all duration-700"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-3xl font-bold" :style="{ color: progressColor }">
              {{ queueInfo.waitingCount }}
            </span>
            <span class="text-xs text-gray-500 mt-0.5">辆</span>
          </div>
        </div>
      </div>

      <div class="text-center space-y-1">
        <div class="text-lg font-bold text-gray-900">前方等待: {{ queueInfo.waitingCount }}辆</div>
        <div class="text-base text-gray-500">预计等待: {{ queueInfo.estimatedWaitMinutes }}分钟</div>
      </div>

      <div>
        <div class="text-sm font-medium text-gray-700 mb-3">通道状态</div>
        <div class="space-y-2">
          <div
            v-for="lane in queueInfo.lanes"
            :key="lane.laneId"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :class="laneStatusDot(lane.status)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900 text-sm">{{ lane.laneName }}</span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded"
                  :class="lane.laneType === 'CARGO' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
                >
                  {{ lane.laneType === 'CARGO' ? '货车' : '客车' }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">等待 {{ lane.waitingCount }} 辆</div>
            </div>
            <span
              class="text-xs font-medium px-2 py-1 rounded-full"
              :class="laneStatusBadge(lane.status)"
            >
              {{ laneStatusLabel(lane.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getQueueInfo, type QueueInfoDTO } from '@/utils/api'

const router = useRouter()
const route = useRoute()

const portId = Number(route.params.portId)
const queueInfo = ref<QueueInfoDTO | null>(null)
const loading = ref(true)

const circumference = 2 * Math.PI * 60

const progressOffset = computed(() => {
  if (!queueInfo.value) return circumference
  const maxCount = 100
  const ratio = Math.min(queueInfo.value.waitingCount / maxCount, 1)
  return circumference * (1 - ratio)
})

const progressColor = computed(() => {
  if (!queueInfo.value) return '#1B3A5C'
  const count = queueInfo.value.waitingCount
  if (count <= 20) return '#22c55e'
  if (count <= 50) return '#f59e0b'
  return '#ef4444'
})

const laneStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    OPEN: '开放',
    CLOSED: '关闭',
    BUSY: '繁忙',
  }
  return map[status] || status
}

const laneStatusDot = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'bg-green-500',
    CLOSED: 'bg-gray-400',
    BUSY: 'bg-yellow-500',
  }
  return map[status] || 'bg-gray-400'
}

const laneStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    OPEN: 'bg-green-50 text-green-600',
    CLOSED: 'bg-gray-100 text-gray-500',
    BUSY: 'bg-yellow-50 text-yellow-600',
  }
  return map[status] || 'bg-gray-50 text-gray-500'
}

onMounted(async () => {
  try {
    queueInfo.value = await getQueueInfo(portId)
  } catch {
    queueInfo.value = null
  } finally {
    loading.value = false
  }
})
</script>
