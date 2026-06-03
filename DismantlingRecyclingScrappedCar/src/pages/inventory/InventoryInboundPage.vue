<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Package, Check, AlertTriangle } from 'lucide-vue-next'
import type { DismantlingPart } from '../../../shared/types'
import { http } from '@/utils/request'

const router = useRouter()
const availableParts = ref<DismantlingPart[]>([])
const selectedPartIds = ref<number[]>([])
const loading = ref(false)
const submitting = ref(false)

const inboundItems = ref<Map<number, { location: string; price: number }>>(new Map())

const majorAssemblyLabels: Record<string, string> = {
  engine: '发动机',
  transmission: '变速箱',
  frame: '车架',
  front_axle: '前桥',
  rear_axle: '后桥',
  steering: '转向器'
}

const fetchAvailableParts = async () => {
  loading.value = true
  try {
    const res = await http.get<DismantlingPart[]>('/dismantling/parts/reusable')
    if (res.success && res.data) {
      availableParts.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch available parts:', e)
  } finally {
    loading.value = false
  }
}

const togglePartSelection = (partId: number) => {
  const index = selectedPartIds.value.indexOf(partId)
  if (index > -1) {
    selectedPartIds.value.splice(index, 1)
    inboundItems.value.delete(partId)
  } else {
    selectedPartIds.value.push(partId)
    inboundItems.value.set(partId, { location: '', price: 0 })
  }
}

const updateInboundItem = (partId: number, field: 'location' | 'price', value: string | number) => {
  const item = inboundItems.value.get(partId)
  if (item) {
    if (field === 'price') {
      item[field] = Number(value)
    } else {
      item[field] = value as string
    }
    inboundItems.value.set(partId, { ...item })
  }
}

const selectedParts = computed(() => {
  return availableParts.value.filter(p => selectedPartIds.value.includes(p.id))
})

const isFormValid = computed(() => {
  if (selectedPartIds.value.length === 0) return false
  for (const partId of selectedPartIds.value) {
    const item = inboundItems.value.get(partId)
    if (!item || !item.location) return false
  }
  return true
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('请选择零件并填写库位信息')
    return
  }
  submitting.value = true
  try {
    const items = selectedPartIds.value.map(partId => {
      const item = inboundItems.value.get(partId)!
      return {
        partId,
        location: item.location,
        price: item.price || undefined
      }
    })
    const res = await http.post('/inventory/inbound', { items })
    if (res.success) {
      router.push('/inventory')
    }
  } catch (e) {
    console.error('Failed to submit inbound:', e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAvailableParts()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <ArrowLeft class="w-5 h-5 text-gray-600" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">零件入库</h1>
        <p class="text-gray-500 mt-1">选择已拆解的可再利用零件进行入库</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">可入库零件</h2>
          <p class="text-sm text-gray-500 mt-1">已拆解且标记为可再利用的零件</p>
        </div>
        <div class="p-4 max-h-[600px] overflow-y-auto">
          <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
          <div v-else-if="availableParts.length === 0" class="text-center py-12 text-gray-400">
            暂无可用零件
          </div>
          <div v-else class="space-y-3">
            <label
              v-for="part in availableParts"
              :key="part.id"
              class="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="{
                'border-blue-500 bg-blue-50': selectedPartIds.includes(part.id),
                'border-gray-200 hover:border-gray-300': !selectedPartIds.includes(part.id)
              }"
            >
              <input
                type="checkbox"
                :checked="selectedPartIds.includes(part.id)"
                @change="togglePartSelection(part.id)"
                class="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-gray-900">{{ part.name }}</span>
                  <span v-if="part.isMajorAssembly" class="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                    <AlertTriangle class="w-3 h-3" />
                    {{ majorAssemblyLabels[part.majorAssemblyType] || '五大总成' }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{{ part.category || '未分类' }}</span>
                  <span>{{ part.weight }} kg</span>
                </div>
              </div>
              <div v-if="selectedPartIds.includes(part.id)" class="text-blue-600">
                <Check class="w-5 h-5" />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">入库信息</h2>
          <p class="text-sm text-gray-500 mt-1">已选择 {{ selectedPartIds.length }} 个零件</p>
        </div>
        <div class="p-4">
          <div v-if="selectedParts.length === 0" class="text-center py-12 text-gray-400">
            <Package class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>请从左侧选择要入库的零件</p>
          </div>
          <div v-else class="space-y-4 max-h-[450px] overflow-y-auto">
            <div
              v-for="part in selectedParts"
              :key="part.id"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="font-medium text-gray-900">{{ part.name }}</span>
                <span class="text-sm text-gray-500">{{ part.weight }} kg</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">库位 *</label>
                  <input
                    :value="inboundItems.get(part.id)?.location || ''"
                    @input="updateInboundItem(part.id, 'location', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="如：A-01-03"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">参考价格 (元)</label>
                  <input
                    :value="inboundItems.get(part.id)?.price || ''"
                    @input="updateInboundItem(part.id, 'price', ($event.target as HTMLInputElement).value)"
                    type="number"
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedParts.length > 0" class="mt-6 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600">零件总数</span>
              <span class="font-semibold text-gray-900">{{ selectedParts.length }} 件</span>
            </div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600">总重量</span>
              <span class="font-semibold text-gray-900">
                {{ selectedParts.reduce((sum, p) => sum + p.weight, 0).toFixed(2) }} kg
              </span>
            </div>
            <button
              @click="handleSubmit"
              :disabled="!isFormValid || submitting"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="w-5 h-5" />
              {{ submitting ? '提交中...' : '确认入库' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
