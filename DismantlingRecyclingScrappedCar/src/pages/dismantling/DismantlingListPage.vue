<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Eye, Wrench, Filter } from 'lucide-vue-next'
import type { DismantlingTask } from '../../../shared/types'
import { http } from '@/utils/request'

const router = useRouter()
const tasks = ref<DismantlingTask[]>([])
const activeFilter = ref<'all' | 'pending' | 'in_progress' | 'completed'>('all')
const loading = ref(false)

const filters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' }
] as const

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  return tasks.value.filter(t => t.status === activeFilter.value)
})

const statusMap = {
  pending: { label: '待开始', class: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-600' },
  completed: { label: '已完成', class: 'bg-green-100 text-green-600' }
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await http.get<DismantlingTask[]>('/dismantling')
    if (res.success && res.data) {
      tasks.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch tasks:', e)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push('/dismantling/create')
}

const handleStartDismantling = (task: DismantlingTask) => {
  router.push(`/dismantling/${task.id}`)
}

const handleViewDetail = (task: DismantlingTask) => {
  router.push(`/dismantling/${task.id}`)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">拆解任务管理</h1>
        <p class="text-gray-500 mt-1">管理报废车辆的拆解任务流程</p>
      </div>
      <button
        @click="handleCreate"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-5 h-5" />
        创建拆解任务
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-gray-500">
            <Filter class="w-4 h-4" />
            <span class="text-sm font-medium">状态筛选</span>
          </div>
          <div class="flex gap-2">
            <button
              v-for="filter in filters"
              :key="filter.key"
              @click="activeFilter = filter.key"
              :class="[
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
          <div class="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Search class="w-4 h-4" />
            共 {{ filteredTasks.length }} 条记录
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车主</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始日期</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <tr v-else-if="filteredTasks.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                暂无拆解任务
              </td>
            </tr>
            <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ task.vehicle?.plateNumber || '-' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                {{ task.vehicle?.vin || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ task.vehicle?.owner || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusMap[task.status].class]">
                  {{ statusMap[task.status].label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ formatDate(task.startDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="task.status === 'pending'"
                    @click="handleStartDismantling(task)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Wrench class="w-4 h-4" />
                    进入拆解
                  </button>
                  <button
                    v-else-if="task.status === 'in_progress'"
                    @click="handleStartDismantling(task)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Wrench class="w-4 h-4" />
                    继续拆解
                  </button>
                  <button
                    @click="handleViewDetail(task)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                    查看详情
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
