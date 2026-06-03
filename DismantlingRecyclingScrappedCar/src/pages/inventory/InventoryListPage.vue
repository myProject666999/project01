<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter, Plus, ArrowRightFromLine } from 'lucide-vue-next'
import type { InventoryItem } from '../../../shared/types'
import { http } from '@/utils/request'

const router = useRouter()
const items = ref<InventoryItem[]>([])
const searchQuery = ref('')
const activeFilter = ref<'all' | 'in_stock' | 'sold'>('all')
const loading = ref(false)
const showOutboundModal = ref(false)
const selectedItem = ref<InventoryItem | null>(null)

const outboundForm = ref({
  buyer: '',
  price: 0
})

const filters = [
  { key: 'all', label: '全部' },
  { key: 'in_stock', label: '在库' },
  { key: 'sold', label: '已售出' }
] as const

const statusMap = {
  in_stock: { label: '在库', class: 'bg-green-100 text-green-600' },
  sold: { label: '已售出', class: 'bg-gray-100 text-gray-600' }
}

const filteredItems = computed(() => {
  let result = items.value
  if (activeFilter.value !== 'all') {
    result = result.filter(i => i.status === activeFilter.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(i => i.partName.toLowerCase().includes(query))
  }
  return result
})

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await http.get<InventoryItem[]>('/inventory')
    if (res.success && res.data) {
      items.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch inventory:', e)
  } finally {
    loading.value = false
  }
}

const handleInbound = () => {
  router.push('/inventory/inbound')
}

const handleOutbound = (item: InventoryItem) => {
  selectedItem.value = item
  outboundForm.value = {
    buyer: '',
    price: item.price || 0
  }
  showOutboundModal.value = true
}

const confirmOutbound = async () => {
  if (!selectedItem.value || !outboundForm.value.buyer) {
    alert('请填写买家信息')
    return
  }
  try {
    const res = await http.put(`/inventory/${selectedItem.value.id}/outbound`, outboundForm.value)
    if (res.success) {
      showOutboundModal.value = false
      selectedItem.value = null
      fetchItems()
    }
  } catch (e) {
    console.error('Failed to outbound:', e)
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatPrice = (price?: number) => {
  if (!price) return '-'
  return `¥${price.toFixed(2)}`
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">库存管理</h1>
        <p class="text-gray-500 mt-1">管理可再利用零件的出入库</p>
      </div>
      <button
        @click="handleInbound"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-5 h-5" />
        入库
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索零件名称..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div class="flex items-center gap-2 text-gray-500">
            <Filter class="w-4 h-4" />
            <span class="text-sm font-medium">状态</span>
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
          <div class="ml-auto text-sm text-gray-500">
            共 {{ filteredItems.length }} 条记录
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">零件名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">库位</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入库时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <tr v-else-if="filteredItems.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400">
                暂无库存数据
              </td>
            </tr>
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ item.partName }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ item.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ item.weight }} kg
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ item.location || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ formatDate(item.inDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusMap[item.status].class]">
                  {{ statusMap[item.status].label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                {{ formatPrice(item.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  v-if="item.status === 'in_stock'"
                  @click="handleOutbound(item)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                >
                  <ArrowRightFromLine class="w-4 h-4" />
                  出库登记
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showOutboundModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showOutboundModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">出库登记</h3>
        <div v-if="selectedItem" class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500">零件名称</p>
            <p class="font-medium text-gray-900">{{ selectedItem.partName }}</p>
            <p class="text-sm text-gray-500 mt-2">库存数量</p>
            <p class="font-medium text-gray-900">{{ selectedItem.quantity }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">买家 *</label>
            <input
              v-model="outboundForm.buyer"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="请输入买家名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成交价格 (元)</label>
            <input
              v-model.number="outboundForm.price"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button
              @click="confirmOutbound"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认出库
            </button>
            <button
              @click="showOutboundModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
