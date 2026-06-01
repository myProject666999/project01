<template>
  <div>
    <div class="bg-primary px-5 pt-12 pb-6">
      <h1 class="text-white text-xl font-bold">口岸通关预约</h1>
      <p class="text-white/70 text-sm mt-1">选择口岸进行预约排队</p>
    </div>

    <div class="px-4 -mt-4">
      <div class="bg-white rounded-xl shadow-sm flex items-center px-3 py-2.5 gap-2">
        <Search class="w-5 h-5 text-gray-400 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索口岸名称..."
          class="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
        />
      </div>
    </div>

    <div class="px-4 mt-4 pb-6">
      <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>

      <div v-else-if="filteredPorts.length === 0" class="text-center py-12 text-gray-400">
        未找到口岸
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="port in filteredPorts"
          :key="port.id"
          class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 active:bg-gray-50 transition-colors cursor-pointer"
          @click="goToAppointment(port.id)"
        >
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Truck class="w-5 h-5 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-gray-900 truncate">{{ port.name }}</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400">货车通道 {{ port.cargoLaneCount }}</span>
              <span class="text-gray-300">|</span>
              <span class="text-xs text-gray-400">客车通道 {{ port.passengerLaneCount }}</span>
            </div>
          </div>
          <span
            class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
            :class="congestionClass(port.currentCongestionLevel)"
          >
            {{ congestionLabel(port.currentCongestionLevel) }}
          </span>
          <ChevronRight class="w-4 h-4 text-gray-300 shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ChevronRight, Truck } from 'lucide-vue-next'
import { getPorts, type PortDTO } from '@/utils/api'

const router = useRouter()
const ports = ref<PortDTO[]>([])
const loading = ref(true)
const searchQuery = ref('')

const filteredPorts = computed(() => {
  if (!searchQuery.value) return ports.value
  return ports.value.filter((p) => p.name.includes(searchQuery.value))
})

const congestionLabel = (level: string) => {
  const map: Record<string, string> = { SMOOTH: '畅通', MODERATE: '适中', SEVERE: '拥堵' }
  return map[level] || '未知'
}

const congestionClass = (level: string) => {
  const map: Record<string, string> = {
    SMOOTH: 'bg-green-50 text-green-600',
    MODERATE: 'bg-yellow-50 text-yellow-600',
    SEVERE: 'bg-red-50 text-red-600',
  }
  return map[level] || 'bg-gray-50 text-gray-600'
}

const goToAppointment = (portId: number) => {
  router.push(`/appointment/${portId}`)
}

onMounted(async () => {
  try {
    ports.value = await getPorts()
  } catch {
    ports.value = []
  } finally {
    loading.value = false
  }
})
</script>
