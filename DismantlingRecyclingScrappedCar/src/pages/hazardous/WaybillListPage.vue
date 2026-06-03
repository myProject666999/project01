<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Eye, CheckCircle, Filter, Search, FileText, X } from 'lucide-vue-next'
import type { Waybill, HazardousWaste } from '../../../shared/types'
import { http } from '@/utils/request'

const route = useRoute()
const waybills = ref<Waybill[]>([])
const pendingWastes = ref<HazardousWaste[]>([])
const statusFilter = ref<'all' | 'pending' | 'completed'>('all')
const loading = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedWaybill = ref<Waybill | null>(null)
const selectedWastes = ref<number[]>([])
const formData = ref({
  disposalFactory: '',
  factoryQualification: '',
  transferDate: '',
  notes: ''
})

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待回签' },
  { key: 'completed', label: '已回签' }
] as const

const statusMap = {
  pending: { label: '待回签', class: 'bg-yellow-100 text-yellow-700' },
  transferred: { label: '转运中', class: 'bg-blue-100 text-blue-700' },
  completed: { label: '已回签', class: 'bg-green-100 text-green-700' }
}

const filteredWaybills = computed(() => {
  if (statusFilter.value === 'all') return waybills.value
  return waybills.value.filter(w => {
    if (statusFilter.value === 'pending') return !w.signedBack
    return w.signedBack
  })
})

const totalWeight = computed(() => {
  return pendingWastes.value
    .filter(w => selectedWastes.value.includes(w.id))
    .reduce((sum, w) => sum + w.weight, 0)
})

