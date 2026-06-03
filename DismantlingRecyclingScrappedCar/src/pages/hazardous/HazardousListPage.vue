<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, FileText, Filter, Search } from 'lucide-vue-next'
import type { HazardousWaste, Vehicle } from '../../../shared/types'
import { http } from '@/utils/request'

const router = useRouter()
const wastes = ref<(HazardousWaste & { vehicle?: Vehicle })[]>([])
const typeFilter = ref<'all' | 'oil' | 'antifreeze' | 'battery' | 'other'>('all')
const statusFilter = ref<'all' | 'pending' | 'transferred' | 'completed'>('all')
const loading = ref(false)
const showCreateModal = ref(false)

const typeFilters = [
  { key: 'all', label: '全部' },
  { key: 'oil', label: '机油' },
  { key: 'antifreeze', label: '防冻液' },
  { key: 'battery', label: '铅酸电池' },
  { key: 'other', label: '其他' }
] as const

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待转运' },
  { key: 'transferred', label: '转运中' },
  { key: 'completed', label: '已完成' }
] as const

const typeMap = {
  oil: { label: '机油', class: 'bg-amber-100 text-amber-700' },
  antifreeze: { label: '防冻液', class: 'bg-cyan-100 text-cyan-700' },
  battery: { label: '铅酸电池', class: 'bg-purple-100 text-purple-700' },
  other: { label: '其他', class: 'bg-gray-100 text-gray-700' }
}

const statusMap = {
  pending: { label: '待转运', class: 'bg-yellow-100 text-yellow-700' },
  transferred: { label: '转运中', class: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', class: 'bg-green-100 text-green-700' }
}

const filteredWastes = computed(() => {
  return wastes.value.filter(w => {
    const typeMatch = typeFilter.value === 'all' || w.type === typeFilter.value
    const statusMatch = statusFilter.value === 'all' || w.status === statusFilter.value
    return typeMatch && statusMatch
  })
})

const fetchWastes = async () => {
  loading.value = true
  try {
    const res = await http.get<(HazardousWaste & { vehicle?: Vehicle })[]>('/hazardous/wastes')
    if (res.success && res.data) {
      wastes.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch wastes:', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleCreateWaybill = (waste: HazardousWaste) => {
  router.push({ path: '/hazardous/waybills', query: { wasteId: String(waste.id) }})
}

onMounted(() => {
  fetchWastes()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">危废管理</h1>
        <p class="text-gray-500 mt-1">管理报废车辆拆解产生的危险废弃物</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-5 h-5" />
        登记危废
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2 text-gray-500">
            <Filter class="w-4 h-4" />
            <span class="text-sm font-medium">类型筛选</span>
          </div>
          <div class="flex gap-2">
            <button
              v-for="filter in typeFilters"
              :key="filter.key"
              @click="typeFilter = filter.key"
              :class="[
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                typeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>

          <div class="w-px h-6 bg-gray-200" />

          <div class="flex items-center gap-2 text-gray-500">
            <Filter class="w-4 h-4" />
            <span class="text-sm font-medium">状态筛选</span>
          </div>
          <div class="flex gap-2">
            <button
              v-for="filter in statusFilters"
              :key="filter.key"
              @click="statusFilter = filter.key"
              :class="[
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                statusFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>

          <div class="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Search class="w-4 h-4" />
            共 {{ filteredWastes.length }} 条记录
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">危废类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量(kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">来源车辆</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登记时间</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <tr v-else-if="filteredWastes.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                暂无危废记录
              </td>
            </tr>
            <tr v-for="waste in filteredWastes" :key="waste.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', typeMap[waste.type].class]">
                  {{ typeMap[waste.type].label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                {{ waste.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ waste.weight.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ waste.vehicle?.plateNumber || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusMap[waste.status].class]">
                  {{ statusMap[waste.status].label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ formatDate(waste.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  v-if="waste.status === 'pending'"
                  @click="handleCreateWaybill(waste)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <FileText class="w-4 h-4" />
                  生成联单
                </button>
                <span v-else class="text-gray-400 text-sm">
                  -
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">登记危废</h3>
          <p class="text-sm text-gray-500 mt-1">请填写危废信息</p>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">危废类型</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="oil">机油</option>
              <option value="antifreeze">防冻液</option>
              <option value="battery">铅酸电池</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="请输入危废名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">重量(kg)</label>
            <input
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="请输入重量"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">来源车辆</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>请选择车辆</option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            确认登记
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