const fetchWaybills = async () => {
  loading.value = true
  try {
    const res = await http.get<Waybill[]>('/hazardous/waybills')
    if (res.success && res.data) {
      waybills.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch waybills:', e)
  } finally {
    loading.value = false
  }
}

const fetchPendingWastes = async () => {
  try {
    const res = await http.get<HazardousWaste[]>('/hazardous/wastes/pending')
    if (res.success && res.data) {
      pendingWastes.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch pending wastes:', e)
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleOpenCreate = async () => {
  formData.value = {
    disposalFactory: '',
    factoryQualification: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: ''
  }
  selectedWastes.value = []
  
  const wasteId = route.query.wasteId
  if (wasteId) {
    selectedWastes.value = [Number(wasteId)]
  }
  
  await fetchPendingWastes()
  showCreateModal.value = true
}

const handleViewDetail = async (waybill: Waybill) => {
  try {
    const res = await http.get<Waybill>(`/hazardous/waybills/${waybill.id}`)
    if (res.success && res.data) {
      selectedWaybill.value = res.data
      showDetailModal.value = true
    }
  } catch (e) {
    console.error('Failed to fetch waybill detail:', e)
  }
}

const handleSignBack = async (waybill: Waybill) => {
  if (!confirm('确认回签该联单？')) return
  
  try {
    const res = await http.put(`/hazardous/waybills/${waybill.id}/signback`)
    if (res.success) {
      await fetchWaybills()
    }
  } catch (e) {
    console.error('Failed to sign back waybill:', e)
  }
}

const handleSubmitCreate = async () => {
  if (!formData.value.disposalFactory || !formData.value.transferDate || selectedWastes.value.length === 0) {
    alert('请填写完整信息并选择危废')
    return
  }
  
  try {
    const res = await http.post('/hazardous/waybills', {
      ...formData.value,
      totalWeight: totalWeight.value,
      wasteIds: selectedWastes.value
    })
    if (res.success) {
      showCreateModal.value = false
      await fetchWaybills()
    }
  } catch (e) {
    console.error('Failed to create waybill:', e)
  }
}

const toggleWasteSelection = (wasteId: number) => {
  const index = selectedWastes.value.indexOf(wasteId)
  if (index === -1) {
    selectedWastes.value.push(wasteId)
  } else {
    selectedWastes.value.splice(index, 1)
  }
}

onMounted(() => {
  fetchWaybills()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">联单管理</h1>
        <p class="text-gray-500 mt-1">管理危废转运联单及回签流程</p>
      </div>
      <button
        @click="handleOpenCreate"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-5 h-5" />
        生成联单
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
            共 {{ filteredWaybills.length }} 条记录
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联单号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处置单位</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">转运日期</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总重量(kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否回签</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <tr v-else-if="filteredWaybills.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                暂无联单记录
              </td>
            </tr>
            <tr v-for="waybill in filteredWaybills" :key="waybill.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                {{ waybill.waybillNo }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ waybill.disposalFactory }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ formatDate(waybill.transferDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ waybill.totalWeight.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                  waybill.signedBack ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ waybill.signedBack ? '是' : '否' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusMap[waybill.status].class]">
                  {{ statusMap[waybill.status].label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleViewDetail(waybill)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                    查看详情
                  </button>
                  <button
                    v-if="!waybill.signedBack"
                    @click="handleSignBack(waybill)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <CheckCircle class="w-4 h-4" />
                    回签确认
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">生成联单</h3>
            <p class="text-sm text-gray-500 mt-1">选择待转运危废并填写处置单位信息</p>
          </div>
          <button @click="showCreateModal = false" class="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">处置单位 <span class="text-red-500">*</span></label>
              <input
                v-model="formData.disposalFactory"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="请输入处置单位名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">资质证书号</label>
              <input
                v-model="formData.factoryQualification"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="请输入资质证书号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">转运日期 <span class="text-red-500">*</span></label>
              <input
                v-model="formData.transferDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              v-model="formData.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="请输入备注信息"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">
                选择待转运危废 <span class="text-red-500">*</span>
              </label>
              <span class="text-sm text-gray-500">
                已选 {{ selectedWastes.length }} 项，总重量 {{ totalWeight.toFixed(2) }} kg
              </span>
            </div>
            <div class="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <div v-if="pendingWastes.length === 0" class="px-4 py-8 text-center text-gray-400">
                暂无待转运危废
              </div>
              <div v-else class="divide-y divide-gray-100">
                <label
                  v-for="waste in pendingWastes"
                  :key="waste.id"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="waste.id"
                    :checked="selectedWastes.includes(waste.id)"
                    @change="toggleWasteSelection(waste.id)"
                    class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900">{{ waste.name }}</span>
                      <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{{ waste.type }}</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-0.5">
                      重量：{{ waste.weight.toFixed(2) }} kg
                    </div>
                  </div>
                </label>
              </div>
            </div>
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
            @click="handleSubmitCreate"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            确认生成
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal && selectedWaybill" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">联单详情</h3>
            <p class="text-sm text-gray-500 mt-1">{{ selectedWaybill.waybillNo }}</p>
          </div>
          <button @click="showDetailModal = false" class="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">处置单位</div>
              <div class="mt-1 font-medium text-gray-900">{{ selectedWaybill.disposalFactory }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">资质证书号</div>
              <div class="mt-1 font-medium text-gray-900">{{ selectedWaybill.factoryQualification || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">转运日期</div>
              <div class="mt-1 font-medium text-gray-900">{{ formatDate(selectedWaybill.transferDate) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">总重量</div>
              <div class="mt-1 font-medium text-gray-900">{{ selectedWaybill.totalWeight.toFixed(2) }} kg</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">回签状态</div>
              <div class="mt-1">
                <span :class="[
                  'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                  selectedWaybill.signedBack ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ selectedWaybill.signedBack ? '已回签' : '待回签' }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">回签时间</div>
              <div class="mt-1 font-medium text-gray-900">{{ formatDate(selectedWaybill.signedBackAt) }}</div>
            </div>
          </div>
          <div v-if="selectedWaybill.notes">
            <div class="text-sm text-gray-500">备注</div>
            <div class="mt-1 text-gray-900">{{ selectedWaybill.notes }}</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">包含危废</div>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="bg-gray-50 px-4 py-2 grid grid-cols-3 text-xs font-medium text-gray-500">
                <div>名称</div>
                <div>类型</div>
                <div class="text-right">重量(kg)</div>
              </div>
              <div class="divide-y divide-gray-100">
                <div v-for="waste in selectedWaybill.wastes" :key="waste.id" class="px-4 py-2 grid grid-cols-3 text-sm">
                  <div class="text-gray-900">{{ waste.name }}</div>
                  <div class="text-gray-600">{{ waste.type }}</div>
                  <div class="text-right text-gray-600">{{ waste.weight.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end">
          <button
            @click="showDetailModal = false"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
